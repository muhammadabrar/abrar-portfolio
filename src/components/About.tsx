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

      <div className="relative mt-8 grid grid-cols-3 gap-3">
        <div className="aspect-[3/4] overflow-hidden rounded-[1.1rem] bg-[color:var(--soft)]">
          <Image
            src="/images/abrar-avatar.png"
            alt=""
            width={280}
            height={360}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="aspect-[3/4] overflow-hidden rounded-[1.1rem] bg-[color:var(--soft)]">
          <Image
            src="/images/abrar-portrait.png"
            alt=""
            width={280}
            height={360}
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div
          className="aspect-[3/4] overflow-hidden rounded-[1.1rem]"
          style={{
            background:
              "linear-gradient(160deg, #ececec 0%, #cfcfcf 45%, #8a8a8a 100%)",
          }}
          aria-hidden
        />
        <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--ink)] shadow-sm">
          Say hi
        </span>
      </div>
    </section>
  );
}
