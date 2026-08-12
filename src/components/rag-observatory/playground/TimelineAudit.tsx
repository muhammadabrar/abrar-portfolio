"use client";

import type { AuditEntry } from "@/lib/rag-observatory/types";

export function TimelineAudit({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return (
      <p className="text-[12px] text-[var(--rag-faint)]">
        Timeline will appear as the query executes.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-[var(--rag-border)] pl-4">
      {entries.map((e, i) => (
        <li key={e.id} className="relative pb-4 last:pb-0">
          <span
            className={`absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-[var(--rag-bg-elevated)] ${
              i === entries.length - 1
                ? "bg-[var(--rag-accent)]"
                : "bg-[var(--rag-success)]"
            }`}
          />
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="rag-mono text-[11px] text-[var(--rag-faint)]">
              {new Date(e.timestamp).toLocaleTimeString(undefined, {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className="text-[13px] font-medium text-[var(--rag-ink)]">
              {e.label}
            </span>
            {e.durationMs > 0 ? (
              <span className="rag-mono text-[11px] text-[var(--rag-muted)]">
                {e.durationMs}ms
              </span>
            ) : null}
          </div>
          {e.detail ? (
            <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
              {e.detail}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
