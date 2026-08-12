"use client";

import type { CleanStats } from "@/lib/rag-observatory/types";
import { STAGE_HELP } from "@/lib/rag-observatory/education";
import { GlassPanel } from "../../shared/GlassPanel";
import { HelpTip } from "../../shared/HelpTip";

export function CleanStage({
  stats,
  active,
}: {
  stats: CleanStats | null;
  active?: boolean;
}) {
  return (
    <GlassPanel className="p-4" active={!!active}>
      <h3 className="flex items-center text-sm font-medium text-[var(--rag-ink)]">
        Cleaning
        <HelpTip title={STAGE_HELP.clean.title}>
          <p>{STAGE_HELP.clean.plain}</p>
          <p>{STAGE_HELP.clean.detail}</p>
          <p className="text-[var(--rag-faint)]">Test: {STAGE_HELP.clean.test}</p>
        </HelpTip>
      </h3>
      <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
        Strip boilerplate so retrieval is not polluted
      </p>
      {!stats ? (
        <p className="mt-3 text-[12px] text-[var(--rag-faint)]">Waiting…</p>
      ) : (
        <>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--rag-danger)]">
                Raw text
              </p>
              <pre className="mt-2 whitespace-pre-wrap rag-mono text-[11px] leading-relaxed text-[var(--rag-muted)]">
                {stats.rawSample}
              </pre>
            </div>
            <div className="rounded-[var(--rag-radius-sm)] border border-[rgba(45,212,191,0.25)] bg-[var(--rag-accent-dim)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--rag-accent)]">
                Cleaned text
              </p>
              <pre className="mt-2 whitespace-pre-wrap rag-mono text-[11px] leading-relaxed text-[var(--rag-ink)]">
                {stats.cleanedSample}
              </pre>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              `${stats.duplicatesRemoved} duplicates removed`,
              `${stats.formattingNormalized} formatting fixes`,
              `${stats.ocrCorrections} OCR corrections`,
            ].map((t) => (
              <span
                key={t}
                className="rag-mono rounded-full border border-[var(--rag-border)] px-2.5 py-1 text-[11px] text-[var(--rag-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
        </>
      )}
    </GlassPanel>
  );
}
