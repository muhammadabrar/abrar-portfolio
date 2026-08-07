"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !root.current) return;
      gsap.from("[data-hero]", {
        y: 22,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    { scope: root },
  );

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  }

  return (
    <section ref={root} className="shell pt-10 pb-10 text-center sm:pt-14">
      <div
        data-hero
        className="soft-float mx-auto mb-7 h-20 w-20 overflow-hidden rounded-full bg-[color:var(--soft)] ring-4 ring-[color:var(--surface)] shadow-sm"
      >
        <Image
          src="/images/abrar-avatar.png"
          alt={site.name}
          width={160}
          height={160}
          className="h-full w-full object-cover object-[center_20%]"
          priority
        />
      </div>
      <h1
        data-hero
        className="text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight text-[color:var(--ink)]"
      >
        Hi, I&apos;m {site.firstName}.
      </h1>
      <p data-hero className="mx-auto mt-3 max-w-md text-[color:var(--muted)]">
        {site.tagline}
      </p>
      <div data-hero className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <span className="tip tip-bottom">
          <button type="button" onClick={copyEmail} className="pill">
            {copied ? "Copied" : site.email}
          </button>
          <span className="tip-bubble" role="tooltip">
            {copied ? "Copied!" : "Copy email"}
          </span>
        </span>
        <a href="/projects" className="pill pill-ghost">
          View work
        </a>
      </div>
    </section>
  );
}
