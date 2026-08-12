"use client";

import { useMemo, useState } from "react";
import { SEED_KNOWLEDGE } from "@/lib/rag-observatory/mock-documents";
import { GlassPanel } from "../shared/GlassPanel";
import { StatusDot } from "../shared/StatusDot";

export function KnowledgeExplorer() {
  const [q, setQ] = useState("");
  const docs = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SEED_KNOWLEDGE;
    return SEED_KNOWLEDGE.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.department.toLowerCase().includes(term),
    );
  }, [q]);

  const totals = useMemo(() => {
    return {
      documents: SEED_KNOWLEDGE.length,
      chunks: SEED_KNOWLEDGE.reduce((s, d) => s + d.chunks, 0),
      embeddings: SEED_KNOWLEDGE.reduce((s, d) => s + d.embeddings, 0),
      storage: SEED_KNOWLEDGE.reduce((s, d) => s + d.storageMb, 0),
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rag-accent)]">
          Knowledge base
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Document explorer
        </h1>
        <p className="mt-1 text-sm text-[var(--rag-muted)]">
          Indexed corpus ready for retrieval.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Documents", String(totals.documents)],
          ["Total Chunks", totals.chunks.toLocaleString()],
          ["Embeddings", totals.embeddings.toLocaleString()],
          ["Storage Size", `${totals.storage.toFixed(1)} MB`],
        ].map(([label, value]) => (
          <GlassPanel key={label} className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-[var(--rag-muted)]">
              {label}
            </p>
            <p className="mt-1 rag-mono text-2xl font-medium">{value}</p>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium">Indexed documents</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)] px-3 py-2 text-[13px] outline-none focus:border-[rgba(45,212,191,0.4)] sm:max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--rag-border)] text-[11px] uppercase tracking-wider text-[var(--rag-muted)]">
                <th className="pb-2 font-medium">Document</th>
                <th className="pb-2 font-medium">Dept</th>
                <th className="pb-2 font-medium">Chunks</th>
                <th className="pb-2 font-medium">Storage</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rag-border)]">
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="py-3">
                    <p className="font-medium text-[var(--rag-ink)]">{d.name}</p>
                    <p className="rag-mono text-[11px] text-[var(--rag-faint)]">
                      {d.kind}
                    </p>
                  </td>
                  <td className="py-3 text-[var(--rag-muted)]">{d.department}</td>
                  <td className="py-3 rag-mono">{d.chunks}</td>
                  <td className="py-3 rag-mono text-[var(--rag-muted)]">
                    {d.storageMb} MB
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] capitalize text-[var(--rag-success)]">
                      <StatusDot status="ready" />
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
