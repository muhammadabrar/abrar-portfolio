"use client";

import { useState } from "react";
import { site } from "@/content/site";

export function ContactCTA() {
  const [copied, setCopied] = useState(false);

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
    <section id="contact" className="shell section pb-4">
      <h2 className="section-label">Get in touch</h2>
      <p className="max-w-md text-[color:var(--muted)]">
        Have a project in mind? Send a short brief and I&apos;ll reply with scope and timeline.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="tip tip-bottom">
          <button type="button" onClick={copyEmail} className="pill">
            {copied ? "Copied" : site.email}
          </button>
          <span className="tip-bubble" role="tooltip">
            {copied ? "Copied!" : "Copy email"}
          </span>
        </span>
        <a
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="pill pill-ghost"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
