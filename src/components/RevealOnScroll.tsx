"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !root.current) return;

      const targets = gsap.utils.toArray<HTMLElement>(
        root.current.querySelectorAll(
          "section:not([data-hero-section]), [data-reveal], .project-row, .writing-row, [data-nav-cluster]",
        ),
      );

      targets.forEach((el) => {
        if (el.matches("[data-nav-cluster]")) {
          gsap.from(el, {
            y: 12,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
          });
          return;
        }

        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        });
      });

      const chips = root.current.querySelectorAll(".stack-chip");
      if (chips.length) {
        gsap.from(chips, {
          y: 18,
          opacity: 0,
          scale: 0.9,
          duration: 0.55,
          stagger: 0.045,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chips[0].closest("section") ?? chips[0],
            start: "top 85%",
          },
        });
      }

      const media = root.current.querySelectorAll(".card-media, .project-row-media");
      media.forEach((el) => {
        gsap.from(el, {
          scale: 0.97,
          opacity: 0.65,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          },
        });
      });
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
