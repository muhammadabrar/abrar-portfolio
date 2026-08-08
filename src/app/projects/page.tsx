import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { ProjectGrid } from "@/components/ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected tools, products, and experiments by Muhammad Abrar — WebAR, AI automation, and full-stack systems.",
};

export default function ProjectsPage() {
  return (
    <div className="shell shell-wide py-12 sm:py-16">
      <div data-reveal>
        <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-bold tracking-tight">
          Projects & experiments
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[color:var(--muted)]">
          A selection of products and systems I&apos;ve built for production teams.
        </p>
      </div>

      <div className="mt-12 pb-8">
        <ProjectGrid projects={projects} showFilters variant="list" />
      </div>
    </div>
  );
}
