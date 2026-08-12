"use client";

import { useState } from "react";
import { PIPELINE_RUNS, formatTime } from "@/lib/rag-observatory/mock-documents";
import type { PipelineRun } from "@/lib/rag-observatory/types";
import { GlassPanel } from "./shared/GlassPanel";
import { StatusDot } from "./shared/StatusDot";

export function PipelinesView() {
  const [selected, setSelected] = useState<PipelineRun | null>(
    PIPELINE_RUNS[0] ?? null,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rag-accent)]">
          Pipelines
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Run history
        </h1>
        <p className="mt-1 text-sm text-[var(--rag-muted)]">
          Ingestion and query pipeline executions.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassPanel className="p-2 lg:col-span-2">
          <ul className="divide-y divide-[var(--rag-border)]">
            {PIPELINE_RUNS.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => setSelected(run)}
                  className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors ${
                    selected?.id === run.id
                      ? "bg-[var(--rag-accent-dim)]"
                      : "hover:bg-[var(--rag-surface-hover)]"
                  }`}
                >
                  <StatusDot
                    status={
                      run.status === "success"
                        ? "success"
                        : run.status === "running"
                          ? "processing"
                          : "error"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">
                      {run.title}
                    </p>
                    <p className="rag-mono text-[11px] text-[var(--rag-muted)]">
                      {run.type} · {formatTime(run.startedAt)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel className="p-4 lg:col-span-3">
          {!selected ? (
            <p className="text-sm text-[var(--rag-muted)]">Select a run</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-medium">{selected.title}</h2>
                  <p className="mt-0.5 rag-mono text-[12px] text-[var(--rag-muted)]">
                    {selected.type} · {(selected.durationMs / 1000).toFixed(2)}s
                    · {selected.status}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {selected.stages.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-3 rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] px-3 py-2.5"
                  >
                    <span className="flex-1 text-[13px]">{s.name}</span>
                    <span className="rag-mono text-[12px] text-[var(--rag-muted)]">
                      {s.ms > 0 ? `${s.ms}ms` : "—"}
                    </span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--rag-border)]">
                      <div
                        className="h-full bg-[var(--rag-accent)]"
                        style={{
                          width: `${Math.min(
                            100,
                            (s.ms / Math.max(selected.durationMs, 1)) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
