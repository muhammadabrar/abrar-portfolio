import Link from "next/link";
import { getAllPosts, getFormattedDate } from "@/lib/writing";

export function LatestWriting({
  className = "shell section",
}: {
  className?: string;
}) {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="section-label mb-0">Latest writing</h2>
        <Link
          href="/writing"
          className="text-sm font-semibold text-[color:var(--ink)] hover:opacity-70"
        >
          Read all
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-[color:var(--line)] bg-[color:var(--surface)]">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className={`writing-row group block px-5 py-5 transition-colors hover:bg-[color:var(--soft)]/60 sm:px-6 ${
              index > 0 ? "border-t border-[color:var(--line)]" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold tracking-tight text-[color:var(--ink)]">
                {post.title}
              </h3>
              <span className="mt-0.5 text-[color:var(--muted)] transition-transform group-hover:translate-x-0.5">
                →
              </span>
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
