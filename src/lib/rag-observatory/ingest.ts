import { prisma } from "./db";
import { RAG_LIMITS } from "./config";
import { getMistral } from "./mistral";
import { upsertChunks, deleteByDocument } from "./qdrant";
import { parseFile, cleanText, chunkText, estimateTokens } from "./parse";
import { randomUUID } from "crypto";

type JobPayload = {
  parseEvents?: { type: string; label: string }[];
  cleanStats?: {
    duplicatesRemoved: number;
    formattingNormalized: number;
    ocrCorrections: number;
    rawSample: string;
    cleanedSample: string;
  };
  metadata?: Record<string, string>;
  chunks?: {
    id: string;
    tokenCount: number;
    sectionTitle: string;
    tags: string[];
  }[];
  embeds?: {
    chunkId: string;
    dimensions: number;
    model: string;
    latencyMs: number;
    tokenCount: number;
  }[];
  store?: {
    provider: string;
    vectorsStored: number;
    collections: number;
    namespaces: number;
    indexHealth: number;
  };
};

async function updateJob(
  jobId: string,
  data: {
    stage?: string;
    progress?: number;
    status?: string;
    payload?: JobPayload;
    error?: string | null;
  },
) {
  const existing = await prisma.ingestJob.findUnique({ where: { id: jobId } });
  const prev: JobPayload = existing?.payload
    ? (JSON.parse(existing.payload) as JobPayload)
    : {};
  const merged = { ...prev, ...(data.payload ?? {}) };
  await prisma.ingestJob.update({
    where: { id: jobId },
    data: {
      stage: data.stage ?? existing?.stage,
      progress: data.progress ?? existing?.progress,
      status: data.status ?? existing?.status,
      payload: JSON.stringify(merged),
      error: data.error === undefined ? existing?.error : data.error,
    },
  });
}

export async function runIngestJob(opts: {
  jobId: string;
  guestId: string;
  documentId: string;
  collectionName: string;
  filename: string;
  buffer: Buffer;
  apiKey?: string | null;
}) {
  const { jobId, guestId, documentId, collectionName, filename, buffer, apiKey } =
    opts;

  try {
    await updateJob(jobId, {
      stage: "parse",
      progress: 10,
      status: "processing",
      payload: {
        parseEvents: [
          {
            type: "ocr",
            label: filename.toLowerCase().match(/\.(png|jpe?g|webp|gif|bmp|tiff?)$/)
              ? "Sending image to Mistral OCR…"
              : filename.toLowerCase().endsWith(".pdf")
                ? "Sending PDF to Mistral OCR…"
                : "Reading file…",
          },
        ],
      },
    });

    const parsed = await parseFile(buffer, filename, apiKey);
    const parseEvents: import("./types").ParseEvent[] = [
      {
        type: "page",
        page: parsed.pagesApprox,
        label: `${parsed.pagesApprox} page${parsed.pagesApprox === 1 ? "" : "s"} extracted`,
      },
      {
        type: "ocr",
        progress: 100,
        label: parsed.ocrUsed
          ? `Mistral OCR (${parsed.ocrModel ?? RAG_LIMITS.ocrModel}) · ${parsed.pagesProcessed ?? parsed.pagesApprox} pages`
          : "Native text extract (no OCR needed)",
      },
      {
        type: "language",
        label: `Language: ${parsed.languageGuess}`,
      },
    ];
    if ((parsed.tablesDetected ?? 0) > 0) {
      parseEvents.push({
        type: "table",
        label: `${parsed.tablesDetected} table(s) detected`,
      });
    }
    if ((parsed.imagesDetected ?? 0) > 0) {
      parseEvents.push({
        type: "image",
        label: `${parsed.imagesDetected} image region(s) noted`,
      });
    }
    await updateJob(jobId, {
      stage: "parse",
      progress: 25,
      payload: { parseEvents },
    });

    await updateJob(jobId, { stage: "clean", progress: 35 });
    const cleaned = cleanText(parsed.text);
    await updateJob(jobId, {
      stage: "clean",
      progress: 45,
      payload: {
        cleanStats: {
          duplicatesRemoved: cleaned.duplicatesRemoved,
          formattingNormalized: cleaned.formattingNormalized,
          ocrCorrections: parsed.ocrUsed ? parsed.pagesProcessed ?? 1 : 0,
          rawSample: parsed.text.slice(0, 280),
          cleanedSample: cleaned.cleaned.slice(0, 280),
        },
      },
    });

    await updateJob(jobId, { stage: "metadata", progress: 50 });
    const metadata = {
      documentType: parsed.kind.toUpperCase(),
      language: parsed.languageGuess,
      department: "Sandbox",
      version: "v1",
      date: new Date().toISOString().slice(0, 10),
    };
    await updateJob(jobId, {
      stage: "metadata",
      progress: 55,
      payload: { metadata },
    });

    await updateJob(jobId, { stage: "chunk", progress: 60 });
    const chunks = chunkText(cleaned.cleaned, documentId);
    await updateJob(jobId, {
      stage: "chunk",
      progress: 65,
      payload: {
        chunks: chunks.slice(0, 24).map((c) => ({
          id: c.id,
          tokenCount: c.tokenEstimate,
          sectionTitle: c.sectionTitle,
          strategy: c.strategy,
          tags: [parsed.kind, c.strategy, ...c.tags],
        })),
      },
    });

    const embedTokens = chunks.reduce((s, c) => s + c.tokenEstimate, 0);
    if (!apiKey?.trim()) {
      const guest = await prisma.guest.findUniqueOrThrow({ where: { id: guestId } });
      if (guest.embeddingTokensUsed + embedTokens > RAG_LIMITS.maxEmbeddingTokensLifetime) {
        throw new Error(
          "Embedding this file would exceed the free embedding token budget. Add your API key in Settings.",
        );
      }
    }

    await updateJob(jobId, { stage: "embed", progress: 70 });
    const mistral = getMistral(apiKey);
    const embedsMeta: JobPayload["embeds"] = [];
    const vectors: number[][] = [];

    const batchSize = 16;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const t0 = Date.now();
      const res = await mistral.embeddings.create({
        model: RAG_LIMITS.embeddingModel,
        inputs: batch.map((c) => c.text.slice(0, 6000)),
      });
      const latency = Date.now() - t0;
      const data = res.data ?? [];
      for (let j = 0; j < batch.length; j++) {
        const vec = data[j]?.embedding as number[] | undefined;
        if (!vec) throw new Error("Embedding API returned empty vector.");
        vectors.push(vec);
        embedsMeta.push({
          chunkId: batch[j].id,
          dimensions: vec.length,
          model: RAG_LIMITS.embeddingModel,
          latencyMs: latency,
          tokenCount: batch[j].tokenEstimate,
        });
      }
      await updateJob(jobId, {
        stage: "embed",
        progress: 70 + Math.round(((i + batch.length) / chunks.length) * 15),
        payload: { embeds: embedsMeta.slice(-8) },
      });
    }

    await updateJob(jobId, { stage: "store", progress: 90 });
    await deleteByDocument(collectionName, documentId);

    const points = chunks.map((c, i) => ({
      id: randomUUID(),
      vector: vectors[i],
      payload: {
        documentId,
        chunkId: c.id,
        text: c.text,
        sectionTitle: c.sectionTitle,
        filename,
        guestId,
        kind: parsed.kind,
        strategy: c.strategy,
        keywords: c.text
          .toLowerCase()
          .split(/[^a-z0-9]+/i)
          .filter((t) => t.length > 3)
          .slice(0, 40),
      },
    }));

    // upsert in batches
    for (let i = 0; i < points.length; i += 64) {
      await upsertChunks(collectionName, points.slice(i, i + 64));
    }

    await updateJob(jobId, {
      stage: "ready",
      progress: 100,
      status: "ready",
      payload: {
        store: {
          provider: "Qdrant",
          vectorsStored: points.length,
          collections: 1,
          namespaces: 1,
          indexHealth: 99.9,
        },
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "ready",
        chunkCount: chunks.length,
        kind: parsed.kind,
      },
    });

    await prisma.guest.update({
      where: { id: guestId },
      data: {
        uploadCount: { increment: 1 },
        embeddingTokensUsed: { increment: embedTokens },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingestion failed";
    await updateJob(jobId, {
      status: "failed",
      error: message,
      progress: 100,
    });
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "failed" },
    });
  }
}

export function estimateUploadTokens(buffer: Buffer): number {
  return estimateTokens(buffer.toString("utf8").slice(0, 200_000));
}
