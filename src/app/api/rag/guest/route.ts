import { NextResponse } from "next/server";
import {
  ensureGuest,
  guestPublicView,
  resolveGuestId,
  GUEST_COOKIE,
} from "@/lib/rag-observatory/guest";
import { purgeExpiredDocuments } from "@/lib/rag-observatory/ttl";

export async function POST(req: Request) {
  try {
    await purgeExpiredDocuments();
    const guestId = await resolveGuestId(req);
    const guest = await ensureGuest(guestId);
    const res = NextResponse.json({ ok: true, guest: guestPublicView(guest) });
    res.cookies.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Guest init failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
