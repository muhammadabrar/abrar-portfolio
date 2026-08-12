"use client";

import type { StoreStats } from "@/lib/rag-observatory/types";
import { STAGE_HELP } from "@/lib/rag-observatory/education";
import { GlassPanel } from "../../shared/GlassPanel";
import { HelpTip } from "../../shared/HelpTip";

export function StoreStage({
  store,
  active,
}: {
  store: StoreStats | null;
  active?: boolean;
}) {
  return (
    <GlassPanel className="p-4" active={!!active}>
      <h3 className="flex items-center text-sm font-medium text-[var(--rag-ink)]">
        Dual indexing
        <HelpTip title={STAGE_HELP.store.title}>
          <p>{STAGE_HELP.store.plain}</p>
          <p>{STAGE_HELP.store.detail}</p>
          <p className="text-[var(--rag-faint)]">Test: {STAGE_HELP.store.test}</p>
        </HelpTip>
      </h3>
      <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
        Vectors → Qdrant · keywords → BM25-ready payload tokens
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[var(--rag-radius-sm)] border border-teal-400/30 bg-teal-500/10 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-200">
            Vector DB
          </p>
          <p className="mt-1 text-[13px] text-teal-50">Qdrant</p>
          <p className="mt-1 text-[11px] text-teal-100/70">
            Semantic similarity for paraphrases
          </p>
        </div>
        <div className="rounded-[var(--rag-radius-sm)] border border-amber-400/30 bg-amber-500/10 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">
            Keyword index
          </p>
          <p className="mt-1 text-[13px] text-amber-50">BM25-lite</p>
          <p className="mt-1 text-[11px] text-amber-100/70">
            Exact terms, IDs, rare names
          </p>
        </div>
      </div>

      {!store ? (
        <p className="mt-4 text-[12px] text-[var(--rag-faint)]">Waiting…</p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Vectors stored", String(store.vectorsStored)],
            ["Collections", String(store.collections)],
            ["Namespaces", String(store.namespaces)],
            ["Index health", `${store.indexHealth}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/50 px-3 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-[var(--rag-muted)]">
                {label}
              </p>
              <p className="mt-1 rag-mono text-lg font-medium text-[var(--rag-ink)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
