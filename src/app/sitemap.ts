import type { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/content/projects";
import { getAllPosts } from "@/lib/writing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://muhammadabrar.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const work = getAllProjectSlugs().map((slug) => ({
    url: `${siteUrl}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const writing = getAllPosts().map((post) => ({
    url: `${siteUrl}/writing/${post.slug}`,
    lastModified: new Date(post.date || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/writing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...work,
    ...writing,
  ];
}
