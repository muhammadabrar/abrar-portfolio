import type { ReactNode } from "react";

export function GlassPanel({
  children,
  className = "",
  active = false,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rag-glass ${active ? "rag-stage-active" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
