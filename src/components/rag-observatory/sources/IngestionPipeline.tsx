"use client";

import type { IngestionRun } from "@/lib/rag-observatory/types";
import { StageNode } from "../shared/StageNode";
import { GlassPanel } from "../shared/GlassPanel";
import { ParseStage } from "./stages/ParseStage";
import { CleanStage } from "./stages/CleanStage";
import { MetadataStage } from "./stages/MetadataStage";
import { ChunkStage } from "./stages/ChunkStage";
import { EmbedStage } from "./stages/EmbedStage";
import { StoreStage } from "./stages/StoreStage";

export function IngestionPipeline({ run }: { run: IngestionRun | null }) {
  if (!run) {
    return (
      <GlassPanel className="flex min-h-[280px] items-center justify-center p-8">
        <p className="max-w-sm text-center text-sm text-[var(--rag-muted)]">
          Upload or select a source to watch the live ingestion pipeline —
          parse, clean, chunk, embed, and index in real time.
        </p>
      </GlassPanel>
    );
  }

  const active = run.activeStage;

  return (
    <div className="space-y-4">
      <GlassPanel className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-[var(--rag-ink)]">
            Live pipeline
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--rag-border)] sm:w-40">
              <div
                className="h-full rounded-full bg-[var(--rag-accent)] transition-[width] duration-300"
                style={{ width: `${run.progress}%` }}
              />
            </div>
            <span className="rag-mono text-[11px] text-[var(--rag-muted)]">
              {run.progress}%
            </span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {run.stages.map((s) => (
            <StageNode
              key={s.id}
              label={s.label}
              status={s.status}
              durationMs={s.durationMs}
            />
          ))}
        </div>
      </GlassPanel>

      <div className="grid gap-4">
        {(active === "parse" ||
          run.parseEvents.length > 0 ||
          run.stages.find((s) => s.id === "parse")?.status === "done") && (
          <ParseStage events={run.parseEvents} active={active === "parse"} />
        )}
        {(active === "clean" || run.cleanStats) && (
          <CleanStage stats={run.cleanStats} active={active === "clean"} />
        )}
        {(active === "metadata" || Object.keys(run.metadata).length > 0) && (
          <MetadataStage
            metadata={run.metadata}
            active={active === "metadata"}
          />
        )}
        {(active === "chunk" || run.chunks.length > 0) && (
          <ChunkStage chunks={run.chunks} active={active === "chunk"} />
        )}
        {(active === "embed" || run.embeds.length > 0) && (
          <EmbedStage embeds={run.embeds} active={active === "embed"} />
        )}
        {(active === "store" ||
          active === "index" ||
          active === "ready" ||
          run.store) && (
          <StoreStage
            store={run.store}
            active={active === "store" || active === "index"}
          />
        )}
      </div>
    </div>
  );
}
