"use client";

import { site } from "@/content/site";
import { NavBar } from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RevealOnScroll>
        <NavBar />
        <main className="flex-1 pb-10">{children}</main>
        <footer className="shell pb-28 pt-12">
          <hr className="divider mb-8" />
          <div className="flex flex-col gap-3 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.name}
            </p>
            <div className="flex gap-5">
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${site.email}`}
                className="transition-opacity hover:opacity-70"
              >
                {site.email}
              </a>
            </div>
          </div>
        </footer>
      </RevealOnScroll>
      <div className="page-blur-bottom" aria-hidden />
    </ThemeProvider>
  );
}
