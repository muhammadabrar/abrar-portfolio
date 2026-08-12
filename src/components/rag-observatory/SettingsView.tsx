"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearLocalGuest,
  getByokKey,
  getOrCreateLocalGuest,
  ragFetch,
  setByokKey,
} from "@/lib/rag-observatory/client-guest";
import { GlassPanel } from "./shared/GlassPanel";
import { HelpTip } from "./shared/HelpTip";

type GuestView = {
  guestId: string;
  uploadsUsed: number;
  uploadsMax: number;
  embeddingTokensUsed: number;
  embeddingTokensMax: number;
  queriesToday: number;
  queriesMax: number;
  llmTokensToday: number;
  llmTokensMax: number;
  collectionName: string;
  ttlHours: number;
};

export function SettingsView() {
  const [guest, setGuest] = useState<GuestView | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    getOrCreateLocalGuest();
    setApiKey(getByokKey());
    const res = await ragFetch("/api/rag/guest");
    const data = await res.json();
    if (data.guest) setGuest(data.guest);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveKey = async () => {
    setBusy(true);
    setStatus(null);
    try {
      if (!apiKey.trim()) {
        setByokKey("");
        setStatus("Using free platform key (rate limited).");
        return;
      }
      const res = await ragFetch("/api/rag/settings/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? "Key validation failed");
        return;
      }
      setByokKey(apiKey);
      setStatus("Key saved locally. Unlimited mode enabled for this browser.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (
      !confirm(
        "Reset this sandbox? Your Qdrant collection and local guest id will be wiped.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await ragFetch("/api/rag/reset", { method: "POST" });
      clearLocalGuest();
      getOrCreateLocalGuest();
      setByokKey("");
      setApiKey("");
      setStatus("Sandbox reset. You are a new guest.");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--rag-accent)]">
          Settings
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Limits & keys
        </h1>
        <p className="mt-1 text-sm text-[var(--rag-muted)]">
          You are a guest — no login. Identity stays in this browser. Free tier
          uses the site&apos;s Mistral key with limits; add your own key for
          more.
        </p>
      </div>

      <GlassPanel className="space-y-3 p-5">
        <h2 className="text-sm font-medium">
          Free quota
          <HelpTip title="Why limits?">
            <p>
              Shared API keys cost money. Limits keep the demo fair. Your own
              key unlocks more usage.
            </p>
          </HelpTip>
        </h2>
        {guest ? (
          <ul className="space-y-2 text-[13px] text-[var(--rag-muted)]">
            <li>
              Uploads:{" "}
              <span className="rag-mono text-[var(--rag-ink)]">
                {guest.uploadsUsed}/{guest.uploadsMax}
              </span>{" "}
              (lifetime)
            </li>
            <li>
              Embedding tokens:{" "}
              <span className="rag-mono text-[var(--rag-ink)]">
                {guest.embeddingTokensUsed}/{guest.embeddingTokensMax}
              </span>
            </li>
            <li>
              Playground queries today:{" "}
              <span className="rag-mono text-[var(--rag-ink)]">
                {guest.queriesToday}/{guest.queriesMax}
              </span>
            </li>
            <li>
              LLM tokens today:{" "}
              <span className="rag-mono text-[var(--rag-ink)]">
                {guest.llmTokensToday}/{guest.llmTokensMax}
              </span>
            </li>
            <li>
              Vector retention:{" "}
              <span className="rag-mono text-[var(--rag-ink)]">
                {guest.ttlHours} hours
              </span>
            </li>
            <li>
              Collection:{" "}
              <span className="rag-mono text-[11px] text-[var(--rag-ink)]">
                {guest.collectionName}
              </span>
            </li>
          </ul>
        ) : (
          <p className="text-[13px] text-[var(--rag-faint)]">Loading…</p>
        )}
      </GlassPanel>

      <GlassPanel className="space-y-3 p-5">
        <h2 className="text-sm font-medium">
          Your Mistral API key (optional)
          <HelpTip title="BYOK">
            <p>
              The key is stored only in your browser localStorage and sent to
              our API routes for embedding/chat. It is never written to the
              database.
            </p>
          </HelpTip>
        </h2>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="mistral-…"
          className="w-full rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] bg-[var(--rag-bg)] px-3 py-2 text-[13px] outline-none focus:border-[rgba(45,212,191,0.4)]"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveKey()}
            className="rounded-[var(--rag-radius-sm)] bg-[var(--rag-accent)] px-3 py-2 text-[13px] font-medium text-[#042f2e] disabled:opacity-40"
          >
            Save key
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setApiKey("");
              setByokKey("");
              setStatus("Cleared. Back to free limits.");
            }}
            className="rounded-[var(--rag-radius-sm)] border border-[var(--rag-border)] px-3 py-2 text-[13px]"
          >
            Clear key
          </button>
        </div>
        {status ? (
          <p className="text-[12px] text-[var(--rag-muted)]">{status}</p>
        ) : null}
      </GlassPanel>

      <GlassPanel className="space-y-3 p-5">
        <h2 className="text-sm font-medium">Guest identity</h2>
        <p className="rag-mono break-all text-[12px] text-[var(--rag-muted)]">
          {guest?.guestId ?? "…"}
        </p>
        <p className="text-[12px] text-[var(--rag-faint)]">
          Clearing site data creates a new guest and a new empty collection.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void reset()}
          className="rounded-[var(--rag-radius-sm)] border border-[rgba(248,113,113,0.4)] px-3 py-2 text-[13px] text-[var(--rag-danger)]"
        >
          Reset my sandbox
        </button>
      </GlassPanel>
    </div>
  );
}
