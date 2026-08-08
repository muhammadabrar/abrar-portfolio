"use client";

import { useEffect, useRef, useState } from "react";

export function ProjectsCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y };
    let raf = 0;
    let overProject = false;

    const isProjectTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return Boolean(el?.closest?.("a.project-row"));
    };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const next = isProjectTarget(e.target);
      if (next !== overProject) {
        overProject = next;
        setVisible(next);
        document.documentElement.classList.toggle("projects-cursor-on", next);
      }
    };

    const onLeave = () => {
      overProject = false;
      setVisible(false);
      document.documentElement.classList.remove("projects-cursor-on");
    };

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.075;
      cur.y += (pos.y - cur.y) * 0.075;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("projects-cursor-on");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className={`projects-cursor ${visible ? "projects-cursor-visible" : ""}`}
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
