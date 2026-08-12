"use client";

import type { ParseEvent } from "@/lib/rag-observatory/types";
import { STAGE_HELP } from "@/lib/rag-observatory/education";
import { GlassPanel } from "../../shared/GlassPanel";
import { HelpTip } from "../../shared/HelpTip";

export function ParseStage({
  events,
  active,
}: {
  events: ParseEvent[];
  active?: boolean;
}) {
  return (
    <GlassPanel className="p-4" active={!!active}>
      <h3 className="flex items-center text-sm font-medium text-[var(--rag-ink)]">
        Parsing
        <HelpTip title={STAGE_HELP.parse.title}>
          <p>{STAGE_HELP.parse.plain}</p>
          <p>{STAGE_HELP.parse.detail}</p>
          <p className="text-[var(--rag-faint)]">Test: {STAGE_HELP.parse.test}</p>
        </HelpTip>
      </h3>
      <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
        Bytes → pages, headings, tables, images (OCR when needed)
      </p>
      <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto rag-scroll sm:grid-cols-2">
        {events.length === 0 ? (
          <p className="text-[12px] text-[var(--rag-faint)]">Waiting…</p>
        ) : (
          events.map((ev, i) => (
            <div
              key={`${ev.type}-${i}`}
              className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/50 px-2.5 py-2 text-[12px] text-[var(--rag-ink)]"
            >
              <span className="rag-mono text-[10px] uppercase text-[var(--rag-accent)]">
                {ev.type}
              </span>
              <p className="mt-0.5">{ev.label}</p>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
