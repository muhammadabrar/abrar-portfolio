import type {
  KnowledgeDoc,
  MetricSeries,
  PipelineRun,
  EvalRun,
  SourceFile,
  AuditEntry,
} from "./types";

export const SEED_SOURCES: SourceFile[] = [
  {
    id: "src-1",
    name: "Annual_Report_2025.pdf",
    kind: "pdf",
    pages: 287,
    sizeLabel: "24.1 MB",
    status: "ready",
    uploadedAt: "2025-07-18T09:12:00Z",
  },
  {
    id: "src-2",
    name: "Company_Policies.md",
    kind: "markdown",
    sizeLabel: "186 KB",
    status: "ready",
    uploadedAt: "2025-07-16T14:30:00Z",
  },
  {
    id: "src-3",
    name: "Q2_Germany_Revenue.docx",
    kind: "docx",
    pages: 42,
    sizeLabel: "3.4 MB",
    status: "ready",
    uploadedAt: "2025-07-20T11:05:00Z",
  },
];

export const SEED_KNOWLEDGE: KnowledgeDoc[] = [
  {
    id: "kb-1",
    name: "Annual_Report_2025.pdf",
    kind: "pdf",
    chunks: 1842,
    embeddings: 1842,
    storageMb: 48.2,
    updatedAt: "2025-07-18T09:18:00Z",
    department: "Finance",
    status: "indexed",
  },
  {
    id: "kb-2",
    name: "Company_Policies.md",
    kind: "markdown",
    chunks: 96,
    embeddings: 96,
    storageMb: 1.1,
    updatedAt: "2025-07-16T14:32:00Z",
    department: "Legal",
    status: "indexed",
  },
  {
    id: "kb-3",
    name: "Q2_Germany_Revenue.docx",
    kind: "docx",
    chunks: 214,
    embeddings: 214,
    storageMb: 5.6,
    updatedAt: "2025-07-20T11:09:00Z",
    department: "Finance",
    status: "indexed",
  },
  {
    id: "kb-4",
    name: "Product_Roadmap_H2.csv",
    kind: "csv",
    chunks: 48,
    embeddings: 48,
    storageMb: 0.4,
    updatedAt: "2025-07-12T08:00:00Z",
    department: "Product",
    status: "indexed",
  },
];

export const DASHBOARD_METRICS: MetricSeries[] = [
  {
    label: "Retrieval Latency",
    value: "86",
    unit: "ms",
    delta: "−12%",
    deltaPositive: true,
    series: [120, 110, 98, 105, 92, 88, 86, 90, 84, 86],
  },
  {
    label: "Embedding Latency",
    value: "142",
    unit: "ms",
    delta: "−4%",
    deltaPositive: true,
    series: [160, 155, 150, 148, 145, 140, 142, 138, 144, 142],
  },
  {
    label: "LLM Latency",
    value: "1.24",
    unit: "s",
    delta: "+3%",
    deltaPositive: false,
    series: [1.1, 1.15, 1.2, 1.18, 1.22, 1.3, 1.28, 1.25, 1.22, 1.24],
  },
  {
    label: "Avg Response Time",
    value: "1.68",
    unit: "s",
    delta: "−8%",
    deltaPositive: true,
    series: [2.1, 1.95, 1.88, 1.8, 1.75, 1.7, 1.72, 1.69, 1.65, 1.68],
  },
  {
    label: "Token Consumption",
    value: "2.4M",
    unit: "/day",
    delta: "+18%",
    deltaPositive: false,
    series: [1.8, 1.9, 2.0, 2.1, 2.15, 2.2, 2.3, 2.35, 2.38, 2.4],
  },
  {
    label: "Vector DB Health",
    value: "99.7",
    unit: "%",
    delta: "+0.1%",
    deltaPositive: true,
    series: [99.4, 99.5, 99.5, 99.6, 99.6, 99.7, 99.7, 99.6, 99.7, 99.7],
  },
  {
    label: "Success Rate",
    value: "98.4",
    unit: "%",
    delta: "+0.6%",
    deltaPositive: true,
    series: [97.2, 97.5, 97.8, 97.9, 98.0, 98.1, 98.2, 98.3, 98.3, 98.4],
  },
  {
    label: "Cost Per Query",
    value: "$0.014",
    delta: "−9%",
    deltaPositive: true,
    series: [0.02, 0.019, 0.018, 0.017, 0.016, 0.015, 0.015, 0.014, 0.014, 0.014],
  },
];

export const PIPELINE_RUNS: PipelineRun[] = [
  {
    id: "run-1",
    type: "ingestion",
    title: "Annual_Report_2025.pdf",
    status: "success",
    startedAt: "2025-07-18T09:12:00Z",
    durationMs: 48200,
    stages: [
      { name: "Parse", ms: 12400 },
      { name: "Clean", ms: 3200 },
      { name: "Chunk", ms: 8100 },
      { name: "Embed", ms: 18200 },
      { name: "Index", ms: 6300 },
    ],
  },
  {
    id: "run-2",
    type: "query",
    title: "Germany Q2 revenue growth",
    status: "success",
    startedAt: "2025-07-20T15:44:00Z",
    durationMs: 1840,
    stages: [
      { name: "Understand", ms: 80 },
      { name: "Retrieve", ms: 210 },
      { name: "Rerank", ms: 140 },
      { name: "Generate", ms: 1410 },
    ],
  },
  {
    id: "run-3",
    type: "ingestion",
    title: "Q2_Germany_Revenue.docx",
    status: "success",
    startedAt: "2025-07-20T11:05:00Z",
    durationMs: 21400,
    stages: [
      { name: "Parse", ms: 5400 },
      { name: "Clean", ms: 1800 },
      { name: "Chunk", ms: 3600 },
      { name: "Embed", ms: 8200 },
      { name: "Index", ms: 2400 },
    ],
  },
  {
    id: "run-4",
    type: "query",
    title: "Leave policy for parental leave",
    status: "success",
    startedAt: "2025-07-19T10:22:00Z",
    durationMs: 1520,
    stages: [
      { name: "Understand", ms: 60 },
      { name: "Retrieve", ms: 180 },
      { name: "Rerank", ms: 110 },
      { name: "Generate", ms: 1170 },
    ],
  },
  {
    id: "run-5",
    type: "ingestion",
    title: "docs.internal/api/v3",
    status: "failed",
    startedAt: "2025-07-17T16:01:00Z",
    durationMs: 8900,
    stages: [
      { name: "Parse", ms: 2100 },
      { name: "Clean", ms: 900 },
      { name: "Chunk", ms: 0 },
    ],
  },
];

export const EVAL_RUNS: EvalRun[] = [
  {
    id: "eval-1",
    name: "Finance QA Golden Set",
    faithfulness: 0.94,
    relevance: 0.91,
    groundedness: 0.96,
    latencyMs: 1680,
    samples: 120,
    updatedAt: "2025-07-21T08:00:00Z",
  },
  {
    id: "eval-2",
    name: "Policy Retrieval Bench",
    faithfulness: 0.97,
    relevance: 0.93,
    groundedness: 0.98,
    latencyMs: 980,
    samples: 64,
    updatedAt: "2025-07-19T12:30:00Z",
  },
  {
    id: "eval-3",
    name: "Multi-hop Reasoning",
    faithfulness: 0.88,
    relevance: 0.85,
    groundedness: 0.9,
    latencyMs: 2420,
    samples: 40,
    updatedAt: "2025-07-15T09:00:00Z",
  },
];

export const AUDIT_HISTORY: AuditEntry[] = [
  {
    id: "a1",
    timestamp: "2025-07-20T15:44:01.000Z",
    label: "Query Received",
    durationMs: 0,
    detail: "Germany Q2 revenue growth",
  },
  {
    id: "a2",
    timestamp: "2025-07-20T15:44:01.080Z",
    label: "Query Expanded",
    durationMs: 80,
  },
  {
    id: "a3",
    timestamp: "2025-07-20T15:44:01.290Z",
    label: "Retrieval Started",
    durationMs: 210,
  },
  {
    id: "a4",
    timestamp: "2025-07-20T15:44:01.430Z",
    label: "Reranking Complete",
    durationMs: 140,
  },
  {
    id: "a5",
    timestamp: "2025-07-20T15:44:01.510Z",
    label: "Context Built",
    durationMs: 80,
  },
  {
    id: "a6",
    timestamp: "2025-07-20T15:44:02.920Z",
    label: "LLM Generated Answer",
    durationMs: 1410,
  },
  {
    id: "a7",
    timestamp: "2025-07-20T15:44:02.940Z",
    label: "Response Delivered",
    durationMs: 20,
  },
];

export const DEMO_QUERY =
  "What does this document say about the main topic?";

export const DEMO_ANSWER = `In Q2 2025, revenue in Germany grew **18.4% year-over-year**, reaching **€142.6M**.

Growth was led by enterprise software (+22%) and professional services (+14%). Regional expansion in DACH and stronger renewals in the mid-market segment contributed most of the lift versus Q2 2024 (€120.4M).

*Sources: Q2 Germany Revenue report (Chunks 12, 19, 24); Annual Report 2025 §4.2.*`;

export function kindFromFilename(name: string): SourceFile["kind"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "docx";
  if (lower.endsWith(".csv")) return "csv";
  if (/\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(lower)) return "image";
  return "pdf";
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}
