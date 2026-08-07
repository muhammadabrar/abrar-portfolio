import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[50vh] flex-col items-start justify-center py-20">
      <p className="text-sm text-[color:var(--muted)]">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <Link href="/" className="pill mt-8">
        Back home
      </Link>
    </div>
  );
}
