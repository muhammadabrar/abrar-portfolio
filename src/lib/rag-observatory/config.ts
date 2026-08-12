export const RAG_LIMITS = {
  maxUploadsFree: 3,
  maxQueriesPerDay: 10,
  maxEmbeddingTokensLifetime: 50_000,
  maxLlmTokensPerDay: 30_000,
  maxContextTokensPerQuery: 4_000,
  maxFileBytesFree: 5 * 1024 * 1024,
  maxFileBytesByok: 20 * 1024 * 1024,
  ttlMs: 2 * 24 * 60 * 60 * 1000,
  embeddingModel: "mistral-embed",
  chatModel: "mistral-small-latest",
  ocrModel: "mistral-ocr-latest",
  chunkSize: 800,
  chunkOverlap: 120,
  topK: 8,
} as const;

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function collectionNameForGuest(guestId: string): string {
  const safe = guestId.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 48);
  return `guest_${safe || "unknown"}`;
}
