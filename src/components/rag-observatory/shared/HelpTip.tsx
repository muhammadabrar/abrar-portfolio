"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export function HelpTip({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const id = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  return (
    <span className="relative inline-flex align-middle">
      {/* span avoids invalid <button> nesting when HelpTip sits in accordion headers */}
      <span
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`What is ${title}?`}
        title={`What is ${title}?`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle(e);
        }}
        className="ml-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--rag-info-dim)] text-[11px] font-bold text-[var(--rag-info)] ring-1 ring-[rgba(96,165,250,0.35)] transition hover:bg-[rgba(96,165,250,0.28)]"
      >
        ?
      </span>
      {open && mounted
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[60] cursor-default bg-black/40"
                aria-hidden
                onClick={() => setOpen(false)}
              />
              <div
                id={id}
                role="dialog"
                aria-label={title}
                className="rag-help-pop fixed left-1/2 top-[min(30vh,12rem)] z-[70] w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[var(--rag-radius)] p-3.5"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[var(--rag-info)]">
                    {title}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-[11px] text-[var(--rag-faint)] hover:text-[var(--rag-ink)]"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2 text-[12px] leading-relaxed text-[#c5d0de]">
                  {children}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </span>
  );
}
