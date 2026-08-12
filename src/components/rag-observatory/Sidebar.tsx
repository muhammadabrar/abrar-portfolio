"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: {
  href: string;
  step: string;
  label: string;
  hint: string;
  color: string;
}[] = [
  {
    href: "/abrar-sandbox/RAG/sources",
    step: "1",
    label: "Upload docs",
    hint: "Teach the system",
    color: "bg-amber-400/20 text-amber-300 ring-amber-400/30",
  },
  {
    href: "/abrar-sandbox/RAG/playground",
    step: "2",
    label: "Ask & test",
    hint: "Chat + see the steps",
    color: "bg-teal-400/20 text-teal-300 ring-teal-400/30",
  },
  {
    href: "/abrar-sandbox/RAG/settings",
    step: "3",
    label: "Settings",
    hint: "Limits & your API key",
    color: "bg-sky-400/20 text-sky-300 ring-sky-400/30",
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/55 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--rag-sidebar-w)] flex-col border-r border-[var(--rag-border)] bg-[var(--rag-bg-elevated)] transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-[var(--rag-border)] px-4 py-5">
          <Link
            href="/abrar-sandbox/RAG/sources"
            className="block"
            onClick={onClose}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-teal-300">
              AbrarSandbox
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--rag-ink)]">
              RAG Lab
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-[var(--rag-muted)]">
              Follow steps 1 → 2 → 3 to learn RAG.
            </p>
          </Link>
        </div>

        <nav className="rag-scroll flex-1 space-y-2 overflow-y-auto px-3 py-4">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rag-faint)]">
            Path
          </p>
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-start gap-3 rounded-[var(--rag-radius-sm)] px-3 py-3 transition-colors ${
                  active
                    ? "bg-[var(--rag-surface-solid)] ring-1 ring-[var(--rag-border-strong)]"
                    : "hover:bg-[var(--rag-surface-hover)]"
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ring-1 ${item.color}`}
                >
                  {item.step}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[14px] font-medium ${
                      active ? "text-[var(--rag-ink)]" : "text-[var(--rag-muted)]"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[var(--rag-faint)]">
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--rag-border)] p-3">
          <Link
            href="/projects"
            className="block rounded-[var(--rag-radius-sm)] px-3 py-2 text-[12px] text-[var(--rag-muted)] transition-colors hover:bg-[var(--rag-surface-hover)] hover:text-[var(--rag-ink)]"
          >
            ← Back to portfolio
          </Link>
        </div>
      </aside>
    </>
  );
}
