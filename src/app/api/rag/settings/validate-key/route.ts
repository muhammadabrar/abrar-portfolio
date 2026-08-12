import { NextResponse } from "next/server";
import { getMistral } from "@/lib/rag-observatory/mistral";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { apiKey?: string };
    const apiKey = body.apiKey?.trim();
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing apiKey" }, { status: 400 });
    }
    const mistral = getMistral(apiKey);
    await mistral.models.list();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid key";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
