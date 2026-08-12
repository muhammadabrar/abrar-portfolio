"use client";

import { AUDIT_HISTORY, formatTime } from "@/lib/rag-observatory/mock-documents";
import { GlassPanel } from "./shared/GlassPanel";
import { TimelineAudit } from "./playground/TimelineAudit";

export function AuditTrailView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rag-accent)]">
          Audit trail
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Execution log
        </h1>
        <p className="mt-1 text-sm text-[var(--rag-muted)]">
          LangSmith-style timeline of the latest production query.
        </p>
      </div>

      <GlassPanel className="p-5">
        <p className="mb-4 text-[12px] text-[var(--rag-muted)]">
          Last run · {formatTime(AUDIT_HISTORY[0]?.timestamp ?? "")}
        </p>
        <TimelineAudit entries={AUDIT_HISTORY} />
      </GlassPanel>
    </div>
  );
}
