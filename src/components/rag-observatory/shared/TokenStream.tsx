"use client";

import { useEffect, useState } from "react";

export function TokenStream({
  text,
  className = "",
  live = true,
}: {
  text: string;
  className?: string;
  live?: boolean;
}) {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, [live]);

  return (
    <div
      className={`prose-stream whitespace-pre-wrap text-sm leading-relaxed text-[var(--rag-ink)] ${className}`}
    >
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-[var(--rag-accent)]">
            {part}
          </strong>
        ) : (
          <span key={i}>
            {part.split("*").map((p2, j) =>
              j % 2 === 1 ? (
                <em key={j} className="text-[var(--rag-muted)]">
                  {p2}
                </em>
              ) : (
                <span key={j}>{p2}</span>
              ),
            )}
          </span>
        ),
      )}
      {live ? (
        showCursor ? (
          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-[var(--rag-accent)]" />
        ) : (
          <span className="ml-0.5 inline-block h-4 w-[2px]" />
        )
      ) : null}
    </div>
  );
}
