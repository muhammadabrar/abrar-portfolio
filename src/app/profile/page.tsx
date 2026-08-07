import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { getFeaturedProjects } from "@/content/projects";
import { Stack } from "@/components/Stack";
import { LatestWriting } from "@/components/LatestWriting";
import { ExperienceSkills } from "@/components/ExperienceSkills";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "About Muhammad Abrar — full-stack engineer building AI products, WebAR, and production systems.",
};

export default function ProfilePage() {
  const building = site.currentlyBuilding;
  const featured = getFeaturedProjects().slice(0, 2);

  return (
    <div className="shell py-12 sm:py-16">
      <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight">About me</h1>
      <p className="mt-4 max-w-2xl text-lg text-[color:var(--muted)]">{site.about.intro}</p>

      <section className="mt-14">
        <h2 className="section-label">Story</h2>
        <div className="space-y-5 text-[color:var(--muted)]">
          {site.about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-5 text-sm text-[color:var(--muted)]">{site.about.education}</p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{site.location}</p>

        <div className="relative mt-8 grid grid-cols-3 gap-3">
          <div className="aspect-[3/4] overflow-hidden rounded-[1.1rem] bg-[color:var(--soft)]">
            <Image
              src="/images/abrar-avatar.png"
              alt={site.name}
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
        </div>
      </section>

      <section className="mt-14 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="section-label">Focus areas</h2>
          <ul className="space-y-2.5 text-[color:var(--muted)]">
            {site.favorites.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="section-label">Interests</h2>
          <ul className="space-y-2.5 text-[color:var(--muted)]">
            {site.favorites.interests.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-8">
        <Stack className="pt-0" />
      </div>

      <section className="section pt-4">
        <h2 className="section-label">Currently building</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {building.map((item) => (
            <div
              key={item.name}
              className="rounded-[1.25rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-5"
            >
              <h3 className="font-semibold tracking-tight">{item.name}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{item.description}</p>
            </div>
          ))}
          {featured.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="rounded-[1.25rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 transition-colors hover:bg-[color:var(--soft)]"
            >
              <h3 className="font-semibold tracking-tight">{project.name}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{project.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <ExperienceSkills className="section" />
      <LatestWriting className="section" />

      <section className="section pb-4 pt-2">
        <h2 className="section-label">Get in touch</h2>
        <p className="text-[color:var(--muted)]">
          Want to collaborate or discuss a project?
        </p>
        <a href={`mailto:${site.email}`} className="pill mt-5 inline-flex">
          {site.email}
        </a>
      </section>
    </div>
  );
}
