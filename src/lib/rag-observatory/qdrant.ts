import { QdrantClient } from "@qdrant/js-client-rest";
import { RAG_LIMITS } from "./config";

export function getQdrant() {
  const url = process.env.QDRANT_URL;
  if (!url) {
    throw new Error("QDRANT_URL is not set in the environment.");
  }
  const apiKey = process.env.QDRANT_API_KEY || undefined;
  return new QdrantClient({ url, apiKey });
}

/** mistral-embed dimension */
export const EMBED_DIM = 1024;

export async function ensureCollection(collectionName: string) {
  const client = getQdrant();
  const exists = await client.collectionExists(collectionName);
  if (!exists.exists) {
    await client.createCollection(collectionName, {
      vectors: { size: EMBED_DIM, distance: "Cosine" },
    });
  }
  return client;
}

export async function deleteCollectionIfExists(collectionName: string) {
  const client = getQdrant();
  const exists = await client.collectionExists(collectionName);
  if (exists.exists) {
    await client.deleteCollection(collectionName);
  }
}

export async function upsertChunks(
  collectionName: string,
  points: {
    id: string | number;
    vector: number[];
    payload: Record<string, unknown>;
  }[],
) {
  const client = await ensureCollection(collectionName);
  await client.upsert(collectionName, {
    wait: true,
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    })),
  });
}

export async function deleteByDocument(
  collectionName: string,
  documentId: string,
) {
  const client = getQdrant();
  const exists = await client.collectionExists(collectionName);
  if (!exists.exists) return;
  await client.delete(collectionName, {
    wait: true,
    filter: {
      must: [{ key: "documentId", match: { value: documentId } }],
    },
  });
}

export async function searchChunks(
  collectionName: string,
  vector: number[],
  limit: number = RAG_LIMITS.topK,
  filter?: Record<string, unknown>,
) {
  const client = getQdrant();
  const exists = await client.collectionExists(collectionName);
  if (!exists.exists) return [];
  const res = await client.query(collectionName, {
    query: vector,
    limit,
    with_payload: true,
    ...(filter ? { filter } : {}),
  });
  return (res.points ?? []).map((p) => ({
    id: p.id,
    score: p.score ?? 0,
    payload: (p.payload ?? {}) as Record<string, unknown>,
  }));
}

/** Scroll payloads for BM25-lite / keyword hybrid (guest collections stay small). */
export async function scrollChunkPayloads(
  collectionName: string,
  limit = 200,
) {
  const client = getQdrant();
  const exists = await client.collectionExists(collectionName);
  if (!exists.exists) return [];
  const res = await client.scroll(collectionName, {
    limit,
    with_payload: true,
    with_vector: false,
  });
  return (res.points ?? []).map((p) => ({
    id: p.id,
    payload: (p.payload ?? {}) as Record<string, unknown>,
  }));
}
