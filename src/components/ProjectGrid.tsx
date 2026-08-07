"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project, ProjectCategory } from "@/content/projects";
import { ProjectsCursor } from "@/components/ProjectsCursor";

const filters: { id: "all" | "featured" | ProjectCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "product", label: "Product" },
  { id: "automation", label: "Automation" },
];

export function ProjectGrid({
  projects,
  showFilters = false,
  limit,
  variant = "grid",
}: {
  projects: Project[];
  showFilters?: boolean;
  limit?: number;
  variant?: "grid" | "list";
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const visible = useMemo(() => {
    let list = projects;
    if (filter === "featured") list = projects.filter((p) => p.featured);
    else if (filter !== "all") list = projects.filter((p) => p.category === filter);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [projects, filter, limit]);

  return (
    <div>
      {variant === "list" && <ProjectsCursor />}

      {showFilters && (
        <div className="mb-10 flex flex-wrap gap-2" data-reveal>
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                filter === item.id
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "bg-[color:var(--soft)] text-[color:var(--muted)] hover:-translate-y-0.5 hover:text-[color:var(--ink)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {variant === "list" ? (
        <div className="flex flex-col gap-12 sm:gap-16">
          {visible.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="project-row group"
              data-reveal
            >
              <div
                className="project-row-media"
                style={{ background: project.cover }}
              />
              <div className="project-row-body">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--muted)]">
                  <span>{project.eyebrow}</span>
                  <span aria-hidden>·</span>
                  <span className="capitalize">{project.category}</span>
                </div>
                <h3 className="mt-2 text-[1.65rem] font-semibold tracking-tight sm:text-[2rem]">
                  {project.name}
                </h3>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-[color:var(--muted)]">
                  {project.summary}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--ink)]/80">
                  {project.outcome}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.slice(0, 5).map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-[color:var(--soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--muted)]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm font-medium text-[color:var(--ink)] transition-transform duration-300 group-hover:translate-x-1">
                  View case study →
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group block"
              data-reveal
            >
              <div
                className="card-media"
                style={{ background: project.cover }}
              />
              <div className="mt-3">
                <h3 className="text-base font-semibold tracking-tight">{project.name}</h3>
                <p className="mt-0.5 text-sm text-[color:var(--muted)]">{project.eyebrow}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
