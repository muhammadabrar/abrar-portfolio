import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "./db";
import { collectionNameForGuest, utcDayKey, RAG_LIMITS } from "./config";
import { ensureCollection } from "./qdrant";

export const GUEST_COOKIE = "rag_guest_id";
export const GUEST_HEADER = "x-guest-id";

export async function resolveGuestId(req?: Request): Promise<string> {
  const fromHeader = req?.headers.get(GUEST_HEADER)?.trim();
  if (fromHeader && /^[0-9a-f-]{36}$/i.test(fromHeader)) {
    return fromHeader;
  }
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) {
    return existing;
  }
  return randomUUID();
}

export async function ensureGuest(guestId: string) {
  const collectionName = collectionNameForGuest(guestId);
  let guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        id: guestId,
        collectionName,
        dayKey: utcDayKey(),
      },
    });
    try {
      await ensureCollection(collectionName);
    } catch {
      // Qdrant may be offline in local UI-only work; guest row still exists
    }
  } else {
    const day = utcDayKey();
    if (guest.dayKey !== day) {
      guest = await prisma.guest.update({
        where: { id: guestId },
        data: {
          dayKey: day,
          dailyQueryCount: 0,
          dailyTokenCount: 0,
        },
      });
    }
  }
  return guest;
}

export function isByok(apiKey?: string | null) {
  return Boolean(apiKey?.trim());
}

export function assertCanUpload(
  guest: { uploadCount: number; embeddingTokensUsed: number },
  byok: boolean,
) {
  if (byok) return;
  if (guest.uploadCount >= RAG_LIMITS.maxUploadsFree) {
    throw new QuotaError(
      `Free plan allows ${RAG_LIMITS.maxUploadsFree} uploads. Add your Mistral API key in Settings for more.`,
    );
  }
  if (guest.embeddingTokensUsed >= RAG_LIMITS.maxEmbeddingTokensLifetime) {
    throw new QuotaError(
      "Embedding token budget used up. Add your Mistral API key in Settings.",
    );
  }
}

export function assertCanQuery(
  guest: { dailyQueryCount: number; dailyTokenCount: number },
  byok: boolean,
) {
  if (byok) return;
  if (guest.dailyQueryCount >= RAG_LIMITS.maxQueriesPerDay) {
    throw new QuotaError(
      `Daily limit of ${RAG_LIMITS.maxQueriesPerDay} playground queries reached. Add your API key in Settings.`,
    );
  }
  if (guest.dailyTokenCount >= RAG_LIMITS.maxLlmTokensPerDay) {
    throw new QuotaError(
      "Daily LLM token budget reached. Add your Mistral API key in Settings.",
    );
  }
}

export class QuotaError extends Error {
  status = 429;
  constructor(message: string) {
    super(message);
    this.name = "QuotaError";
  }
}

export function guestPublicView(guest: {
  id: string;
  uploadCount: number;
  embeddingTokensUsed: number;
  dailyQueryCount: number;
  dailyTokenCount: number;
  dayKey: string;
  collectionName: string;
  createdAt: Date;
}) {
  return {
    guestId: guest.id,
    uploadsUsed: guest.uploadCount,
    uploadsMax: RAG_LIMITS.maxUploadsFree,
    embeddingTokensUsed: guest.embeddingTokensUsed,
    embeddingTokensMax: RAG_LIMITS.maxEmbeddingTokensLifetime,
    queriesToday: guest.dailyQueryCount,
    queriesMax: RAG_LIMITS.maxQueriesPerDay,
    llmTokensToday: guest.dailyTokenCount,
    llmTokensMax: RAG_LIMITS.maxLlmTokensPerDay,
    dayKey: guest.dayKey,
    collectionName: guest.collectionName,
    createdAt: guest.createdAt.toISOString(),
    ttlHours: RAG_LIMITS.ttlMs / (60 * 60 * 1000),
  };
}
