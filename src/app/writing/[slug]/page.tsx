import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getFormattedDate, getPost } from "@/lib/writing";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article" };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="shell py-12 sm:py-16">
      <Link href="/writing" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]">
        ← Writing
      </Link>
      <p className="mt-8 text-sm text-[color:var(--muted)]">{getFormattedDate(post.date)}</p>
      <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold tracking-tight">
        {post.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[color:var(--muted)]">{post.description}</p>

      <div className="prose-article mt-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
