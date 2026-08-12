export function StatusDot({
  status,
}: {
  status: "idle" | "processing" | "ready" | "error" | "success";
}) {
  const color =
    status === "processing"
      ? "bg-[var(--rag-accent)] rag-pulse"
      : status === "ready" || status === "success"
        ? "bg-[var(--rag-success)]"
        : status === "error"
          ? "bg-[var(--rag-danger)]"
          : "bg-[var(--rag-faint)]";

  return (
    <span
      className={`inline-block size-1.5 shrink-0 rounded-full ${color}`}
      aria-hidden
    />
  );
}
