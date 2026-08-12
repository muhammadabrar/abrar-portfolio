"use client";

import type { ChunkCard } from "@/lib/rag-observatory/types";
import { GlassPanel } from "../../shared/GlassPanel";
import { HelpTip } from "../../shared/HelpTip";
import { STAGE_HELP } from "@/lib/rag-observatory/education";

export function ChunkStage({
  chunks,
  active,
}: {
  chunks: ChunkCard[];
  active?: boolean;
}) {
  return (
    <GlassPanel className="p-4" active={!!active}>
      <h3 className="flex items-center text-sm font-medium text-[var(--rag-ink)]">
        Structure-aware chunking
        <HelpTip title={STAGE_HELP.chunk.title}>
          <p>{STAGE_HELP.chunk.plain}</p>
          <p>{STAGE_HELP.chunk.detail}</p>
          <p className="text-[var(--rag-faint)]">Test: {STAGE_HELP.chunk.test}</p>
        </HelpTip>
      </h3>
      <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
        Split on headings / pages / tables first — overlap only for long plain
        sections
      </p>
      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {chunks.length === 0 ? (
          <p className="text-[12px] text-[var(--rag-faint)]">Waiting…</p>
        ) : (
          chunks.map((c) => (
            <div
              key={c.id}
              className="rounded-[var(--rag-radius-sm)] border border-violet-400/20 bg-violet-500/5 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rag-mono text-[11px] text-violet-300">
                  {c.id}
                </span>
                <span className="rag-mono text-[10px] text-[var(--rag-muted)]">
                  {c.tokenCount} tok
                </span>
              </div>
              <p className="mt-1.5 text-[13px] font-medium text-[var(--rag-ink)]">
                {c.sectionTitle}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(c.strategy ? [c.strategy, ...c.tags] : c.tags)
                  .filter((t, i, arr) => arr.indexOf(t) === i)
                  .slice(0, 5)
                  .map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-violet-400/25 px-1.5 py-0.5 text-[10px] text-violet-200/90"
                    >
                      {t}
                    </span>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
