import { prisma } from "./db";
import { deleteCollectionIfExists, deleteByDocument } from "./qdrant";

export async function purgeExpiredDocuments() {
  try {
    const now = new Date();
    const expired = await prisma.document.findMany({
      where: { expiresAt: { lt: now } },
      include: { guest: true },
    });

    for (const doc of expired) {
      try {
        await deleteByDocument(doc.guest.collectionName, doc.id);
      } catch {
        // continue purge even if qdrant fails
      }
      await prisma.document.delete({ where: { id: doc.id } });
    }

    return expired.length;
  } catch (err) {
    // Neon cold start / brief outage should not fail guest/upload routes.
    console.warn(
      "[rag] purgeExpiredDocuments skipped:",
      err instanceof Error ? err.message : err,
    );
    return 0;
  }
}

export async function resetGuest(guestId: string) {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) return;
  try {
    await deleteCollectionIfExists(guest.collectionName);
  } catch {
    // ignore
  }
  await prisma.guest.delete({ where: { id: guestId } });
}
