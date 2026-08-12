import { NextResponse } from "next/server";
import { prisma } from "@/lib/rag-observatory/db";
import { ensureGuest, resolveGuestId } from "@/lib/rag-observatory/guest";
import { deleteByDocument } from "@/lib/rag-observatory/qdrant";
import { purgeExpiredDocuments } from "@/lib/rag-observatory/ttl";

export async function GET(req: Request) {
  try {
    await purgeExpiredDocuments();
    const guestId = await resolveGuestId(req);
    await ensureGuest(guestId);
    const docs = await prisma.document.findMany({
      where: { guestId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      documents: docs.map((d) => ({
        id: d.id,
        name: d.name,
        kind: d.kind,
        sizeBytes: d.sizeBytes,
        chunkCount: d.chunkCount,
        status: d.status,
        expiresAt: d.expiresAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const guestId = await resolveGuestId(req);
    const guest = await ensureGuest(guestId);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const doc = await prisma.document.findFirst({ where: { id, guestId } });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    try {
      await deleteByDocument(guest.collectionName, id);
    } catch {
      // ignore qdrant errors
    }
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
