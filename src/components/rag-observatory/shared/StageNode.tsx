import type { StageStatus } from "@/lib/rag-observatory/types";
import { StatusDot } from "./StatusDot";

export function StageNode({
  label,
  status,
  durationMs,
}: {
  label: string;
  status: StageStatus;
  durationMs?: number;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[var(--rag-radius-sm)] border px-3 py-2.5 transition-colors ${
        status === "active"
          ? "rag-stage-active border-[rgba(45,212,191,0.45)] bg-[var(--rag-accent-dim)]"
          : status === "done"
            ? "border-[var(--rag-border)] bg-[var(--rag-surface-solid)]"
            : "border-[var(--rag-border)] bg-transparent opacity-50"
      }`}
    >
      <StatusDot
        status={
          status === "active"
            ? "processing"
            : status === "done"
              ? "success"
              : status === "error"
                ? "error"
                : "idle"
        }
      />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {durationMs != null && status === "done" ? (
        <span className="rag-mono text-[11px] text-[var(--rag-muted)]">
          {(durationMs / 1000).toFixed(1)}s
        </span>
      ) : status === "active" ? (
        <span className="rag-mono text-[11px] text-[var(--rag-accent)]">
          live
        </span>
      ) : null}
    </div>
  );
}
