import { getMistral } from "./mistral";
import { searchChunks, scrollChunkPayloads } from "./qdrant";
import { RAG_LIMITS } from "./config";
import { estimateTokens } from "./parse";
import { prisma } from "./db";

export type QueryAuditEvent =
  | { type: "rewrite"; data: Record<string, unknown> }
  | { type: "metadataFilter"; data: Record<string, unknown> }
  | { type: "hybrid"; data: Record<string, unknown> }
  | { type: "rerank"; data: Record<string, unknown> }
  | { type: "context"; data: Record<string, unknown> }
  | { type: "token"; data: { text: string } }
  | { type: "done"; data: Record<string, unknown> }
  | { type: "error"; data: { message: string } };

type Hit = {
  id: string;
  title: string;
  score: number;
  snippet: string;
  source: string;
  text: string;
  chunkId: string;
  channel: "vector" | "keyword" | "hybrid";
  kind?: string;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 2);
}

/** Lightweight BM25-ish score for teaching hybrid retrieval. */
function keywordScore(query: string, doc: string): number {
  const q = tokenize(query);
  if (!q.length) return 0;
  const words = tokenize(doc);
  if (!words.length) return 0;
  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
  const avgdl = 200;
  const k1 = 1.2;
  const b = 0.75;
  let score = 0;
  for (const term of q) {
    const f = tf.get(term) ?? 0;
    if (!f) continue;
    const idf = Math.log(1 + 1.5);
    score +=
      idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * words.length) / avgdl)));
  }
  return score;
}

function rrfFuse(
  vector: Hit[],
  keyword: Hit[],
  k = 60,
): Hit[] {
  const scores = new Map<string, { hit: Hit; score: number }>();
  vector.forEach((h, i) => {
    const prev = scores.get(h.chunkId);
    const add = 1 / (k + i + 1);
    scores.set(h.chunkId, {
      hit: { ...(prev?.hit ?? h), channel: "hybrid" },
      score: (prev?.score ?? 0) + add * 1.1,
    });
  });
  keyword.forEach((h, i) => {
    const prev = scores.get(h.chunkId);
    const add = 1 / (k + i + 1);
    scores.set(h.chunkId, {
      hit: { ...(prev?.hit ?? h), channel: "hybrid", text: prev?.hit.text ?? h.text },
      score: (prev?.score ?? 0) + add,
    });
  });
  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => ({ ...x.hit, score: x.score }));
}

function compressText(text: string, query: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const q = new Set(tokenize(query));
  const sentences = text.split(/(?<=[.!?])\s+/);
  const ranked = sentences
    .map((s) => ({
      s,
      score: tokenize(s).reduce((n, t) => n + (q.has(t) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
  let out = "";
  for (const row of ranked) {
    if ((out + " " + row.s).length > maxChars) break;
    out = out ? `${out} ${row.s}` : row.s;
  }
  return out || text.slice(0, maxChars);
}

async function rewriteQuery(
  mistral: ReturnType<typeof getMistral>,
  question: string,
) {
  try {
    const res = await mistral.chat.complete({
      model: RAG_LIMITS.chatModel,
      messages: [
        {
          role: "system",
          content: `You rewrite user questions for a production RAG retriever.
Return ONLY compact JSON:
{"intent":"","rewritten":"","entities":[],"filters":[],"expansions":[]}
filters examples: "kind:pdf", "source:filename.pdf". expansions: 2-3 alternate search queries.`,
        },
        { role: "user", content: question },
      ],
      temperature: 0,
    });
    const raw = res.choices?.[0]?.message?.content;
    const text =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? raw
              .map((c) =>
                typeof c === "string"
                  ? c
                  : c && typeof c === "object" && "text" in c
                    ? String((c as { text?: string }).text ?? "")
                    : "",
              )
              .join("")
          : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json");
    const parsed = JSON.parse(jsonMatch[0]) as {
      intent?: string;
      rewritten?: string;
      entities?: string[];
      filters?: string[];
      expansions?: string[];
    };
    return {
      intent: parsed.intent || "question_answering",
      rewritten: parsed.rewritten || question,
      entities: parsed.entities ?? [],
      filters: parsed.filters ?? [],
      expansions: parsed.expansions ?? [question],
    };
  } catch {
    return {
      intent: "question_answering",
      rewritten: question,
      entities: tokenize(question).slice(0, 6),
      filters: [],
      expansions: [question, `${question} details`],
    };
  }
}

export async function* runRagQuery(opts: {
  guestId: string;
  collectionName: string;
  question: string;
  apiKey?: string | null;
}): AsyncGenerator<QueryAuditEvent> {
  const { guestId, collectionName, question, apiKey } = opts;
  const mistral = getMistral(apiKey);
  const timeline: { label: string; durationMs: number }[] = [];

  const tRewrite = Date.now();
  const rewritten = await rewriteQuery(mistral, question);
  yield {
    type: "rewrite",
    data: {
      original: question,
      intent: rewritten.intent,
      rewrittenQuery: rewritten.rewritten,
      entities: rewritten.entities,
      filters: rewritten.filters,
      expandedQueries: rewritten.expansions,
    },
  };
  timeline.push({
    label: "Query rewrite",
    durationMs: Date.now() - tRewrite,
  });

  const tFilter = Date.now();
  const metadataFilters = [...rewritten.filters];
  // Guest demo: permission filter is implicit (collection isolation).
  metadataFilters.unshift("permission:guest_collection_only");
  yield {
    type: "metadataFilter",
    data: {
      filters: metadataFilters,
      note: "Each guest has an isolated Qdrant collection — production would also filter by ACL tags on chunks.",
    },
  };
  timeline.push({
    label: "Metadata / permission filter",
    durationMs: Date.now() - tFilter,
  });

  const searchQuery = rewritten.rewritten || question;
  const tHybrid = Date.now();
  const emb = await mistral.embeddings.create({
    model: RAG_LIMITS.embeddingModel,
    inputs: [searchQuery],
  });
  const qVec = emb.data?.[0]?.embedding as number[] | undefined;
  if (!qVec) throw new Error("Failed to embed rewritten query.");

  const kindFilter = rewritten.filters
    .find((f) => f.startsWith("kind:"))
    ?.split(":")[1];
  const qdrantFilter = kindFilter
    ? { must: [{ key: "kind", match: { value: kindFilter } }] }
    : undefined;

  const vectorRaw = await searchChunks(
    collectionName,
    qVec,
    Math.max(RAG_LIMITS.topK * 3, 24),
    qdrantFilter,
  );
  const vectorHits: Hit[] = vectorRaw.map((h, i) => ({
    id: String(h.id),
    title: String(h.payload?.sectionTitle ?? `Chunk ${i + 1}`),
    score: h.score ?? 0,
    snippet: String(h.payload?.text ?? "").slice(0, 180),
    source: String(h.payload?.filename ?? "document"),
    text: String(h.payload?.text ?? ""),
    chunkId: String(h.payload?.chunkId ?? h.id),
    channel: "vector" as const,
    kind: String(h.payload?.kind ?? ""),
  }));

  const allPayloads = await scrollChunkPayloads(collectionName, 250);
  const keywordScored: Hit[] = allPayloads
    .map((p) => {
      const text = String(p.payload?.text ?? "");
      const score = Math.max(
        keywordScore(searchQuery, text),
        ...rewritten.expansions.map((e) => keywordScore(e, text)),
      );
      return {
        id: String(p.id),
        title: String(p.payload?.sectionTitle ?? "Chunk"),
        score,
        snippet: text.slice(0, 180),
        source: String(p.payload?.filename ?? "document"),
        text,
        chunkId: String(p.payload?.chunkId ?? p.id),
        channel: "keyword" as const,
        kind: String(p.payload?.kind ?? ""),
      };
    })
    .filter((h) => h.score > 0)
    .filter((h) => !kindFilter || !h.kind || h.kind === kindFilter)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);

  const fused = rrfFuse(vectorHits, keywordScored);
  yield {
    type: "hybrid",
    data: {
      vectorCount: vectorHits.length,
      keywordCount: keywordScored.length,
      fusedCount: fused.length,
      vectorHits: vectorHits.slice(0, 8).map(({ text: _t, ...r }) => r),
      keywordHits: keywordScored.slice(0, 8).map(({ text: _t, ...r }) => r),
      candidates: fused.slice(0, 12).map(({ text: _t, ...r }) => r),
    },
  };
  timeline.push({
    label: "Hybrid retrieval (vector + BM25)",
    durationMs: Date.now() - tHybrid,
  });

  const tRerank = Date.now();
  const reranked = fused
    .map((h) => {
      const lex = keywordScore(searchQuery, h.text);
      const diversityPenalty = 0;
      return {
        ...h,
        score: h.score * 100 + lex * 8 - diversityPenalty,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  yield {
    type: "rerank",
    data: {
      reranked: reranked.slice(0, 8).map((c) => ({
        id: c.id,
        title: c.title,
        score: Math.round(c.score),
        source: c.source,
        channel: c.channel,
      })),
    },
  };
  timeline.push({
    label: "Reranking",
    durationMs: Date.now() - tRerank,
  });

  const tCtx = Date.now();
  let used = 0;
  const contextParts: string[] = [];
  const contextChunks: {
    id: string;
    title: string;
    tokens: number;
    source: string;
    compressed: boolean;
  }[] = [];

  for (const c of reranked.slice(0, 6)) {
    const compressed = compressText(c.text, searchQuery, 900);
    const tokens = estimateTokens(compressed);
    if (used + tokens > RAG_LIMITS.maxContextTokensPerQuery) break;
    used += tokens;
    contextParts.push(`[${c.chunkId} | ${c.source}]\n${compressed}`);
    contextChunks.push({
      id: c.chunkId,
      title: c.title,
      tokens,
      source: c.source,
      compressed: compressed.length < c.text.length,
    });
  }

  yield {
    type: "context",
    data: {
      contextChunks,
      contextTokensUsed: used,
      contextTokensMax: RAG_LIMITS.maxContextTokensPerQuery,
    },
  };
  timeline.push({
    label: "Context selection / compression",
    durationMs: Date.now() - tCtx,
  });

  if (contextParts.length === 0) {
    const msg =
      "I couldn’t find grounded evidence in your uploaded documents after hybrid retrieval. Try another question or upload a file that contains the answer.";
    yield { type: "token", data: { text: msg } };
    yield {
      type: "done",
      data: {
        answer: msg,
        timeline,
        explainability: {
          confidence: 0.15,
          sources: [],
          chunksReferenced: [],
          reasoningPath: [
            "Rewrote the query",
            "Applied guest collection permission boundary",
            "Ran hybrid vector + BM25 retrieval",
            "No strong evidence — refused to invent an answer",
          ],
          citations: [],
        },
        usageTokens: estimateTokens(question) + estimateTokens(msg),
      },
    };
    return;
  }

  const system = `You are a production RAG assistant.
Answer ONLY using the provided context.
If evidence is insufficient, say you don't know from the uploaded documents.
Include inline citations like [chunk-id] next to claims.
Never invent numbers, names, or dates not present in context.`;

  const userPrompt = `Context:\n${contextParts.join("\n\n---\n\n")}\n\nQuestion: ${question}\nRewritten search intent: ${searchQuery}`;

  const tGen = Date.now();
  const stream = await mistral.chat.stream({
    model: RAG_LIMITS.chatModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
  });

  let answer = "";
  for await (const event of stream) {
    const content = event.data?.choices?.[0]?.delta?.content;
    const piece =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((c) =>
                typeof c === "string"
                  ? c
                  : c && typeof c === "object" && "text" in c
                    ? String((c as { text?: string }).text ?? "")
                    : "",
              )
              .join("")
          : "";
    if (piece) {
      answer += piece;
      yield { type: "token", data: { text: piece } };
    }
  }
  timeline.push({
    label: "LLM generation",
    durationMs: Date.now() - tGen,
  });
  timeline.push({ label: "Citation / grounding package", durationMs: 5 });

  const usageTokens =
    estimateTokens(system) +
    estimateTokens(userPrompt) +
    estimateTokens(answer);

  if (!apiKey?.trim()) {
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        dailyQueryCount: { increment: 1 },
        dailyTokenCount: { increment: usageTokens },
      },
    });
  } else {
    await prisma.guest.update({
      where: { id: guestId },
      data: { dailyQueryCount: { increment: 1 } },
    });
  }

  yield {
    type: "done",
    data: {
      answer,
      timeline,
      explainability: {
        confidence: reranked[0]
          ? Math.min(0.96, 0.45 + Math.min(reranked[0].score, 80) / 160)
          : 0.4,
        sources: [...new Set(contextChunks.map((s) => s.source))],
        chunksReferenced: contextChunks.map((c) => c.id),
        reasoningPath: [
          "Query rewrite → searchable intent + entities",
          "Permission / metadata boundary (guest collection)",
          "Hybrid retrieval: Qdrant vectors + BM25-lite keywords (RRF fuse)",
          "Rerank + context compression within token budget",
          "Grounded LLM generation with citation anchors",
        ],
        citations: contextChunks.slice(0, 4).map((c) => ({
          text: c.title,
          source: `${c.id} · ${c.source}${c.compressed ? " · compressed" : ""}`,
        })),
      },
      usageTokens,
    },
  };
}
