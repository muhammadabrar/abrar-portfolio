"use client";

import Link from "next/link";
import { DASHBOARD_METRICS, PIPELINE_RUNS } from "@/lib/rag-observatory/mock-documents";
import { MetricCard } from "../shared/MetricCard";
import { GlassPanel } from "../shared/GlassPanel";
import { StatusDot } from "../shared/StatusDot";

export function MonitoringDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rag-accent)]">
            Production monitoring
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--rag-ink)]">
            Observatory
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--rag-muted)]">
            Live operational signal across retrieval, embeddings, generation, and
            vector store health.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/abrar-sandbox/RAG/sources"
            className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-surface-solid)] px-3 py-2 text-[13px] text-[var(--rag-ink)] transition-colors hover:border-[rgba(45,212,191,0.4)]"
          >
            Ingest data
          </Link>
          <Link
            href="/abrar-sandbox/RAG/playground"
            className="rounded-[var(--rag-radius-sm)] bg-[var(--rag-accent)] px-3 py-2 text-[13px] font-medium text-[#042f2e] transition-opacity hover:opacity-90"
          >
            Open playground
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <GlassPanel className="p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--rag-ink)]">
              Recent pipeline runs
            </h2>
            <Link
              href="/abrar-sandbox/RAG/pipelines"
              className="text-[12px] text-[var(--rag-accent)] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--rag-border)]">
            {PIPELINE_RUNS.slice(0, 5).map((run) => (
              <li
                key={run.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
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
                  <p className="truncate text-[13px] font-medium text-[var(--rag-ink)]">
                    {run.title}
                  </p>
                  <p className="rag-mono text-[11px] text-[var(--rag-muted)]">
                    {run.type} · {(run.durationMs / 1000).toFixed(1)}s
                  </p>
                </div>
                <span
                  className={`rag-mono text-[11px] capitalize ${
                    run.status === "failed"
                      ? "text-[var(--rag-danger)]"
                      : "text-[var(--rag-muted)]"
                  }`}
                >
                  {run.status}
                </span>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel className="space-y-4 p-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-[var(--rag-ink)]">
            System pulse
          </h2>
          <div className="space-y-3">
            {[
              { label: "Qdrant cluster", value: "Healthy", ok: true },
              { label: "Embedding workers", value: "4 / 4", ok: true },
              { label: "LLM gateway", value: "Degraded latency", ok: false },
              { label: "Failed requests (1h)", value: "3", ok: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/40 px-3 py-2.5"
              >
                <span className="text-[13px] text-[var(--rag-muted)]">
                  {row.label}
                </span>
                <span
                  className={`rag-mono text-[12px] ${
                    row.ok
                      ? "text-[var(--rag-success)]"
                      : "text-[var(--rag-warn)]"
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[12px] leading-relaxed text-[var(--rag-faint)]">
            Demo data — metrics update when you run ingestion or playground
            queries.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
