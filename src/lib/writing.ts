import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type WritingPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
};

const writingDir = path.join(process.cwd(), "content/writing");

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getAllPosts(): WritingPost[] {
  if (!fs.existsSync(writingDir)) return [];

  return fs
    .readdirSync(writingDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(writingDir, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        date: String(data.date ?? ""),
        content,
      };
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPost(slug: string): WritingPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getFormattedDate(date: string) {
  if (!date) return "";
  return formatDate(date);
}
