import {
  assertCanQuery,
  ensureGuest,
  isByok,
  QuotaError,
  resolveGuestId,
} from "@/lib/rag-observatory/guest";
import { runRagQuery } from "@/lib/rag-observatory/query";
import { purgeExpiredDocuments } from "@/lib/rag-observatory/ttl";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await purgeExpiredDocuments();
    const guestId = await resolveGuestId(req);
    const guest = await ensureGuest(guestId);
    const apiKey = req.headers.get("x-mistral-key");
    const byok = isByok(apiKey);
    assertCanQuery(guest, byok);

    const body = (await req.json()) as { question?: string };
    const question = body.question?.trim();
    if (!question) {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runRagQuery({
            guestId,
            collectionName: guest.collectionName,
            question,
            apiKey,
          })) {
            controller.enqueue(
              encoder.encode(`${JSON.stringify(event)}\n`),
            );
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Query failed";
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({ type: "error", data: { message } })}\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    if (err instanceof QuotaError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    const message = err instanceof Error ? err.message : "Query failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
