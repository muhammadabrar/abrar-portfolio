"use client";

import { useEffect, useState } from "react";
import type { QueryAuditState } from "@/lib/rag-observatory/types";
import { QUERY_PIPELINE, STAGE_HELP } from "@/lib/rag-observatory/education";
import { HelpTip } from "../shared/HelpTip";
import { TimelineAudit } from "./TimelineAudit";

type StepId =
  | "rewrite"
  | "metadataFilter"
  | "hybrid"
  | "rerank"
  | "context"
  | "generate"
  | "cite"
  | "timeline";

function StepCard({
  title,
  helpKey,
  active,
  done,
  open,
  onToggle,
  children,
  empty,
}: {
  title: string;
  helpKey: keyof typeof STAGE_HELP;
  active: boolean;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  empty?: boolean;
}) {
  const help = STAGE_HELP[helpKey];
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--rag-radius-sm)] border transition-colors ${
        active
          ? "border-sky-400/45 bg-sky-500/10"
          : done
            ? "border-[var(--rag-border)] bg-[rgba(15,23,42,0.55)]"
            : "border-[var(--rag-border)] bg-transparent opacity-55"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span
          className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            active
              ? "bg-sky-400 text-slate-900"
              : done
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-white/5 text-[var(--rag-faint)]"
          }`}
        >
          {done && !active ? "✓" : active ? "●" : "○"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-[var(--rag-ink)]">
            {title}
          </span>
          <span className="block text-[11px] text-[var(--rag-faint)]">
            {empty
              ? "Waiting…"
              : active
                ? "In progress"
                : done
                  ? "Done — tap to review"
                  : "Queued"}
          </span>
        </span>
        <span className="text-[11px] text-sky-300/70">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      <span className="absolute right-10 top-2.5">
        <HelpTip title={help.title}>
          <p>{help.plain}</p>
          <p>{help.detail}</p>
          <p className="text-[var(--rag-faint)]">Test: {help.test}</p>
        </HelpTip>
      </span>
      {open && !empty ? (
        <div className="border-t border-[rgba(96,165,250,0.12)] px-3 py-3 text-[13px]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function HitList({
  items,
  scoreLabel,
}: {
  items: QueryAuditState["candidates"];
  scoreLabel?: string;
}) {
  if (!items.length) {
    return <p className="text-[12px] text-[var(--rag-faint)]">None</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.slice(0, 6).map((d) => (
        <li
          key={`${d.channel ?? "h"}-${d.id}`}
          className="flex justify-between gap-2 rounded-lg bg-black/20 px-2.5 py-1.5"
        >
          <span className="min-w-0 truncate text-[12px]">
            {d.channel ? (
              <span className="mr-1.5 rag-mono text-[10px] uppercase text-sky-300/80">
                {d.channel}
              </span>
            ) : null}
            {d.title}
          </span>
          <span className="rag-mono shrink-0 text-[11px] text-sky-300">
            {scoreLabel === "raw"
              ? Number(d.score).toFixed(3)
              : scoreLabel === "pct"
                ? Math.round(d.score)
                : typeof d.score === "number" && d.score <= 1
                  ? (d.score * 100).toFixed(0)
                  : Number(d.score).toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AuditPanel({ audit }: { audit: QueryAuditState }) {
  const [openStep, setOpenStep] = useState<StepId | null>(null);

  useEffect(() => {
    if (audit.phase === "idle") {
      setOpenStep(null);
      return;
    }
    if (audit.phase === "done") {
      setOpenStep("cite");
      return;
    }
    if (audit.phase === "generation") setOpenStep("generate");
    else if (audit.phase === "context") setOpenStep("context");
    else if (audit.phase === "rerank") setOpenStep("rerank");
    else if (audit.phase === "hybrid") setOpenStep("hybrid");
    else if (audit.phase === "metadataFilter") setOpenStep("metadataFilter");
    else if (audit.phase === "rewrite") setOpenStep("rewrite");
  }, [audit.phase]);

  const pct = Math.min(
    100,
    Math.round((audit.contextTokensUsed / audit.contextTokensMax) * 100),
  );

  const toggle = (id: StepId) =>
    setOpenStep((cur) => (cur === id ? null : id));

  const hasRewrite = Boolean(audit.understanding);
  const hasFilter = audit.metadataFilters.length > 0;
  const hasHybrid =
    audit.candidates.length > 0 ||
    audit.vectorHits.length > 0 ||
    audit.keywordHits.length > 0;
  const hasRerank = audit.reranked.length > 0;
  const hasContext = audit.contextChunks.length > 0;
  const hasGenerate =
    audit.phase === "generation" ||
    audit.phase === "done" ||
    Boolean(audit.streamingAnswer) ||
    Boolean(audit.fullAnswer);
  const hasCite = Boolean(audit.explainability);

  return (
    <div className="rag-panel-audit flex h-full min-h-[480px] flex-col overflow-hidden lg:min-h-0">
      <div className="border-b border-[rgba(96,165,250,0.18)] bg-[rgba(96,165,250,0.08)] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2 rounded-full bg-sky-400" />
            <h2 className="text-sm font-semibold text-sky-200">
              Behind the scenes
            </h2>
          </div>
          <span className="rag-mono rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-sky-300">
            {audit.phase === "idle" ? "waiting" : audit.phase}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-[var(--rag-muted)]">
          Production query path — open each step for the full explanation.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {QUERY_PIPELINE.map((s) => (
            <span
              key={s.id}
              className="rounded-full border border-sky-400/20 bg-sky-500/5 px-1.5 py-0.5 text-[9px] text-sky-200/90"
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="rag-scroll flex-1 space-y-2 overflow-y-auto p-3">
        {audit.phase === "idle" ? (
          <div className="rounded-[var(--rag-radius-sm)] border border-dashed border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.06)] p-4 text-[13px] text-[var(--rag-muted)]">
            Ask a question on the left. You will see rewrite → filters → hybrid
            (Qdrant + BM25) → rerank → context → LLM → citations.
          </div>
        ) : null}

        <StepCard
          title="1. Query rewrite"
          helpKey="rewrite"
          active={audit.phase === "rewrite"}
          done={hasRewrite && audit.phase !== "rewrite"}
          open={openStep === "rewrite"}
          onToggle={() => toggle("rewrite")}
          empty={!hasRewrite}
        >
          {audit.understanding ? (
            <div className="space-y-2">
              <p>
                <span className="text-[var(--rag-faint)]">Original · </span>
                {audit.understanding.original}
              </p>
              <p>
                <span className="text-[var(--rag-faint)]">Rewritten · </span>
                {audit.understanding.rewrittenQuery ??
                  audit.understanding.expandedQueries[0]}
              </p>
              <p>
                <span className="text-[var(--rag-faint)]">Intent · </span>
                {audit.understanding.intent}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {audit.understanding.entities.map((e) => (
                  <span
                    key={e}
                    className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200"
                  >
                    {e}
                  </span>
                ))}
              </div>
              {audit.understanding.expandedQueries.length > 0 ? (
                <div>
                  <p className="mb-1 text-[11px] text-[var(--rag-faint)]">
                    Expansions
                  </p>
                  <ul className="space-y-1 text-[12px] text-[var(--rag-muted)]">
                    {audit.understanding.expandedQueries.map((q) => (
                      <li key={q} className="truncate">
                        · {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </StepCard>

        <StepCard
          title="2. Metadata / permission filter"
          helpKey="metadataFilter"
          active={audit.phase === "metadataFilter"}
          done={hasFilter && audit.phase !== "metadataFilter"}
          open={openStep === "metadataFilter"}
          onToggle={() => toggle("metadataFilter")}
          empty={!hasFilter}
        >
          <div className="flex flex-wrap gap-1.5">
            {audit.metadataFilters.map((f) => (
              <span
                key={f}
                className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] text-violet-200"
              >
                {f}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-[var(--rag-muted)]">
            Guest demo isolates your Qdrant collection. Production also filters
            by ACL tags on each chunk.
          </p>
        </StepCard>

        <StepCard
          title="3. Hybrid retrieval"
          helpKey="hybrid"
          active={audit.phase === "hybrid"}
          done={hasHybrid && audit.phase !== "hybrid"}
          open={openStep === "hybrid"}
          onToggle={() => toggle("hybrid")}
          empty={!hasHybrid}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-teal-300/90">
                Vector (Qdrant)
              </p>
              <HitList items={audit.vectorHits} />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-amber-300/90">
                Keyword (BM25)
              </p>
              <HitList items={audit.keywordHits} scoreLabel="raw" />
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-sky-300/90">
              Fused (RRF)
            </p>
            <HitList items={audit.candidates} scoreLabel="raw" />
          </div>
        </StepCard>

        <StepCard
          title="4. Reranking"
          helpKey="rerank"
          active={audit.phase === "rerank"}
          done={hasRerank && audit.phase !== "rerank"}
          open={openStep === "rerank"}
          onToggle={() => toggle("rerank")}
          empty={!hasRerank}
        >
          <ul className="space-y-2">
            {audit.reranked.slice(0, 6).map((d, i) => (
              <li key={d.id} className="flex items-center gap-2">
                <span className="rag-mono w-4 text-[11px] text-[var(--rag-faint)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px]">{d.title}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{
                        width: `${Math.min(100, d.score > 1 ? d.score : d.score * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="rag-mono text-[11px] text-sky-300">
                  {Math.round(d.score > 1 ? d.score : d.score * 100)}
                </span>
              </li>
            ))}
          </ul>
        </StepCard>

        <StepCard
          title="5. Context selection"
          helpKey="context"
          active={audit.phase === "context"}
          done={hasContext && audit.phase !== "context"}
          open={openStep === "context"}
          onToggle={() => toggle("context")}
          empty={!hasContext}
        >
          <div className="space-y-2">
            {audit.contextChunks.map((c) => (
              <div
                key={c.id}
                className="rounded-lg bg-black/20 px-2.5 py-2 text-[12px]"
              >
                <span className="rag-mono text-sky-300">{c.id}</span>
                <span className="ml-2 text-[var(--rag-ink)]">{c.title}</span>
                {c.compressed ? (
                  <span className="ml-2 text-[10px] text-amber-300/90">
                    compressed
                  </span>
                ) : null}
                <span className="mt-0.5 block text-[11px] text-[var(--rag-faint)]">
                  {c.source} · {c.tokens} tok
                </span>
              </div>
            ))}
            <div className="pt-1">
              <div className="mb-1 flex justify-between text-[11px] text-[var(--rag-faint)]">
                <span>Context budget</span>
                <span className="rag-mono">
                  {audit.contextTokensUsed}/{audit.contextTokensMax}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </StepCard>

        <StepCard
          title="6. LLM generation"
          helpKey="generate"
          active={audit.phase === "generation"}
          done={audit.phase === "done"}
          open={openStep === "generate"}
          onToggle={() => toggle("generate")}
          empty={!hasGenerate}
        >
          <p className="text-[12px] text-[var(--rag-muted)]">
            {audit.phase === "generation"
              ? "Writing in the teal chat panel — grounded only on the briefing above."
              : "Finished — read the answer in chat, then open citations."}
          </p>
        </StepCard>

        <StepCard
          title="7. Citation / grounding"
          helpKey="cite"
          active={false}
          done={hasCite}
          open={openStep === "cite"}
          onToggle={() => toggle("cite")}
          empty={!hasCite}
        >
          {audit.explainability ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <p className="text-[10px] uppercase text-[var(--rag-faint)]">
                    Confidence
                  </p>
                  <p className="rag-mono text-2xl text-amber-300">
                    {(audit.explainability.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <p className="pb-1 text-[12px] text-[var(--rag-muted)]">
                  Sources: {audit.explainability.sources.join(", ") || "—"}
                </p>
              </div>
              {audit.explainability.reasoningPath.length > 0 ? (
                <ol className="list-decimal space-y-1 pl-4 text-[12px] text-[var(--rag-muted)]">
                  {audit.explainability.reasoningPath.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ol>
              ) : null}
              <ul className="space-y-1.5">
                {audit.explainability.citations.map((c) => (
                  <li
                    key={`${c.source}-${c.text}`}
                    className="rounded-lg bg-amber-500/10 px-2.5 py-2 text-[12px] ring-1 ring-amber-400/20"
                  >
                    “{c.text}”
                    <span className="mt-0.5 block rag-mono text-[10px] text-[var(--rag-faint)]">
                      {c.source}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </StepCard>

        <StepCard
          title="Observability · timing"
          helpKey="evaluate"
          active={false}
          done={audit.timeline.length > 0}
          open={openStep === "timeline"}
          onToggle={() => toggle("timeline")}
          empty={audit.timeline.length === 0}
        >
          <TimelineAudit entries={audit.timeline} />
        </StepCard>
      </div>
    </div>
  );
}
