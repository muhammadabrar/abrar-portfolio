"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { projects } from "@/content/projects";
import { ProjectGrid } from "@/components/ProjectGrid";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function SelectedWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.from("[data-work-card]", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
        },
      });
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className="shell section">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="section-label mb-0">Selected work</h2>
        <Link
          href="/projects"
          className="text-sm font-semibold text-[color:var(--ink)] hover:opacity-70"
        >
          View all
        </Link>
      </div>
      <div data-work-card>
        <ProjectGrid projects={projects} limit={4} />
      </div>
    </section>
  );
}
