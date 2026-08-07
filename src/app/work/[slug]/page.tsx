import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/CaseStudyDetail";
import { getAllProjectSlugs, getProject } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Case study" };

  return {
    title: `${project.name} — Case study`,
    description: project.summary,
    openGraph: {
      title: `${project.name} · Muhammad Abrar`,
      description: project.summary,
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <CaseStudyDetail project={project} />;
}
