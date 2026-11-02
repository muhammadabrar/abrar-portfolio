"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QUERY_PIPELINE, TEST_GUIDE } from "@/lib/rag-observatory/education";
import { ragFetch } from "@/lib/rag-observatory/client-guest";
import type { ChatMessage, QueryAuditState } from "@/lib/rag-observatory/types";
import { createIdleAudit } from "@/lib/rag-observatory/query-simulator";
import { useRagShell } from "../RagAppShell";
import { ChatPane } from "./ChatPane";
import { AuditPanel } from "./AuditPanel";
import { GlassPanel } from "../shared/GlassPanel";
import { HelpTip } from "../shared/HelpTip";
import { RagArchitecture } from "../shared/RagArchitecture";

type Quota = {
  queriesToday: number;
  queriesMax: number;
  llmTokensToday: number;
  llmTokensMax: number;
};

export function PlaygroundExperience() {
  const { setProcessing } = useRagShell();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [audit, setAudit] = useState<QueryAuditState>(createIdleAudit);
  const [busy, setBusy] = useState(false);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refreshQuota = useCallback(async () => {
    const res = await ragFetch("/api/rag/guest");
    const data = await res.json();
    if (data.guest) {
      setQuota({
        queriesToday: data.guest.queriesToday,
        queriesMax: data.guest.queriesMax,
        llmTokensToday: data.guest.llmTokensToday,
        llmTokensMax: data.guest.llmTokensMax,
      });
    }
  }, []);

  useEffect(() => {
    void refreshQuota();
    return () => abortRef.current?.abort();
  }, [refreshQuota]);

  const onSend = useCallback(
    async (text: string) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setError(null);
      setMessages((m) => [
        ...m,
        {
          id: `u-${Date.now()}`,
          role: "user",
          content: text,
          createdAt: new Date().toISOString(),
        },
      ]);
      setBusy(true);
      setProcessing(true);
      setAudit(createIdleAudit());

      try {
        const res = await ragFetch("/api/rag/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
          signal: ac.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Query failed" }));
          throw new Error(err.error ?? "Query failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");
        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";
        let state = createIdleAudit();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as {
              type: string;
              data: Record<string, unknown>;
            };
            if (event.type === "rewrite") {
              state = {
                ...state,
                phase: "rewrite",
                understanding: {
                  original: String(event.data.original ?? ""),
                  intent: String(event.data.intent ?? ""),
                  entities: (event.data.entities as string[]) ?? [],
                  filters: (event.data.filters as string[]) ?? [],
                  expandedQueries:
                    (event.data.expandedQueries as string[]) ?? [],
                  rewrittenQuery: String(event.data.rewrittenQuery ?? ""),
                },
              };
            } else if (event.type === "metadataFilter") {
              state = {
                ...state,
                phase: "metadataFilter",
                metadataFilters: (event.data.filters as string[]) ?? [],
              };
            } else if (event.type === "hybrid") {
              state = {
                ...state,
                phase: "hybrid",
                vectorHits:
                  (event.data.vectorHits as QueryAuditState["vectorHits"]) ??
                  [],
                keywordHits:
                  (event.data.keywordHits as QueryAuditState["keywordHits"]) ??
                  [],
                candidates:
                  (event.data.candidates as QueryAuditState["candidates"]) ??
                  [],
              };
            } else if (event.type === "rerank") {
              state = {
                ...state,
                phase: "rerank",
                reranked:
                  (event.data.reranked as QueryAuditState["reranked"]) ?? [],
                selected:
                  (event.data.reranked as QueryAuditState["selected"]) ?? [],
              };
            } else if (event.type === "context") {
              state = {
                ...state,
                phase: "context",
                contextChunks:
                  (event.data
                    .contextChunks as QueryAuditState["contextChunks"]) ?? [],
                contextTokensUsed: Number(event.data.contextTokensUsed ?? 0),
                contextTokensMax: Number(event.data.contextTokensMax ?? 4000),
              };
            } else if (event.type === "token") {
              answer += String(event.data.text ?? "");
              state = {
                ...state,
                phase: "generation",
                streamingAnswer: answer,
              };
            } else if (event.type === "evaluation") {
              state = {
                ...state,
                phase: "evaluation",
                groundedEvaluation:
                  event.data as QueryAuditState["groundedEvaluation"],
              };
            } else if (event.type === "done") {
              const timeline = (
                (event.data.timeline as { label: string; durationMs: number }[]) ??
                []
              ).map((t, i) => ({
                id: `t-${i}`,
                timestamp: new Date().toISOString(),
                label: t.label,
                durationMs: t.durationMs,
              }));
              state = {
                ...state,
                phase: "done",
                fullAnswer: String(event.data.answer ?? answer),
                streamingAnswer: "",
                explainability: event.data
                  .explainability as QueryAuditState["explainability"],
                groundedEvaluation:
                  (event.data
                    .groundedEvaluation as QueryAuditState["groundedEvaluation"]) ??
                  state.groundedEvaluation,
                timeline,
              };
              answer = String(event.data.answer ?? answer);
            } else if (event.type === "error") {
              throw new Error(String(event.data.message ?? "Query error"));
            }
            setAudit({ ...state });
          }
        }

        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: answer || "No answer generated.",
            createdAt: new Date().toISOString(),
          },
        ]);
        void refreshQuota();
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const message = e instanceof Error ? e.message : "Query failed";
        setError(message);
        setMessages((m) => [
          ...m,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: message,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setBusy(false);
        setProcessing(false);
      }
    },
    [refreshQuota, setProcessing],
  );

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-[1400px] flex-col gap-4">
      <div className="shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-semibold text-teal-300 ring-1 ring-teal-400/25">
            Step 2
          </span>
          {quota ? (
            <>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-[var(--rag-muted)] ring-1 ring-white/10">
                {quota.queriesToday}/{quota.queriesMax} queries today
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-[var(--rag-muted)] ring-1 ring-white/10">
                {quota.llmTokensToday}/{quota.llmTokensMax} tokens
              </span>
            </>
          ) : null}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Ask a question
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--rag-muted)]">
          <span className="text-teal-300">Left = chat</span>
          {" · "}
          <span className="text-sky-300">
            Right = production path (rewrite → hybrid → rerank → citations)
          </span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUERY_PIPELINE.map((s) => (
            <span
              key={s.id}
              className="rounded-full border border-teal-400/20 bg-teal-500/5 px-2 py-0.5 text-[10px] text-teal-200/90"
            >
              {s.label}
            </span>
          ))}
        </div>
        {error ? (
          <p className="mt-2 text-[13px] text-[var(--rag-danger)]">
            {error}{" "}
            <a href="/abrar-sandbox/RAG/settings" className="underline">
              Settings
            </a>
          </p>
        ) : null}
      </div>

      <RagArchitecture compact />

      <GlassPanel className="shrink-0 border-amber-400/20 bg-amber-500/[0.06] p-3.5">
        <div className="flex w-full items-center justify-between gap-2">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center justify-between text-left"
            onClick={() => setGuideOpen((v) => !v)}
          >
            <span className="text-sm font-medium text-amber-200">
              How to test RAG
            </span>
            <span className="text-[12px] text-amber-200/70">
              {guideOpen ? "Hide" : "Show tips"}
            </span>
          </button>
          <HelpTip title="Why test?">
            <p>
              A chatbot can sound confident and still be wrong. Use these
              checks to verify grounding.
            </p>
          </HelpTip>
        </div>
        {guideOpen ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TEST_GUIDE.map((g) => (
              <li
                key={g.title}
                className="rounded-[var(--rag-radius-sm)] border border-amber-400/15 bg-[var(--rag-bg)]/60 p-3"
              >
                <p className="text-[13px] font-medium text-amber-200">
                  {g.title}
                </p>
                <p className="mt-1 text-[12px] text-[var(--rag-muted)]">
                  {g.detail}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </GlassPanel>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <ChatPane
          messages={messages}
          streaming={busy ? audit.streamingAnswer : ""}
          busy={busy}
          onSend={onSend}
        />
        <AuditPanel audit={audit} />
      </div>
    </div>
  );
}
