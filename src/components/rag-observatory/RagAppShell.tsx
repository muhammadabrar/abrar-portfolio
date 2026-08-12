"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

type RagShellContextValue = {
  processing: boolean;
  setProcessing: (v: boolean) => void;
};

const RagShellContext = createContext<RagShellContextValue | null>(null);

export function useRagShell() {
  const ctx = useContext(RagShellContext);
  if (!ctx) {
    return {
      processing: false,
      setProcessing: () => undefined,
    };
  }
  return ctx;
}

export function RagAppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const value = useMemo(
    () => ({ processing, setProcessing }),
    [processing],
  );

  return (
    <RagShellContext.Provider value={value}>
      <div className="rag-obs flex min-h-dvh">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav
            onMenu={() => setSidebarOpen(true)}
            processing={processing}
          />
          <main className="rag-scroll flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </RagShellContext.Provider>
  );
}
