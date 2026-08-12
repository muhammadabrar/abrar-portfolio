"use client";

import { EVAL_RUNS, formatTime } from "@/lib/rag-observatory/mock-documents";
import { GlassPanel } from "./shared/GlassPanel";

function Score({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 90
      ? "text-[var(--rag-success)]"
      : pct >= 80
        ? "text-[var(--rag-accent)]"
        : "text-[var(--rag-warn)]";
  return <span className={`rag-mono font-medium ${color}`}>{pct}%</span>;
}

export function EvaluationsView() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rag-accent)]">
          Evaluations
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Quality benchmarks
        </h1>
        <p className="mt-1 text-sm text-[var(--rag-muted)]">
          Faithfulness, relevance, and groundedness across golden sets.
        </p>
      </div>

      <GlassPanel className="overflow-x-auto p-4">
        <table className="w-full min-w-[700px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-[var(--rag-border)] text-[11px] uppercase tracking-wider text-[var(--rag-muted)]">
              <th className="pb-2 font-medium">Eval set</th>
              <th className="pb-2 font-medium">Faithfulness</th>
              <th className="pb-2 font-medium">Relevance</th>
              <th className="pb-2 font-medium">Groundedness</th>
              <th className="pb-2 font-medium">Latency</th>
              <th className="pb-2 font-medium">Samples</th>
              <th className="pb-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rag-border)]">
            {EVAL_RUNS.map((e) => (
              <tr key={e.id}>
                <td className="py-3 font-medium">{e.name}</td>
                <td className="py-3">
                  <Score value={e.faithfulness} />
                </td>
                <td className="py-3">
                  <Score value={e.relevance} />
                </td>
                <td className="py-3">
                  <Score value={e.groundedness} />
                </td>
                <td className="py-3 rag-mono text-[var(--rag-muted)]">
                  {e.latencyMs}ms
                </td>
                <td className="py-3 rag-mono">{e.samples}</td>
                <td className="py-3 rag-mono text-[11px] text-[var(--rag-faint)]">
                  {formatTime(e.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassPanel>
    </div>
  );
}
