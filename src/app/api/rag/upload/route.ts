import { NextResponse } from "next/server";
import { prisma } from "@/lib/rag-observatory/db";
import {
  assertCanUpload,
  ensureGuest,
  isByok,
  QuotaError,
  resolveGuestId,
} from "@/lib/rag-observatory/guest";
import { RAG_LIMITS } from "@/lib/rag-observatory/config";
import { runIngestJob } from "@/lib/rag-observatory/ingest";
import { purgeExpiredDocuments } from "@/lib/rag-observatory/ttl";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    await purgeExpiredDocuments();
    const guestId = await resolveGuestId(req);
    const guest = await ensureGuest(guestId);
    const apiKey = req.headers.get("x-mistral-key");
    const byok = isByok(apiKey);
    assertCanUpload(guest, byok);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const maxBytes = byok
      ? RAG_LIMITS.maxFileBytesByok
      : RAG_LIMITS.maxFileBytesFree;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `File too large. Max ${Math.round(maxBytes / (1024 * 1024))}MB on this plan.`,
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const expiresAt = new Date(Date.now() + RAG_LIMITS.ttlMs);

    const document = await prisma.document.create({
      data: {
        guestId,
        name: file.name,
        kind: "pending",
        sizeBytes: file.size,
        status: "processing",
        expiresAt,
      },
    });

    const job = await prisma.ingestJob.create({
      data: {
        guestId,
        documentId: document.id,
        status: "processing",
        stage: "upload",
        progress: 5,
        payload: JSON.stringify({}),
      },
    });

    // Fire-and-forget ingest (same process)
    void runIngestJob({
      jobId: job.id,
      guestId,
      documentId: document.id,
      collectionName: guest.collectionName,
      filename: file.name,
      buffer,
      apiKey,
    });

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      jobId: job.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof QuotaError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
