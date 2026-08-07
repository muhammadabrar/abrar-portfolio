"use client";

import { useEffect, useRef, useState } from "react";

export function ProjectsCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setActive(true);
    document.documentElement.classList.add("projects-cursor-on");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y };
    let raf = 0;
    let hot = false;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const next = Boolean(target?.closest("a.project-row, button"));
      if (next !== hot) {
        hot = next;
        setHovering(next);
      }
    };

    const tick = () => {
      // Laggy follow — slightly slow
      cur.x += (pos.x - cur.x) * 0.075;
      cur.y += (pos.y - cur.y) * 0.075;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("projects-cursor-on");
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      className={`projects-cursor ${hovering ? "projects-cursor-hot" : ""}`}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 17L17 7M17 7H9M17 7v8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
