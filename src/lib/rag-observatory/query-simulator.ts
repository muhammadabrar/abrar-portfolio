import {
  DEMO_ANSWER,
  DEMO_QUERY,
} from "./mock-documents";
import type {
  AuditEntry,
  ContextChunk,
  Explainability,
  QueryAuditState,
  RetrievedDoc,
} from "./types";

const VECTOR_HITS: RetrievedDoc[] = [
  {
    id: "d1",
    title: "Germany Revenue — Q2 Performance",
    score: 0.71,
    snippet: "Germany revenue reached €142.6M in Q2 2025…",
    source: "Q2_Germany_Revenue.docx",
    channel: "vector",
  },
  {
    id: "d2",
    title: "Annual Report §4.2 Regional Results",
    score: 0.68,
    snippet: "DACH region led EMEA growth with Germany at 18.4% YoY…",
    source: "Annual_Report_2025.pdf",
    channel: "vector",
  },
  {
    id: "d3",
    title: "Quarterly Breakdown — Segments",
    score: 0.64,
    snippet: "Enterprise software +22%, professional services +14%…",
    source: "Q2_Germany_Revenue.docx",
    channel: "vector",
  },
];

const KEYWORD_HITS: RetrievedDoc[] = [
  {
    id: "d1",
    title: "Germany Revenue — Q2 Performance",
    score: 4.2,
    snippet: "Germany revenue reached €142.6M in Q2 2025…",
    source: "Q2_Germany_Revenue.docx",
    channel: "keyword",
  },
  {
    id: "d4",
    title: "Financial Results Overview",
    score: 2.8,
    snippet: "Consolidated revenue and regional contribution…",
    source: "Annual_Report_2025.pdf",
    channel: "keyword",
  },
];

const FUSED: RetrievedDoc[] = [
  {
    id: "d1",
    title: "Germany Revenue — Q2 Performance",
    score: 0.032,
    snippet: "Germany revenue reached €142.6M in Q2 2025…",
    source: "Q2_Germany_Revenue.docx",
    channel: "hybrid",
  },
  {
    id: "d2",
    title: "Annual Report §4.2 Regional Results",
    score: 0.028,
    snippet: "DACH region led EMEA growth with Germany at 18.4% YoY…",
    source: "Annual_Report_2025.pdf",
    channel: "hybrid",
  },
  {
    id: "d3",
    title: "Quarterly Breakdown — Segments",
    score: 0.024,
    snippet: "Enterprise software +22%, professional services +14%…",
    source: "Q2_Germany_Revenue.docx",
    channel: "hybrid",
  },
  {
    id: "d4",
    title: "Financial Results Overview",
    score: 0.02,
    snippet: "Consolidated revenue and regional contribution…",
    source: "Annual_Report_2025.pdf",
    channel: "hybrid",
  },
];

const RERANK_SCORES: Record<string, number> = {
  d1: 98,
  d2: 92,
  d3: 89,
  d4: 81,
};

const CONTEXT: ContextChunk[] = [
  {
    id: "Chunk 12",
    title: "Financial Results",
    tokens: 386,
    source: "Annual_Report_2025.pdf",
    compressed: true,
  },
  {
    id: "Chunk 19",
    title: "Germany Revenue",
    tokens: 401,
    source: "Q2_Germany_Revenue.docx",
  },
  {
    id: "Chunk 24",
    title: "Quarterly Breakdown",
    tokens: 355,
    source: "Q2_Germany_Revenue.docx",
    compressed: true,
  },
];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function createIdleAudit(): QueryAuditState {
  return {
    phase: "idle",
    understanding: null,
    metadataFilters: [],
    vectorHits: [],
    keywordHits: [],
    candidates: [],
    reranked: [],
    selected: [],
    contextChunks: [],
    contextTokensUsed: 0,
    contextTokensMax: 4000,
    streamingAnswer: "",
    fullAnswer: "",
    explainability: null,
    groundedEvaluation: null,
    timeline: [],
  };
}

export type QueryListener = (state: QueryAuditState) => void;

export async function runQuerySimulation(
  question: string,
  onUpdate: QueryListener,
  signal?: AbortSignal,
  speed = 1,
): Promise<QueryAuditState> {
  let state = createIdleAudit();
  const emit = (next: QueryAuditState) => {
    state = next;
    onUpdate({ ...next });
  };

  const d = (ms: number) => Math.max(30, ms / speed);
  const t0 = Date.now();
  const pushTimeline = (label: string, durationMs: number, detail?: string) => {
    const entry: AuditEntry = {
      id: `t-${state.timeline.length + 1}`,
      timestamp: new Date(t0 + Date.now() - t0).toISOString(),
      label,
      durationMs,
      detail,
    };
    return [...state.timeline, entry];
  };

  const q = question.trim() || DEMO_QUERY;

  emit({
    ...state,
    phase: "rewrite",
    timeline: pushTimeline("Query received", 0, q),
  });
  await sleep(d(400), signal);

  emit({
    ...state,
    understanding: {
      original: q,
      intent: "Financial metric lookup",
      rewrittenQuery: "Germany Q2 2025 revenue growth YoY",
      entities: ["Revenue Growth", "Germany", "Q2 2025"],
      filters: ["region:Germany", "period:Q2-2025", "doc_type:financial"],
      expandedQueries: [
        "Germany revenue Q2 2025",
        "German market financial report",
        "Q2 performance Germany YoY growth",
      ],
    },
    timeline: pushTimeline("Query rewrite", 80),
  });

  emit({
    ...state,
    phase: "metadataFilter",
    metadataFilters: [
      "permission:guest_collection_only",
      "region:Germany",
      "period:Q2-2025",
      "doc_type:financial",
    ],
    timeline: pushTimeline("Metadata / permission filter", 40),
  });
  await sleep(d(250), signal);

  emit({
    ...state,
    phase: "hybrid",
    timeline: pushTimeline("Hybrid retrieval started", 0),
  });
  await sleep(d(200), signal);
  emit({
    ...state,
    vectorHits: VECTOR_HITS,
    keywordHits: KEYWORD_HITS,
    candidates: FUSED,
    timeline: pushTimeline(
      "Hybrid retrieval (vector + BM25)",
      210,
      "RRF fuse",
    ),
  });

  emit({ ...state, phase: "rerank" });
  const reranked = [...FUSED]
    .map((c) => ({ ...c, score: RERANK_SCORES[c.id] ?? c.score * 100 }))
    .sort((a, b) => b.score - a.score);
  for (let i = 1; i <= reranked.length; i++) {
    await sleep(d(70), signal);
    emit({ ...state, reranked: reranked.slice(0, i) });
  }
  const selected = reranked.slice(0, 3);
  emit({
    ...state,
    selected,
    timeline: pushTimeline("Reranking", 140, "Top fused → top evidence"),
  });

  emit({ ...state, phase: "context" });
  let tokens = 0;
  const chunks: ContextChunk[] = [];
  for (const ch of CONTEXT) {
    await sleep(d(120), signal);
    chunks.push(ch);
    tokens += ch.tokens;
    emit({
      ...state,
      contextChunks: [...chunks],
      contextTokensUsed: tokens,
    });
  }
  emit({
    ...state,
    timeline: pushTimeline(
      "Context selection / compression",
      80,
      `${tokens} tokens`,
    ),
  });

  emit({
    ...state,
    phase: "generation",
    timeline: pushTimeline("LLM generation", 0),
  });

  const answer = DEMO_ANSWER;
  let streamed = "";
  const words = answer.split(/(\s+)/);
  for (const w of words) {
    await sleep(d(28), signal);
    streamed += w;
    emit({ ...state, streamingAnswer: streamed });
  }

  const explainability: Explainability = {
    confidence: 0.93,
    sources: ["Q2_Germany_Revenue.docx", "Annual_Report_2025.pdf §4.2"],
    chunksReferenced: ["Chunk 12", "Chunk 19", "Chunk 24"],
    reasoningPath: [
      "Query rewrite → searchable intent + entities",
      "Permission / metadata boundary",
      "Hybrid retrieval: Qdrant + BM25 (RRF)",
      "Rerank + context compression",
      "Grounded LLM generation with citations",
    ],
    citations: [
      {
        text: "18.4% year-over-year",
        source: "Chunk 19 · Q2_Germany_Revenue.docx",
      },
      { text: "€142.6M", source: "Chunk 19 · Q2_Germany_Revenue.docx" },
      {
        text: "enterprise software (+22%)",
        source: "Chunk 24 · Quarterly Breakdown",
      },
    ],
  };

  emit({
    ...state,
    phase: "evaluation",
    groundedEvaluation: {
      claims: [
        {
          id: "claim-1",
          claim: "Germany revenue reached €142.6M in Q2 2025.",
          verdict: "SUPPORTED",
          confidence: 0.94,
          evidenceChunkIds: ["Chunk 19"],
          evidenceSources: ["Q2_Germany_Revenue.docx"],
          reason: "Evidence states Germany revenue of €142.6M for Q2 2025.",
        },
        {
          id: "claim-2",
          claim: "Germany grew 18.4% year-over-year.",
          verdict: "SUPPORTED",
          confidence: 0.91,
          evidenceChunkIds: ["Chunk 19"],
          evidenceSources: ["Q2_Germany_Revenue.docx"],
          reason: "Evidence cites 18.4% YoY growth for Germany.",
        },
        {
          id: "claim-3",
          claim: "The company has more than 50 employees in Germany.",
          verdict: "NOT_SUPPORTED",
          confidence: 0.72,
          evidenceChunkIds: [],
          evidenceSources: [],
          reason: "Retrieved context does not mention employee headcount.",
        },
      ],
      groundedness: 2 / 3,
      contradictionRate: 0,
      citationCoverage: 2 / 3,
      unsupportedCount: 1,
      contradictedCount: 0,
    },
    timeline: pushTimeline("Claim-level evaluation", 180),
  });

  emit({
    ...state,
    phase: "done",
    fullAnswer: answer,
    streamingAnswer: answer,
    explainability,
    timeline: [
      ...pushTimeline("Citation / grounding package", 20),
      {
        id: `t-${state.timeline.length + 2}`,
        timestamp: new Date().toISOString(),
        label: "Response delivered",
        durationMs: 15,
      },
    ],
  });

  return state;
}
