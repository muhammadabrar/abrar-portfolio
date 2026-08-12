import type {
  ChunkCard,
  CleanStats,
  EmbedInfo,
  IngestionRun,
  IngestionStageId,
  IngestionStageState,
  MetadataFields,
  ParseEvent,
  StoreStats,
} from "./types";

const STAGE_ORDER: { id: IngestionStageId; label: string; duration: number }[] = [
  { id: "upload", label: "Document Upload", duration: 400 },
  { id: "parse", label: "Parsing", duration: 2800 },
  { id: "clean", label: "Cleaning", duration: 1600 },
  { id: "metadata", label: "Metadata Extraction", duration: 1200 },
  { id: "chunk", label: "Structure-aware Chunking", duration: 2200 },
  { id: "embed", label: "Embedding Generation", duration: 2600 },
  { id: "store", label: "Dual Indexing", duration: 1400 },
  { id: "index", label: "Index Ready", duration: 900 },
  { id: "ready", label: "Ready", duration: 300 },
];

const PARSE_EVENTS: ParseEvent[] = [
  { type: "page", page: 1, label: "Page 1 extracted" },
  { type: "page", page: 2, label: "Page 2 extracted" },
  { type: "ocr", progress: 35, label: "OCR 35%" },
  { type: "table", label: "Table detected — Revenue by region" },
  { type: "page", page: 3, label: "Page 3 extracted" },
  { type: "image", label: "Image detected — Chart: YoY growth" },
  { type: "language", label: "Language: English" },
  { type: "ocr", progress: 72, label: "OCR 72%" },
  { type: "page", page: 4, label: "Page 4 extracted" },
  { type: "table", label: "Table detected — Quarterly breakdown" },
  { type: "ocr", progress: 100, label: "OCR complete" },
  { type: "language", label: "Secondary: German (snippets)" },
];

const CLEAN: CleanStats = {
  duplicatesRemoved: 14,
  formattingNormalized: 128,
  ocrCorrections: 37,
  rawSample: `HEADER — CONFIDENTIAL\nFOOTER Page 1 of 287\n\nANNUAL REPORT 2025\n\nHEADER — CONFIDENTIAL\nRevenue by segment...`,
  cleanedSample: `Annual Report 2025\n\nRevenue by segment\nGermany led regional growth in H1 with enterprise software contributing the majority of net-new ARR.`,
};

const METADATA: MetadataFields = {
  documentType: "Financial Report",
  language: "English",
  department: "Finance",
  version: "v3",
  date: "2025-07-15",
};

const CHUNK_DEFS: Omit<ChunkCard, "id">[] = [
  {
    tokenCount: 412,
    sectionTitle: "Executive Summary",
    strategy: "heading",
    tags: ["heading", "finance"],
  },
  {
    tokenCount: 386,
    sectionTitle: "Financial Results",
    strategy: "heading",
    tags: ["heading", "revenue"],
  },
  {
    tokenCount: 401,
    sectionTitle: "Germany Revenue",
    strategy: "page",
    tags: ["page", "germany"],
  },
  {
    tokenCount: 355,
    sectionTitle: "Quarterly Breakdown",
    strategy: "table",
    tags: ["table", "q2"],
  },
  {
    tokenCount: 428,
    sectionTitle: "Risk Factors",
    strategy: "heading",
    tags: ["heading", "risk"],
  },
  {
    tokenCount: 372,
    sectionTitle: "Outlook H2",
    strategy: "overlap",
    tags: ["overlap", "forecast"],
  },
];

function initialStages(): IngestionStageState[] {
  return STAGE_ORDER.map((s) => ({
    id: s.id,
    label: s.label,
    status: "pending" as const,
  }));
}

export function createEmptyIngestionRun(fileId: string): IngestionRun {
  return {
    fileId,
    stages: initialStages(),
    parseEvents: [],
    cleanStats: null,
    metadata: {},
    chunks: [],
    embeds: [],
    store: null,
    progress: 0,
    activeStage: null,
    completed: false,
  };
}

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

export type IngestionListener = (run: IngestionRun) => void;

export async function runIngestionSimulation(
  fileId: string,
  onUpdate: IngestionListener,
  signal?: AbortSignal,
  speed = 1,
): Promise<IngestionRun> {
  let run = createEmptyIngestionRun(fileId);
  const emit = (next: IngestionRun) => {
    run = next;
    onUpdate({ ...next, stages: next.stages.map((s) => ({ ...s })) });
  };

  const total = STAGE_ORDER.length;
  const d = (ms: number) => Math.max(40, ms / speed);

  for (let i = 0; i < STAGE_ORDER.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const stage = STAGE_ORDER[i];
    const stages = run.stages.map((s, idx) => {
      if (idx === i) return { ...s, status: "active" as const };
      if (idx < i) return { ...s, status: "done" as const, durationMs: STAGE_ORDER[idx].duration };
      return s;
    });
    emit({
      ...run,
      stages,
      activeStage: stage.id,
      progress: Math.round((i / total) * 100),
    });

    if (stage.id === "parse") {
      for (const ev of PARSE_EVENTS) {
        await sleep(d(180), signal);
        emit({ ...run, parseEvents: [...run.parseEvents, ev] });
      }
    } else if (stage.id === "clean") {
      await sleep(d(stage.duration * 0.4), signal);
      emit({ ...run, cleanStats: CLEAN });
      await sleep(d(stage.duration * 0.6), signal);
    } else if (stage.id === "metadata") {
      const keys = Object.keys(METADATA) as (keyof MetadataFields)[];
      for (const key of keys) {
        await sleep(d(stage.duration / keys.length), signal);
        emit({
          ...run,
          metadata: { ...run.metadata, [key]: METADATA[key] },
        });
      }
    } else if (stage.id === "chunk") {
      for (let c = 0; c < CHUNK_DEFS.length; c++) {
        await sleep(d(stage.duration / CHUNK_DEFS.length), signal);
        const chunk: ChunkCard = {
          id: `CHK-${String(c + 1).padStart(3, "0")}`,
          ...CHUNK_DEFS[c],
        };
        emit({ ...run, chunks: [...run.chunks, chunk] });
      }
    } else if (stage.id === "embed") {
      const embeds: EmbedInfo[] = [];
      for (const chunk of run.chunks) {
        await sleep(d(stage.duration / Math.max(run.chunks.length, 1)), signal);
        embeds.push({
          chunkId: chunk.id,
          dimensions: 1536,
          model: "text-embedding-3-large",
          latencyMs: 40 + Math.floor(Math.random() * 60),
          tokenCount: chunk.tokenCount,
        });
        emit({ ...run, embeds: [...embeds] });
      }
    } else if (stage.id === "store" || stage.id === "index") {
      await sleep(d(stage.duration * 0.5), signal);
      const store: StoreStats = {
        provider: "Qdrant",
        vectorsStored: run.chunks.length || 6,
        collections: 3,
        namespaces: 1,
        indexHealth: stage.id === "index" ? 99.8 : 98.2,
      };
      emit({ ...run, store });
      await sleep(d(stage.duration * 0.5), signal);
    } else {
      await sleep(d(stage.duration), signal);
    }

    const doneStages = run.stages.map((s, idx) =>
      idx <= i
        ? { ...s, status: "done" as const, durationMs: STAGE_ORDER[idx].duration }
        : s,
    );
    emit({
      ...run,
      stages: doneStages,
      progress: Math.round(((i + 1) / total) * 100),
      activeStage: i === STAGE_ORDER.length - 1 ? "ready" : run.activeStage,
      completed: i === STAGE_ORDER.length - 1,
    });
  }

  return run;
}
