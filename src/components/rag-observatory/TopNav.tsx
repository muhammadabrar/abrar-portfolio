"use client";

import { StatusDot } from "./shared/StatusDot";

export function TopNav({
  onMenu,
  processing = false,
}: {
  onMenu: () => void;
  processing?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--rag-border)] bg-[var(--rag-bg)]/80 px-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={onMenu}
        className="flex size-8 items-center justify-center rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] text-[var(--rag-muted)] lg:hidden"
        aria-label="Open menu"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4h12v1.5H2V4zm0 3.25h12v1.5H2v-1.5zm0 3.25h12V12H2v-1.5z" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-[var(--rag-muted)]">
          Beginner lab · real Mistral embeddings + Qdrant
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-[var(--rag-border)] px-2.5 py-1">
          <StatusDot status={processing ? "processing" : "ready"} />
          <span className="text-[11px] text-[var(--rag-muted)]">
            {processing ? "Working…" : "Ready"}
          </span>
        </div>
        <div
          className="flex size-8 items-center justify-center rounded-full border border-[var(--rag-border)] bg-[var(--rag-accent-dim)] text-[11px] font-semibold text-[var(--rag-accent)]"
          title="Guest"
        >
          G
        </div>
      </div>
    </header>
  );
}
