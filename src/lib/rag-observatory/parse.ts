import mammoth from "mammoth";
import { RAG_LIMITS } from "./config";
import { getMistral } from "./mistral";

export type ParsedDoc = {
  text: string;
  kind: string;
  pagesApprox: number;
  languageGuess: string;
  ocrUsed: boolean;
  ocrModel?: string;
  pagesProcessed?: number;
  tablesDetected?: number;
  imagesDetected?: number;
};

const IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
]);

function mimeForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".bmp")) return "image/bmp";
  if (lower.endsWith(".tif") || lower.endsWith(".tiff")) return "image/tiff";
  return "application/octet-stream";
}

function isImageFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return false;
  return IMAGE_EXT.has(lower.slice(dot));
}

async function runMistralOcr(opts: {
  buffer: Buffer;
  filename: string;
  apiKey?: string | null;
  asImage: boolean;
}): Promise<ParsedDoc> {
  const mistral = getMistral(opts.apiKey);
  const base64 = opts.buffer.toString("base64");
  const mime = mimeForFilename(opts.filename);
  const dataUrl = `data:${mime};base64,${base64}`;

  const result = await mistral.ocr.process({
    model: RAG_LIMITS.ocrModel,
    document: opts.asImage
      ? { type: "image_url", imageUrl: dataUrl }
      : {
          type: "document_url",
          documentUrl: dataUrl,
          documentName: opts.filename,
        },
    tableFormat: "markdown",
    extractHeader: true,
    extractFooter: true,
    includeImageBase64: false,
  });

  const pages = result.pages ?? [];
  const text = pages
    .map((p) => {
      const header = p.header ? `${p.header}\n\n` : "";
      const footer = p.footer ? `\n\n${p.footer}` : "";
      return `${header}${p.markdown ?? ""}${footer}`.trim();
    })
    .filter(Boolean)
    .join("\n\n---\n\n");

  const tablesDetected = pages.reduce(
    (n, p) => n + (p.tables?.length ?? 0),
    0,
  );
  const imagesDetected = pages.reduce(
    (n, p) => n + (p.images?.length ?? 0),
    0,
  );

  if (!text.trim()) {
    throw new Error("Mistral OCR returned no readable text.");
  }

  return {
    text,
    kind: opts.asImage ? "image" : "pdf",
    pagesApprox: pages.length || 1,
    languageGuess: "auto",
    ocrUsed: true,
    ocrModel: result.model || RAG_LIMITS.ocrModel,
    pagesProcessed: result.usageInfo?.pagesProcessed ?? pages.length,
    tablesDetected,
    imagesDetected,
  };
}

export async function parseFile(
  buffer: Buffer,
  filename: string,
  apiKey?: string | null,
): Promise<ParsedDoc> {
  const lower = filename.toLowerCase();
  let text = "";
  let kind = "text";
  let ocrUsed = false;
  let ocrMeta: Partial<ParsedDoc> = {};

  if (lower.endsWith(".pdf")) {
    const ocr = await runMistralOcr({
      buffer,
      filename,
      apiKey,
      asImage: false,
    });
    return ocr;
  }

  if (isImageFilename(filename)) {
    const ocr = await runMistralOcr({
      buffer,
      filename,
      apiKey,
      asImage: true,
    });
    return ocr;
  }

  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    kind = "docx";
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    kind = "markdown";
    text = buffer.toString("utf8");
  } else if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    kind = lower.endsWith(".csv") ? "csv" : "text";
    text = buffer.toString("utf8");
  } else {
    kind = "text";
    text = buffer.toString("utf8");
  }

  text = text.replace(/\u0000/g, "").trim();
  if (!text) {
    throw new Error("No readable text found in this file.");
  }

  return {
    text,
    kind,
    pagesApprox: Math.max(1, Math.ceil(text.length / 3000)),
    languageGuess: "English",
    ocrUsed,
    ...ocrMeta,
  };
}

export function cleanText(raw: string): {
  cleaned: string;
  duplicatesRemoved: number;
  formattingNormalized: number;
} {
  const lines = raw.split(/\r?\n/);
  const seen = new Set<string>();
  let duplicatesRemoved = 0;
  const kept: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      kept.push("");
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key) && trimmed.length < 80) {
      duplicatesRemoved += 1;
      continue;
    }
    seen.add(key);
    kept.push(trimmed);
  }
  let cleaned = kept.join("\n");
  const before = cleaned.length;
  cleaned = cleaned
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Page \d+ of \d+/gi, "")
    .trim();
  return {
    cleaned,
    duplicatesRemoved,
    formattingNormalized: Math.max(0, before - cleaned.length),
  };
}

export type TextChunk = {
  id: string;
  text: string;
  tokenEstimate: number;
  sectionTitle: string;
  strategy: "heading" | "page" | "table" | "overlap";
  tags: string[];
};

/** Structure-aware chunking: headings / pages / tables first, overlap only for long plain sections. */
export function chunkText(text: string, documentId: string): TextChunk[] {
  const size = RAG_LIMITS.chunkSize;
  const overlap = RAG_LIMITS.chunkOverlap;
  const chunks: TextChunk[] = [];
  let idx = 0;

  const push = (
    body: string,
    sectionTitle: string,
    strategy: TextChunk["strategy"],
    extraTags: string[] = [],
  ) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length <= size * 1.25 || strategy === "table") {
      chunks.push({
        id: `${documentId}_${idx}`,
        text: trimmed,
        tokenEstimate: Math.ceil(trimmed.length / 4),
        sectionTitle: sectionTitle.slice(0, 80) || `Section ${idx + 1}`,
        strategy,
        tags: [strategy, ...extraTags],
      });
      idx += 1;
      return;
    }
    let i = 0;
    while (i < words.length) {
      const slice = words.slice(i, i + size).join(" ");
      chunks.push({
        id: `${documentId}_${idx}`,
        text: slice,
        tokenEstimate: Math.ceil(slice.length / 4),
        sectionTitle: sectionTitle.slice(0, 80) || `Section ${idx + 1}`,
        strategy: i === 0 ? strategy : "overlap",
        tags: [i === 0 ? strategy : "overlap", ...extraTags],
      });
      idx += 1;
      if (i + size >= words.length) break;
      i += Math.max(1, size - overlap);
    }
  };

  // Prefer page separators from OCR, then markdown headings, then tables.
  const pages = text.split(/\n\s*---\s*\n/);
  const units = pages.length > 1 ? pages : [text];

  for (const unit of units) {
    const headingSplit = unit.split(/(?=^#{1,3}\s+.+$)/m).filter((s) => s.trim());
    const sections = headingSplit.length > 1 ? headingSplit : [unit];

    for (const section of sections) {
      const headingMatch = section.match(/^#{1,3}\s+(.+)$/m);
      const title =
        headingMatch?.[1]?.trim() ||
        section.split(/[.?!\n]/)[0]?.trim().slice(0, 60) ||
        "Section";

      const tableBlocks = section.split(/(?=\n\|.+\|\n)/);
      if (tableBlocks.length > 1 && /\|.+\|/.test(section)) {
        for (const block of tableBlocks) {
          const isTable = /^\s*\|/.test(block.trim()) || /\n\|.+\|/.test(block);
          push(
            block,
            isTable ? `${title} · table` : title,
            isTable ? "table" : headingMatch ? "heading" : "page",
            isTable ? ["table"] : [],
          );
        }
      } else {
        push(
          section,
          title,
          headingMatch ? "heading" : pages.length > 1 ? "page" : "overlap",
        );
      }
    }
  }

  if (chunks.length === 0) {
    push(text, "Document", "overlap");
  }
  return chunks;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
