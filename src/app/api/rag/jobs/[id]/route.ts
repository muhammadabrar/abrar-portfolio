import { NextResponse } from "next/server";
import { prisma } from "@/lib/rag-observatory/db";
import { ensureGuest, resolveGuestId } from "@/lib/rag-observatory/guest";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const guestId = await resolveGuestId(req);
    await ensureGuest(guestId);
    const job = await prisma.ingestJob.findFirst({
      where: { id, guestId },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: job.id,
      documentId: job.documentId,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      error: job.error,
      payload: JSON.parse(job.payload || "{}"),
      updatedAt: job.updatedAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Job fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
