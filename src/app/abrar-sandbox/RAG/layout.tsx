import type { Metadata } from "next";
import { RagAppShell } from "@/components/rag-observatory/RagAppShell";

export const metadata: Metadata = {
  title: "RAG Observatory · AbrarSandbox",
  description:
    "Interactive demo of a transparent RAG platform — ingestion, retrieval, and answer generation observability.",
  robots: { index: true, follow: true },
};

export default function RagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RagAppShell>{children}</RagAppShell>;
}
