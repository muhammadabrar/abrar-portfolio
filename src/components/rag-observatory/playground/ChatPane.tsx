"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/rag-observatory/types";
import { DEMO_QUERY } from "@/lib/rag-observatory/mock-documents";
import { TokenStream } from "../shared/TokenStream";

export function ChatPane({
  messages,
  streaming,
  busy,
  onSend,
}: {
  messages: ChatMessage[];
  streaming: string;
  busy: boolean;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState(DEMO_QUERY);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  return (
    <div className="rag-panel-chat flex h-full min-h-[480px] flex-col overflow-hidden lg:min-h-0">
      <div className="border-b border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.08)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full bg-teal-400" />
          <h2 className="text-sm font-semibold text-teal-200">Your chat</h2>
        </div>
        <p className="mt-1 text-[12px] text-[var(--rag-muted)]">
          Ask about your uploaded files. The answer appears here.
        </p>
      </div>

      <div className="rag-scroll flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !streaming ? (
          <div className="rounded-[var(--rag-radius-sm)] border border-dashed border-[rgba(45,212,191,0.25)] bg-[rgba(45,212,191,0.06)] p-4 text-[13px] text-[var(--rag-muted)]">
            <p className="font-medium text-teal-200/90">Try this</p>
            <p className="mt-1">
              Upload a doc first (step 1), then ask something it clearly answers
              — and one thing it does <em>not</em> answer.
            </p>
          </div>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-teal-500/20 text-[var(--rag-ink)] ring-1 ring-teal-400/25"
                : "bg-[var(--rag-surface-solid)] text-[var(--rag-ink)] ring-1 ring-white/5"
            }`}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--rag-faint)]">
              {m.role === "user" ? "You" : "Assistant"}
            </p>
            {m.role === "assistant" ? (
              <TokenStream text={m.content} live={false} />
            ) : (
              m.content
            )}
          </div>
        ))}
        {streaming ? (
          <div className="max-w-[92%] rounded-2xl bg-[var(--rag-surface-solid)] px-3.5 py-2.5 ring-1 ring-teal-400/20">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-teal-300/80">
              Assistant · writing…
            </p>
            <TokenStream text={streaming} />
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-[rgba(45,212,191,0.15)] bg-[rgba(0,0,0,0.2)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const t = input.trim();
          if (!t || busy) return;
          onSend(t);
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            className="min-w-0 flex-1 rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)] px-3 py-2.5 text-[13px] outline-none focus:border-teal-400/50"
            placeholder="Ask a question about your documents…"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-[var(--rag-radius-sm)] bg-teal-400 px-4 py-2.5 text-[13px] font-semibold text-[#042f2e] disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
