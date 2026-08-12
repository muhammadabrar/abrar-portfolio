"use client";

import type { MetadataFields } from "@/lib/rag-observatory/types";
import { STAGE_HELP } from "@/lib/rag-observatory/education";
import { GlassPanel } from "../../shared/GlassPanel";
import { HelpTip } from "../../shared/HelpTip";

const LABELS: Record<keyof MetadataFields, string> = {
  documentType: "Document Type",
  language: "Language",
  department: "Department",
  version: "Version",
  date: "Date",
};

export function MetadataStage({
  metadata,
  active,
}: {
  metadata: Partial<MetadataFields>;
  active?: boolean;
}) {
  const entries = (Object.keys(LABELS) as (keyof MetadataFields)[]).map(
    (key) => ({ key, label: LABELS[key], value: metadata[key] }),
  );

  return (
    <GlassPanel className="p-4" active={!!active}>
      <h3 className="flex items-center text-sm font-medium text-[var(--rag-ink)]">
        Metadata extraction
        <HelpTip title={STAGE_HELP.metadata.title}>
          <p>{STAGE_HELP.metadata.plain}</p>
          <p>{STAGE_HELP.metadata.detail}</p>
          <p className="text-[var(--rag-faint)]">
            Test: {STAGE_HELP.metadata.test}
          </p>
        </HelpTip>
      </h3>
      <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
        Labels for filter + permissions at query time
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ key, label, value }) => (
          <div
            key={key}
            className={`rounded-[var(--rag-radius-sm)] border px-3 py-2.5 transition-colors ${
              value
                ? "border-[rgba(45,212,191,0.3)] bg-[var(--rag-accent-dim)]"
                : "border-[var(--rag-border)] bg-[var(--rag-bg)]/40 opacity-40"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--rag-muted)]">
              {label}
            </p>
            <p className="mt-1 text-[13px] font-medium text-[var(--rag-ink)]">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
