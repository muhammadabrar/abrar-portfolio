"use client";

import type { SourceFile } from "@/lib/rag-observatory/types";
import { StatusDot } from "../shared/StatusDot";

export function SourceFileCards({
  files,
  activeId,
  onSelect,
}: {
  files: SourceFile[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((f) => {
        const selected = f.id === activeId;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f.id)}
            className={`rag-glass w-full p-4 text-left transition-colors ${
              selected
                ? "border-[rgba(45,212,191,0.45)] bg-[var(--rag-accent-dim)]"
                : "hover:bg-[var(--rag-surface-hover)]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-[13px] font-medium text-[var(--rag-ink)]">
                {f.name}
              </p>
              <StatusDot
                status={
                  f.status === "processing"
                    ? "processing"
                    : f.status === "ready"
                      ? "ready"
                      : f.status === "failed"
                        ? "error"
                        : "idle"
                }
              />
            </div>
            <p className="mt-2 rag-mono text-[11px] text-[var(--rag-muted)]">
              {f.kind.toUpperCase()}
              {f.pages != null ? ` · ${f.pages} pages` : ""} · {f.sizeLabel}
            </p>
            <p
              className={`mt-1 text-[12px] capitalize ${
                f.status === "processing"
                  ? "text-[var(--rag-accent)]"
                  : f.status === "ready"
                    ? "text-[var(--rag-success)]"
                    : "text-[var(--rag-muted)]"
              }`}
            >
              {f.status === "processing" ? "Processing…" : f.status}
            </p>
          </button>
        );
      })}
    </div>
  );
}
