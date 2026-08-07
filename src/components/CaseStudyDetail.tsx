import Link from "next/link";
import type { Project } from "@/content/projects";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export function CaseStudyDetail({ project }: { project: Project }) {
  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 2);

  return (
    <article className="shell pb-8 pt-10">
      <Link href="/#work" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]">
        ← Work
      </Link>

      <div
        className="card-media mt-6"
        style={{ background: project.cover }}
      />

      <p className="mt-8 text-sm text-[color:var(--muted)]">{project.eyebrow}</p>
      <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight">
        {project.name}
      </h1>
      <p className="mt-3 max-w-xl text-[color:var(--muted)]">{project.summary}</p>

      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pill mt-6 inline-flex"
        >
          {project.liveLabel ?? "View live"}
        </a>
      )}

      <div className="mt-12 space-y-10">
        <section>
          <h2 className="section-label">Problem</h2>
          <p className="text-[color:var(--muted)]">{project.problem}</p>
        </section>
        <section>
          <h2 className="section-label">Role</h2>
          <p className="text-[color:var(--muted)]">{project.role}</p>
        </section>
        <section>
          <h2 className="section-label">What shipped</h2>
          <ul className="space-y-2 text-[color:var(--muted)]">
            {project.shipped.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--ink)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        {project.subsystems && (
          <section>
            <h2 className="section-label">Ecosystem</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {project.subsystems.map((sub) => (
                <div key={sub.name} className="rounded-[1.1rem] bg-[color:var(--soft)] p-4">
                  <h3 className="font-semibold">{sub.name}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{sub.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <section>
          <h2 className="section-label">Outcome</h2>
          <p className="text-[color:var(--muted)]">{project.outcome}</p>
        </section>
        <section>
          <h2 className="section-label">Stack</h2>
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-sm text-[color:var(--ink)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-12 rounded-[1.25rem] bg-[color:var(--soft)] p-6">
        <p className="font-semibold">Want something similar?</p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Send a short brief — I&apos;ll reply with scope and timeline.
        </p>
        <a href={`mailto:${site.email}`} className="pill mt-4 inline-flex">
          Email me
        </a>
      </div>

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="section-label">More work</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {others.map((p) => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="group block">
                <div
                  className="card-media transition-transform duration-300 group-hover:scale-[1.015]"
                  style={{ background: p.cover }}
                />
                <h3 className="mt-3 font-semibold">{p.name}</h3>
                <p className="text-sm text-[color:var(--muted)]">{p.eyebrow}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
