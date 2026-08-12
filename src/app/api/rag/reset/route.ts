import { NextResponse } from "next/server";
import { ensureGuest, resolveGuestId } from "@/lib/rag-observatory/guest";
import { resetGuest } from "@/lib/rag-observatory/ttl";

export async function POST(req: Request) {
  try {
    const guestId = await resolveGuestId(req);
    await ensureGuest(guestId);
    await resetGuest(guestId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reset failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
