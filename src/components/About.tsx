import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export function About() {
  return (
    <section id="about" className="shell section">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="section-label mb-0">About</h2>
        <Link
          href="/profile"
          className="text-sm font-semibold text-[color:var(--ink)] hover:opacity-70"
        >
          Full profile
        </Link>
      </div>
      <div className="space-y-4 text-[color:var(--muted)]">
        <p>{site.about.intro}</p>
        <p>{site.about.paragraphs[0]}</p>
      </div>
      <p className="mt-4 text-sm text-[color:var(--muted)]">{site.location}</p>

     
    </section>
  );
}
