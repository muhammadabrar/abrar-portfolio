export type SourceKind =
  | "pdf"
  | "markdown"
  | "docx"
  | "csv"
  | "image"
  | "website"
  | "api";

export type FileStatus = "queued" | "processing" | "ready" | "failed";

export type IngestionStageId =
  | "upload"
  | "parse"
  | "clean"
  | "metadata"
  | "chunk"
  | "embed"
  | "store"
  | "index"
  | "ready";

export type StageStatus = "pending" | "active" | "done" | "error";

export type SourceFile = {
  id: string;
  name: string;
  kind: SourceKind;
  pages?: number;
  sizeLabel: string;
  status: FileStatus;
  uploadedAt: string;
};

export type ParseEvent =
  | { type: "page"; page?: number; label: string }
  | { type: "table"; label: string }
  | { type: "image"; label: string }
  | { type: "language"; label: string }
  | { type: "ocr"; progress?: number; label: string };

export type CleanStats = {
  duplicatesRemoved: number;
  formattingNormalized: number;
  ocrCorrections: number;
  rawSample: string;
  cleanedSample: string;
};

export type MetadataFields = {
  documentType: string;
  language: string;
  department: string;
  version: string;
  date: string;
};

export type ChunkCard = {
  id: string;
  tokenCount: number;
  sectionTitle: string;
  tags: string[];
  strategy?: string;
};

export type EmbedInfo = {
  chunkId: string;
  dimensions: number;
  model: string;
  latencyMs: number;
  tokenCount: number;
};

export type StoreStats = {
  provider: "Qdrant" | "Pinecone" | "Weaviate";
  vectorsStored: number;
  collections: number;
  namespaces: number;
  indexHealth: number;
};

export type IngestionStageState = {
  id: IngestionStageId;
  label: string;
  status: StageStatus;
  durationMs?: number;
};

export type IngestionRun = {
  fileId: string;
  stages: IngestionStageState[];
  parseEvents: ParseEvent[];
  cleanStats: CleanStats | null;
  metadata: Partial<MetadataFields>;
  chunks: ChunkCard[];
  embeds: EmbedInfo[];
  store: StoreStats | null;
  progress: number;
  activeStage: IngestionStageId | null;
  completed: boolean;
};

export type KnowledgeDoc = {
  id: string;
  name: string;
  kind: SourceKind;
  chunks: number;
  embeddings: number;
  storageMb: number;
  updatedAt: string;
  department: string;
  status: "indexed" | "indexing";
};

export type MetricSeries = {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  series: number[];
  unit?: string;
};

export type PipelineRun = {
  id: string;
  type: "ingestion" | "query";
  title: string;
  status: "success" | "running" | "failed";
  startedAt: string;
  durationMs: number;
  stages: { name: string; ms: number }[];
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  label: string;
  durationMs: number;
  detail?: string;
};

export type EvalRun = {
  id: string;
  name: string;
  faithfulness: number;
  relevance: number;
  groundedness: number;
  latencyMs: number;
  samples: number;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type QueryUnderstanding = {
  original: string;
  intent: string;
  entities: string[];
  filters: string[];
  expandedQueries: string[];
  rewrittenQuery?: string;
};

export type RetrievedDoc = {
  id: string;
  title: string;
  score: number;
  snippet: string;
  source: string;
  channel?: "vector" | "keyword" | "hybrid";
};

export type ContextChunk = {
  id: string;
  title: string;
  tokens: number;
  source: string;
  compressed?: boolean;
};

export type Explainability = {
  confidence: number;
  sources: string[];
  chunksReferenced: string[];
  reasoningPath: string[];
  citations: { text: string; source: string }[];
};

export type ClaimVerdict = "SUPPORTED" | "CONTRADICTED" | "NOT_SUPPORTED";

export type ClaimEval = {
  id: string;
  claim: string;
  verdict: ClaimVerdict;
  confidence: number;
  evidenceChunkIds: string[];
  evidenceSources: string[];
  reason: string;
};

export type GroundedEvaluation = {
  claims: ClaimEval[];
  groundedness: number;
  contradictionRate: number;
  citationCoverage: number;
  unsupportedCount: number;
  contradictedCount: number;
  note?: string;
  usageTokens?: number;
};

export type QueryAuditState = {
  phase:
    | "idle"
    | "rewrite"
    | "metadataFilter"
    | "hybrid"
    | "rerank"
    | "context"
    | "generation"
    | "evaluation"
    | "done";
  understanding: QueryUnderstanding | null;
  metadataFilters: string[];
  vectorHits: RetrievedDoc[];
  keywordHits: RetrievedDoc[];
  candidates: RetrievedDoc[];
  reranked: RetrievedDoc[];
  selected: RetrievedDoc[];
  contextChunks: ContextChunk[];
  contextTokensUsed: number;
  contextTokensMax: number;
  streamingAnswer: string;
  fullAnswer: string;
  explainability: Explainability | null;
  groundedEvaluation: GroundedEvaluation | null;
  timeline: AuditEntry[];
};

export type RagSettings = {
  embeddingModel: string;
  llmModel: string;
  chunkSize: number;
  chunkOverlap: number;
  vectorProvider: "Qdrant" | "Pinecone" | "Weaviate";
  topK: number;
  rerankEnabled: boolean;
};
