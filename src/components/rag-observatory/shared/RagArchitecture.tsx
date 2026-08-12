"use client";

import { HelpTip } from "./HelpTip";
import { ARCHITECTURE_FLOW, STAGE_HELP } from "@/lib/rag-observatory/education";

const TONE: Record<string, string> = {
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  teal: "border-teal-400/30 bg-teal-500/10 text-teal-100",
  sky: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  violet: "border-violet-400/30 bg-violet-500/10 text-violet-100",
};

export function RagArchitecture({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="rag-glass p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--rag-ink)]">
            Production RAG map
            <HelpTip title="Why this diagram?">
              <p>
                Conventional demos hide most stages. This map is the real path
                from documents to a grounded answer.
              </p>
            </HelpTip>
          </h2>
          <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
            Follow this while you upload and ask — every live panel maps to a
            box here.
          </p>
        </div>
      </div>

      <ol className={`grid gap-2 ${compact ? "lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {ARCHITECTURE_FLOW.map((node, i) => (
          <li
            key={node.id}
            className={`relative rounded-[var(--rag-radius-sm)] border p-3 ${TONE[node.tone] ?? TONE.teal}`}
          >
            <p className="rag-mono text-[10px] opacity-70">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[13px] font-semibold">{node.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed opacity-80">
              {node.subtitle}
            </p>
            {i < ARCHITECTURE_FLOW.length - 1 ? (
              <span className="absolute -bottom-2 left-1/2 hidden -translate-x-1/2 text-[10px] text-[var(--rag-faint)] md:hidden">
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {!compact ? (
        <div className="mt-4 rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--rag-faint)]">
            Query path (playground)
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--rag-muted)]">
            Query → rewrite → metadata filter → hybrid (Qdrant + BM25) →
            rerank → context compression → LLM → citations → answer → eval /
            observability
          </p>
          <p className="mt-2 text-[12px] text-[var(--rag-muted)]">
            <span className="text-sky-300">{STAGE_HELP.hybrid.title}:</span>{" "}
            {STAGE_HELP.hybrid.plain}
          </p>
        </div>
      ) : null}
    </div>
  );
}
