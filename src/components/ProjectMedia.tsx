import Image from "next/image";
import type { Project } from "@/content/projects";

function isImageSrc(value: string) {
  return value.startsWith("/") || value.startsWith("http");
}

export function ProjectMedia({
  project,
  variant = "thumb",
  className = "card-media",
  sizes = "(max-width: 768px) 100vw, 560px",
  priority = false,
}: {
  project: Project;
  variant?: "cover" | "thumb";
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const image =
    variant === "cover"
      ? project.coverImage ?? project.thumbnail
      : project.thumbnail ?? project.coverImage;

  if (image && isImageSrc(image)) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={image}
          alt={`${project.name} preview`}
          fill
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes={sizes}
          priority={priority}
        />
      </div>
    );
  }

  const fallback = isImageSrc(project.cover) ? undefined : project.cover;

  return (
    <div
      className={className}
      style={fallback ? { background: fallback } : undefined}
      aria-hidden
    />
  );
}
