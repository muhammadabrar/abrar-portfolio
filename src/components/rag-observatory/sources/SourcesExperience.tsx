"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HOW_RAG_WORKS, INGEST_LESSONS, STAGE_HELP } from "@/lib/rag-observatory/education";
import { ragFetch } from "@/lib/rag-observatory/client-guest";
import { HelpTip } from "../shared/HelpTip";
import { GlassPanel } from "../shared/GlassPanel";
import { StatusDot } from "../shared/StatusDot";
import { RagArchitecture } from "../shared/RagArchitecture";
import { UploadZone } from "./UploadZone";
import { IngestionPipeline } from "./IngestionPipeline";
import type { IngestionRun } from "@/lib/rag-observatory/types";
import { createEmptyIngestionRun } from "@/lib/rag-observatory/ingestion-simulator";
import { useRagShell } from "../RagAppShell";

type DocRow = {
  id: string;
  name: string;
  kind: string;
  chunkCount: number;
  status: string;
  expiresAt: string;
  sizeBytes: number;
};

type Quota = {
  uploadsUsed: number;
  uploadsMax: number;
  embeddingTokensUsed: number;
  embeddingTokensMax: number;
};

function jobToRun(job: {
  documentId: string | null;
  stage: string;
  progress: number;
  status: string;
  payload: Record<string, unknown>;
}): IngestionRun {
  const base = createEmptyIngestionRun(job.documentId ?? "doc");
  const stageOrder = base.stages.map((s) => s.id);
  const activeIdx = stageOrder.indexOf(
    job.stage as (typeof stageOrder)[number],
  );
  const stages = base.stages.map((s, i) => {
    if (job.status === "ready" || job.progress >= 100) {
      return { ...s, status: "done" as const };
    }
    if (i < activeIdx) return { ...s, status: "done" as const };
    if (i === activeIdx) return { ...s, status: "active" as const };
    return s;
  });

  const payload = job.payload ?? {};
  return {
    ...base,
    stages,
    progress: job.progress,
    activeStage: (job.stage as IngestionRun["activeStage"]) ?? null,
    completed: job.status === "ready",
    parseEvents: (payload.parseEvents as IngestionRun["parseEvents"]) ?? [],
    cleanStats: (payload.cleanStats as IngestionRun["cleanStats"]) ?? null,
    metadata: (payload.metadata as IngestionRun["metadata"]) ?? {},
    chunks: (payload.chunks as IngestionRun["chunks"]) ?? [],
    embeds: (payload.embeds as IngestionRun["embeds"]) ?? [],
    store: (payload.store as IngestionRun["store"]) ?? null,
  };
}

export function SourcesExperience() {
  const { setProcessing } = useRagShell();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [run, setRun] = useState<IngestionRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const [gRes, dRes] = await Promise.all([
      ragFetch("/api/rag/guest"),
      ragFetch("/api/rag/documents"),
    ]);
    const g = await gRes.json();
    const d = await dRes.json();
    if (g.guest) {
      setQuota({
        uploadsUsed: g.guest.uploadsUsed,
        uploadsMax: g.guest.uploadsMax,
        embeddingTokensUsed: g.guest.embeddingTokensUsed,
        embeddingTokensMax: g.guest.embeddingTokensMax,
      });
    }
    if (d.documents) setDocs(d.documents);
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  const pollJob = (jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const res = await ragFetch(`/api/rag/jobs/${jobId}`);
      const job = await res.json();
      if (job.error && job.status === "failed") {
        setError(job.error);
        setBusy(false);
        setProcessing(false);
        if (pollRef.current) clearInterval(pollRef.current);
        void refresh();
        return;
      }
      setRun(jobToRun(job));
      if (job.status === "ready" || job.status === "failed") {
        setBusy(false);
        setProcessing(false);
        if (pollRef.current) clearInterval(pollRef.current);
        void refresh();
      }
    }, 700);
  };

  const onFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    setProcessing(true);
    setRun(createEmptyIngestionRun("pending"));
    const body = new FormData();
    body.append("file", file);
    const res = await ragFetch("/api/rag/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      setBusy(false);
      setProcessing(false);
      return;
    }
    pollJob(data.jobId);
  };

  const removeDoc = async (id: string) => {
    await ragFetch(`/api/rag/documents?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    void refresh();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/25">
            Step 1
          </span>
          {quota ? (
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-[var(--rag-muted)] ring-1 ring-white/10">
              Uploads {quota.uploadsUsed}/{quota.uploadsMax}
            </span>
          ) : null}
        </div>
        <h1 className="mt-2 flex flex-wrap items-center gap-1 text-2xl font-semibold tracking-tight">
          Upload a document
          <HelpTip title={STAGE_HELP.upload.title}>
            <p>{STAGE_HELP.upload.plain}</p>
            <p className="text-[var(--rag-faint)]">
              When testing: {STAGE_HELP.upload.test}
            </p>
          </HelpTip>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--rag-muted)]">
          Production ingest is not “upload → embed”. Watch parse, clean,
          metadata, and structure-aware chunking — then go to{" "}
          <a
            href="/abrar-sandbox/RAG/playground"
            className="font-medium text-teal-300 hover:underline"
          >
            Step 2 · Ask & test
          </a>
          .
        </p>
      </div>

      <RagArchitecture />

      <GlassPanel className="p-4">
        <h2 className="text-sm font-medium text-[var(--rag-ink)]">
          Ingestion deep-dive
          <HelpTip title="Why these four stages?">
            <p>
              Conventional RAG demos skip structure. These four stages decide
              retrieval quality before any embedding runs.
            </p>
          </HelpTip>
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {INGEST_LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/40 p-3"
            >
              <p className="text-[13px] font-semibold text-[var(--rag-ink)]">
                {lesson.title}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
                {lesson.summary}
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-[var(--rag-muted)]">
                {lesson.points.map((p) => (
                  <li key={p} className="flex gap-1.5">
                    <span className="text-[var(--rag-accent)]">·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-[var(--rag-faint)]">
                Live: watch the matching card in the pipeline below when you
                upload.
              </p>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <h2 className="text-sm font-medium text-[var(--rag-ink)]">
          How RAG works
          <HelpTip title="RAG in one minute">
            <p>
              RAG means: search your documents first, then ask an AI to answer
              using only what was found — with citations you can audit.
            </p>
          </HelpTip>
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_RAG_WORKS.map((s) => (
            <div
              key={s.step}
              className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/40 p-3"
            >
              <p className="rag-mono text-[11px] text-[var(--rag-accent)]">
                {s.step}
              </p>
              <p className="mt-1 text-[13px] font-medium">{s.title}</p>
              <p className="mt-1 text-[12px] text-[var(--rag-muted)]">{s.body}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      {quota ? (
        <div className="flex flex-wrap gap-2 text-[12px]">
          <span className="rounded-full border border-[var(--rag-border)] px-3 py-1 text-[var(--rag-muted)]">
            Uploads {quota.uploadsUsed}/{quota.uploadsMax} (free)
          </span>
          <span className="rounded-full border border-[var(--rag-border)] px-3 py-1 text-[var(--rag-muted)]">
            Embed tokens {quota.embeddingTokensUsed}/
            {quota.embeddingTokensMax}
          </span>
          <span className="rounded-full border border-[var(--rag-border)] px-3 py-1 text-[var(--rag-faint)]">
            Free vectors expire after 2 days
          </span>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[var(--rag-radius-sm)] border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[13px] text-[var(--rag-danger)]">
          {error}{" "}
          <a href="/abrar-sandbox/RAG/settings" className="underline">
            Open Settings
          </a>
        </div>
      ) : null}

      <UploadZone onFiles={(f) => void onFiles(f)} disabled={busy} />

      <div>
        <h2 className="mb-3 flex items-center text-sm font-medium">
          Your knowledge base
          <HelpTip title="Knowledge base">
            <p>
              These are the documents already processed and stored as vectors.
              The playground searches only this list.
            </p>
          </HelpTip>
        </h2>
        {docs.length === 0 ? (
          <GlassPanel className="p-6 text-center text-sm text-[var(--rag-muted)]">
            No documents yet. Upload a PDF or Markdown file to begin.
          </GlassPanel>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((d) => (
              <GlassPanel key={d.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{d.name}</p>
                    <p className="mt-1 rag-mono text-[11px] text-[var(--rag-muted)]">
                      {d.kind} · {d.chunkCount} chunks · expires{" "}
                      {new Date(d.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusDot
                    status={
                      d.status === "ready"
                        ? "ready"
                        : d.status === "failed"
                          ? "error"
                          : "processing"
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void removeDoc(d.id)}
                  className="mt-3 text-[12px] text-[var(--rag-danger)] hover:underline"
                >
                  Delete
                </button>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex flex-wrap items-center gap-1 text-sm font-medium">
          Live pipeline
          <HelpTip title={STAGE_HELP.parse.title}>
            <p>Each card below is a real stage. Press (?) on a stage for a beginner explanation.</p>
          </HelpTip>
        </h2>
        <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-[var(--rag-muted)]">
          {(
            [
              "parse",
              "clean",
              "metadata",
              "chunk",
              "embed",
              "store",
            ] as const
          ).map((key) => (
            <span
              key={key}
              className="inline-flex items-center rounded-full border border-[var(--rag-border)] px-2 py-1"
            >
              {STAGE_HELP[key].title}
              <HelpTip title={STAGE_HELP[key].title}>
                <p>{STAGE_HELP[key].plain}</p>
                <p className="text-[var(--rag-faint)]">
                  Test tip: {STAGE_HELP[key].test}
                </p>
              </HelpTip>
            </span>
          ))}
        </div>
        <IngestionPipeline run={run} />
      </div>
    </div>
  );
}
