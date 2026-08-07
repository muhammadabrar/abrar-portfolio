import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getFormattedDate } from "@/lib/writing";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on AI automation, WebAR, and full-stack product delivery.",
};

export default function WritingIndexPage() {
  const posts = getAllPosts();

  return (
    <section className="shell py-12 sm:py-16">
      <p className="text-sm text-[color:var(--muted)]">Writing</p>
      <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight">
        Latest writing
      </h1>
      <p className="mt-3 max-w-xl text-[color:var(--muted)]">
        Short notes from shipping AI workflows, WebAR products, and production systems.
      </p>

      <div className="mt-10 overflow-hidden rounded-[1.35rem] border border-[color:var(--line)] bg-[color:var(--surface)]">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className={`group block px-5 py-5 transition-colors hover:bg-[color:var(--soft)]/60 sm:px-6 ${
              index > 0 ? "border-t border-[color:var(--line)]" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-semibold tracking-tight">{post.title}</h2>
              <span className="text-[color:var(--muted)]">→</span>
            </div>
            <p className="mt-2 text-[color:var(--muted)]">{post.description}</p>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              {getFormattedDate(post.date)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
