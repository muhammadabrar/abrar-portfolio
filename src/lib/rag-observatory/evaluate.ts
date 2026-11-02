import { getMistral } from "./mistral";
import { RAG_LIMITS } from "./config";
import { estimateTokens } from "./parse";
import type {
  ClaimEval,
  ClaimVerdict,
  ContextChunk,
  GroundedEvaluation,
} from "./types";

type EvidenceChunk = ContextChunk & { text: string };

function messageText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((c) =>
        typeof c === "string"
          ? c
          : c && typeof c === "object" && "text" in c
            ? String((c as { text?: string }).text ?? "")
            : "",
      )
      .join("");
  }
  return "";
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isRefusal(answer: string): boolean {
  const a = answer.toLowerCase();
  return (
    a.includes("don't know from the uploaded") ||
    a.includes("couldn’t find grounded evidence") ||
    a.includes("couldn't find grounded evidence") ||
    a.includes("not in the uploaded documents") ||
    a.includes("no supporting evidence")
  );
}

async function extractClaims(
  mistral: ReturnType<typeof getMistral>,
  answer: string,
): Promise<{ claims: string[]; usageTokens: number }> {
  if (isRefusal(answer) || answer.trim().length < 20) {
    return { claims: [], usageTokens: 0 };
  }

  const system = `Extract atomic factual claims from a RAG answer.
Return ONLY JSON: {"claims":["..."]}
Rules:
- Each claim is one verifiable fact (numbers, names, dates, relations).
- Skip opinions, hedging, and pure refusals.
- Max ${RAG_LIMITS.maxEvalClaims} claims.
- Strip citation markers like [chunk-id].`;

  const res = await mistral.chat.complete({
    model: RAG_LIMITS.evalModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: answer.slice(0, 6000) },
    ],
    temperature: 0,
  });

  const text = messageText(res.choices?.[0]?.message?.content);
  const parsed = parseJsonObject(text);
  const claims = Array.isArray(parsed?.claims)
    ? (parsed.claims as unknown[])
        .map((c) => String(c).trim())
        .filter(Boolean)
        .slice(0, RAG_LIMITS.maxEvalClaims)
    : [];

  return {
    claims,
    usageTokens:
      estimateTokens(system) + estimateTokens(answer) + estimateTokens(text),
  };
}

async function judgeClaim(
  mistral: ReturnType<typeof getMistral>,
  claim: string,
  evidence: EvidenceChunk[],
): Promise<{ eval: Omit<ClaimEval, "id">; usageTokens: number }> {
  const evidenceBlock = evidence
    .map(
      (e, i) =>
        `[${i + 1}] id=${e.id} source=${e.source}\n${e.text.slice(0, 900)}`,
    )
    .join("\n\n");

  const system = `You are an entailment judge for RAG grounding.
You receive ONE claim and retrieved evidence snippets only.
Do NOT use outside knowledge. Do NOT assume retrieval scores or confidence.
Return ONLY JSON:
{"verdict":"SUPPORTED"|"CONTRADICTED"|"NOT_SUPPORTED","confidence":0.0,"evidence_ids":["chunk-id"],"reason":"..."}
- SUPPORTED: evidence entails the claim
- CONTRADICTED: evidence conflicts with the claim
- NOT_SUPPORTED: evidence does not establish the claim
evidence_ids must be chunk ids from the evidence list when used.`;

  const user = `CLAIM:\n${claim}\n\nEVIDENCE:\n${evidenceBlock}`;

  try {
    const res = await mistral.chat.complete({
      model: RAG_LIMITS.evalModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0,
    });
    const text = messageText(res.choices?.[0]?.message?.content);
    const parsed = parseJsonObject(text);
    if (!parsed) {
      return {
        eval: {
          claim,
          verdict: "NOT_SUPPORTED",
          confidence: 0.2,
          evidenceChunkIds: [],
          evidenceSources: [],
          reason: "Evaluator parse failed.",
        },
        usageTokens:
          estimateTokens(system) + estimateTokens(user) + estimateTokens(text),
      };
    }
    const rawVerdict = String(parsed.verdict ?? "NOT_SUPPORTED").toUpperCase();
    const verdict: ClaimVerdict =
      rawVerdict === "SUPPORTED" || rawVerdict === "CONTRADICTED"
        ? rawVerdict
        : "NOT_SUPPORTED";
    const ids = Array.isArray(parsed.evidence_ids)
      ? (parsed.evidence_ids as unknown[]).map((x) => String(x))
      : [];
    const allowed = new Set(evidence.map((e) => e.id));
    const evidenceChunkIds = ids.filter((id) => allowed.has(id));
    const evidenceSources = evidence
      .filter((e) => evidenceChunkIds.includes(e.id))
      .map((e) => e.source);

    return {
      eval: {
        claim,
        verdict,
        confidence: Math.max(
          0,
          Math.min(1, Number(parsed.confidence ?? 0.5)),
        ),
        evidenceChunkIds,
        evidenceSources: [...new Set(evidenceSources)],
        reason: String(parsed.reason ?? "No reason provided."),
      },
      usageTokens:
        estimateTokens(system) + estimateTokens(user) + estimateTokens(text),
    };
  } catch {
    return {
      eval: {
        claim,
        verdict: "NOT_SUPPORTED",
        confidence: 0.2,
        evidenceChunkIds: [],
        evidenceSources: [],
        reason: "Evaluator call failed.",
      },
      usageTokens: estimateTokens(system) + estimateTokens(user),
    };
  }
}

function metrics(claims: ClaimEval[]): Omit<
  GroundedEvaluation,
  "claims" | "note" | "usageTokens"
> {
  const supported = claims.filter((c) => c.verdict === "SUPPORTED").length;
  const contradicted = claims.filter(
    (c) => c.verdict === "CONTRADICTED",
  ).length;
  const unsupported = claims.filter(
    (c) => c.verdict === "NOT_SUPPORTED",
  ).length;
  const withEvidence = claims.filter((c) => c.evidenceChunkIds.length > 0)
    .length;
  const n = claims.length;
  return {
    groundedness: n ? supported / n : 0,
    contradictionRate: n ? contradicted / n : 0,
    citationCoverage: n ? withEvidence / n : 0,
    unsupportedCount: unsupported,
    contradictedCount: contradicted,
  };
}

export async function evaluateGroundedness(opts: {
  apiKey?: string | null;
  answer: string;
  evidence: EvidenceChunk[];
}): Promise<GroundedEvaluation> {
  const { apiKey, answer, evidence } = opts;

  if (!evidence.length) {
    return {
      claims: [],
      groundedness: 0,
      contradictionRate: 0,
      citationCoverage: 0,
      unsupportedCount: 0,
      contradictedCount: 0,
      note: "No retrieved evidence to evaluate against.",
      usageTokens: 0,
    };
  }

  if (isRefusal(answer)) {
    return {
      claims: [],
      groundedness: 0,
      contradictionRate: 0,
      citationCoverage: 0,
      unsupportedCount: 0,
      contradictedCount: 0,
      note: "Answer refused — no factual claims to judge.",
      usageTokens: 0,
    };
  }

  const mistral = getMistral(apiKey);
  const extracted = await extractClaims(mistral, answer);
  let usageTokens = extracted.usageTokens;

  if (!extracted.claims.length) {
    return {
      claims: [],
      groundedness: 0,
      contradictionRate: 0,
      citationCoverage: 0,
      unsupportedCount: 0,
      contradictedCount: 0,
      note: "No factual claims extracted from the answer.",
      usageTokens,
    };
  }

  const claims: ClaimEval[] = [];
  const started = Date.now();
  let timedOut = false;
  for (let i = 0; i < extracted.claims.length; i++) {
    if (Date.now() - started > RAG_LIMITS.maxEvalMs) {
      timedOut = true;
      break;
    }
    const judged = await judgeClaim(mistral, extracted.claims[i], evidence);
    usageTokens += judged.usageTokens;
    claims.push({
      id: `claim-${i + 1}`,
      ...judged.eval,
    });
  }

  const remaining = extracted.claims.length - claims.length;
  return {
    claims,
    ...metrics(claims),
    usageTokens,
    note: timedOut
      ? `Evaluation time budget reached — judged ${claims.length}/${extracted.claims.length} claims${remaining ? ` (${remaining} skipped)` : ""}.`
      : undefined,
  };
}
