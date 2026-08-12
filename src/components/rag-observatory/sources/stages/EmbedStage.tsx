"use client";

import type { EmbedInfo } from "@/lib/rag-observatory/types";
import { STAGE_HELP } from "@/lib/rag-observatory/education";
import { GlassPanel } from "../../shared/GlassPanel";
import { HelpTip } from "../../shared/HelpTip";

function NeuralViz() {
  const nodes = [
    [20, 30],
    [20, 70],
    [50, 20],
    [50, 50],
    [50, 80],
    [80, 35],
    [80, 65],
  ];
  const edges: [number, number][] = [
    [0, 2],
    [0, 3],
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 5],
    [3, 6],
    [4, 6],
  ];

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-full" aria-hidden>
      <defs>
        <radialGradient id="rag-node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--rag-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--rag-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="var(--rag-accent)"
          strokeOpacity="0.25"
          strokeWidth="0.8"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="url(#rag-node-glow)" className="rag-pulse" />
          <circle cx={x} cy={y} r="2.2" fill="var(--rag-accent)" />
        </g>
      ))}
    </svg>
  );
}

export function EmbedStage({
  embeds,
  active,
}: {
  embeds: EmbedInfo[];
  active?: boolean;
}) {
  const latest = embeds[embeds.length - 1];

  return (
    <GlassPanel className="p-4" active={!!active}>
      <h3 className="flex items-center text-sm font-medium text-[var(--rag-ink)]">
        Embedding
        <HelpTip title={STAGE_HELP.embed.title}>
          <p>{STAGE_HELP.embed.plain}</p>
          <p>{STAGE_HELP.embed.detail}</p>
          <p className="text-[var(--rag-faint)]">Test: {STAGE_HELP.embed.test}</p>
        </HelpTip>
      </h3>
      <p className="mt-0.5 text-[12px] text-[var(--rag-muted)]">
        Meaning vectors — pair with BM25 for hybrid later
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)]/50 p-3">
          <NeuralViz />
          <p className="mt-1 text-center rag-mono text-[11px] text-[var(--rag-accent)]">
            {embeds.length
              ? `${embeds.length} embeddings generated`
              : "Awaiting vectors…"}
          </p>
        </div>
        <div className="space-y-2">
          {!latest ? (
            <p className="text-[12px] text-[var(--rag-faint)]">Waiting…</p>
          ) : (
            [
              ["Chunk", latest.chunkId],
              ["Dimensions", String(latest.dimensions)],
              ["Model", latest.model],
              ["Latency", `${latest.latencyMs} ms`],
              ["Tokens", String(latest.tokenCount)],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] px-3 py-2"
              >
                <span className="text-[12px] text-[var(--rag-muted)]">{k}</span>
                <span className="rag-mono text-[12px] text-[var(--rag-ink)]">
                  {v}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
