export const STAGE_HELP = {
  upload: {
    title: "Data sources",
    plain:
      "Production RAG starts with trusted sources: PDFs, databases, APIs, and web pages. Each source is versioned so answers can be traced back.",
    detail:
      "In real systems you also track who owns the file, retention policy, and whether PII must be redacted before indexing.",
    test: "Use a short PDF you know well so you can verify citations later.",
  },
  parse: {
    title: "Parsing",
    plain:
      "Parsing turns raw bytes into structured content: pages, headings, tables, lists, and images — not one giant string.",
    detail:
      "We use Mistral OCR for PDFs/images so scanned pages become markdown with layout cues. Structured parse output is what makes structure-aware chunking possible.",
    test: "If whole sections are missing later, OCR/parse likely failed on that page or layout.",
  },
  clean: {
    title: "Cleaning",
    plain:
      "Cleaning removes boilerplate (headers, footers, nav junk, duplicates) so retrieval is not polluted by repeated noise.",
    detail:
      "Over-cleaning can delete useful captions; under-cleaning leaves page numbers everywhere. Production pipelines log both counts.",
    test: "Repeated footer phrases in answers usually mean cleaning was too weak.",
  },
  metadata: {
    title: "Metadata extraction",
    plain:
      "Metadata is searchable labels: doc type, language, department, version, date, access tags.",
    detail:
      "At query time, metadata filters shrink the search space (e.g. only Finance PDFs). This is permission-ready design even in a guest demo.",
    test: "Wrong labels can hide good chunks when filters are applied.",
  },
  chunk: {
    title: "Structure-aware chunking",
    plain:
      "Instead of blindly slicing every N words, we split on headings, pages, and tables — then apply overlap only inside long sections.",
    detail:
      "Structure-aware chunks keep a table or subsection intact, which improves retrieval precision and citation quality versus naive fixed windows.",
    test: "Incomplete answers → chunks too small. Messy mixed topics in one chunk → too large or not structure-aware.",
  },
  embed: {
    title: "Embedding",
    plain:
      "Each chunk becomes a meaning vector (Mistral embed) so similar ideas match even with different wording.",
    detail:
      "Embeddings alone miss exact IDs and rare keywords — that is why production RAG also keeps a keyword/BM25 index.",
    test: "Odd semantic matches with wrong keywords hint at embedding-only retrieval.",
  },
  store: {
    title: "Dual indexing",
    plain:
      "Vectors go to Qdrant; keyword tokens are stored alongside for BM25-style hybrid search.",
    detail:
      "Production stacks often pair a vector DB with Elasticsearch/OpenSearch (or in-process BM25). Here keyword scoring runs over chunk text payloads.",
    test: "Empty retrieval after upload usually means indexing failed.",
  },
  rewrite: {
    title: "Query rewrite",
    plain:
      "The raw question is rewritten into clearer search queries, entities, and filters before retrieval.",
    detail:
      "Rewrites expand acronyms, add synonyms, and produce multiple search strings. This is the difference between chatty UX and searchable intent.",
    test: "Vague questions should become more specific rewritten queries in the audit panel.",
  },
  metadataFilter: {
    title: "Metadata filtering",
    plain:
      "Optional filters (doc type, source name, tags) exclude irrelevant namespaces before ranking.",
    detail:
      "In enterprises this layer also enforces permissions: you never retrieve a chunk the user cannot see.",
    test: "Ask for a specific file name or type and watch filters appear.",
  },
  hybrid: {
    title: "Hybrid retrieval",
    plain:
      "We run vector search and keyword/BM25 search, then fuse ranks (RRF) so meaning and exact terms both win.",
    detail:
      "Vector finds paraphrases; BM25 finds invoice numbers and rare names. Hybrid is standard in production RAG.",
    test: "Ask with an exact rare term from your PDF — keyword path should boost that chunk.",
  },
  rerank: {
    title: "Reranking",
    plain:
      "Top fused candidates are re-scored for true relevance so weak near-matches drop out.",
    detail:
      "Production often uses a cross-encoder reranker. Here we use lexical–semantic fusion scores and diversity penalties as a transparent teaching stand-in.",
    test: "The #1 reranked chunk should actually answer the question.",
  },
  context: {
    title: "Context selection / compression",
    plain:
      "We keep only the highest-value spans within a token budget — not every retrieved paragraph.",
    detail:
      "Context compression reduces cost and hallucination risk by trimming redundant sentences while preserving citation anchors.",
    test: "Check the briefing: it should contain the facts you expect, without huge irrelevant slabs.",
  },
  generate: {
    title: "LLM generation",
    plain:
      "The model may only use the selected context. If evidence is weak, it should say so.",
    detail:
      "Grounded prompts forbid inventing facts and require inline chunk citations.",
    test: "Ask something not in the docs — a good RAG system refuses.",
  },
  cite: {
    title: "Citation / grounding",
    plain:
      "Every important claim maps back to a chunk ID and source file so you can audit trust.",
    detail:
      "Grounding checks compare answer spans to evidence. Failed mapping = hallucination risk.",
    test: "Open citations. If a claim is not in the snippet, that is a grounding failure.",
  },
  claimEval: {
    title: "Claim-level evaluation",
    plain:
      "The answer is split into factual claims; each is judged against retrieved evidence only — supported, contradicted, or not supported.",
    detail:
      "This is grounded evaluation, not similarity to a golden answer. The judge does not see retrieval confidence scores, so it cannot rubber-stamp a pre-endorsed claim.",
    test: "Invent a detail not in your PDF — expect NOT_SUPPORTED or CONTRADICTED on that claim.",
  },
  evaluate: {
    title: "Evaluation & observability",
    plain:
      "After answers, production systems log latency, retrieval quality, and user feedback.",
    detail:
      "Claim groundedness, contradiction rate, and citation coverage beat a single vanity RAG score. The timing log shows where latency went.",
    test: "Run in-doc and out-of-doc probes from the testing guide, then open Claim Analysis.",
  },
} as const;

export const INGEST_LESSONS = [
  {
    id: "parse",
    title: "Parsing",
    color: "amber",
    summary: "Bytes → pages, headings, tables, images",
    points: [
      "OCR (Mistral) for PDFs and images, including scans",
      "Preserve layout signals (markdown headings, page breaks)",
      "Detect tables/images as first-class objects when present",
    ],
  },
  {
    id: "clean",
    title: "Cleaning",
    color: "teal",
    summary: "Remove noise that hurts retrieval",
    points: [
      "Drop repeated headers/footers and near-duplicate lines",
      "Normalize whitespace without destroying tables",
      "Keep a before/after sample so you can audit cleaning",
    ],
  },
  {
    id: "metadata",
    title: "Metadata extraction",
    color: "sky",
    summary: "Labels for filter + permissions later",
    points: [
      "Doc type, language, version, date, department tags",
      "Enables metadata filtering at query time",
      "Foundation for access-control filters in production",
    ],
  },
  {
    id: "chunk",
    title: "Structure-aware chunking",
    color: "violet",
    summary: "Split on structure, not only token count",
    points: [
      "Prefer heading / page / table boundaries",
      "Overlap only inside long unstructured sections",
      "Each chunk keeps section title + strategy tag",
    ],
  },
] as const;

export const QUERY_PIPELINE = [
  { id: "rewrite", label: "Query rewrite", help: "rewrite" },
  { id: "metadataFilter", label: "Metadata filtering", help: "metadataFilter" },
  { id: "hybrid", label: "Hybrid retrieval", help: "hybrid" },
  { id: "rerank", label: "Reranking", help: "rerank" },
  { id: "context", label: "Context selection", help: "context" },
  { id: "generate", label: "LLM", help: "generate" },
  { id: "cite", label: "Citation / grounding", help: "cite" },
  { id: "claimEval", label: "Claim evaluation", help: "claimEval" },
  { id: "answer", label: "Final answer", help: "evaluate" },
] as const;

export const ARCHITECTURE_FLOW = [
  {
    id: "sources",
    title: "Data Sources",
    subtitle: "PDF · DB · API · Web",
    tone: "amber",
  },
  {
    id: "ingest",
    title: "Ingestion pipeline",
    subtitle: "Parse · Clean · Chunk · Metadata · Versioning",
    tone: "teal",
  },
  {
    id: "index",
    title: "Embedding + indexing",
    subtitle: "Vectors + keyword tokens",
    tone: "sky",
  },
  {
    id: "stores",
    title: "Dual stores",
    subtitle: "Qdrant  +  BM25 keyword index",
    tone: "violet",
  },
  {
    id: "query",
    title: "User query path",
    subtitle:
      "Rewrite → filters → hybrid → rerank → compress → LLM → citations",
    tone: "teal",
  },
  {
    id: "observe",
    title: "Eval + observability",
    subtitle: "Grounding · feedback · latency traces",
    tone: "amber",
  },
] as const;

export const HOW_RAG_WORKS = [
  {
    step: "1",
    title: "Ingest with structure",
    body: "Parse, clean, extract metadata, then structure-aware chunk — not a black-box upload.",
  },
  {
    step: "2",
    title: "Index two ways",
    body: "Store meaning vectors in Qdrant and keep keyword signals for hybrid search.",
  },
  {
    step: "3",
    title: "Retrieve like production",
    body: "Rewrite the question, filter metadata, fuse vector+BM25, rerank, then compress context.",
  },
  {
    step: "4",
    title: "Ground and verify",
    body: "Generate with citations, then test faithfulness with in-doc and out-of-doc probes.",
  },
] as const;

export const TEST_GUIDE = [
  {
    title: "In-doc question",
    detail:
      "Ask something your file clearly answers. Expect a correct answer plus matching citations.",
  },
  {
    title: "Out-of-doc question",
    detail:
      "Ask something the file never mentions. A good RAG system refuses or says it lacks evidence.",
  },
  {
    title: "Exact keyword probe",
    detail:
      "Use a rare ID/name from the PDF. Hybrid/BM25 should surface that chunk even if wording differs.",
  },
  {
    title: "Citation check",
    detail:
      "Open each citation. Every important number or claim should appear in a snippet.",
  },
  {
    title: "Claim audit",
    detail:
      "Open Claim Analysis. Supported claims should link to chunks; invent a detail and expect NOT_SUPPORTED or CONTRADICTED.",
  },
  {
    title: "Ambiguous question",
    detail:
      "Ask vaguely. Watch query rewrite turn it into clearer search queries.",
  },
  {
    title: "Update & re-ask",
    detail:
      "Upload a corrected file (within free limits) and ask again — answers should follow new evidence.",
  },
] as const;
