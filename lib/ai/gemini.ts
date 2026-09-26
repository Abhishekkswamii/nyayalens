import { GoogleGenAI } from "@google/genai";
import type { ZodSchema } from "zod";
import { SYSTEM_INSTRUCTIONS } from "@/lib/ai/prompts";
import { redactSecrets } from "@/lib/security/sanitize";

/** Logs only the error type/message (never document content or the API key itself). */
function logAiError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[gemini:${context}]`, redactSecrets(message));
}

/** Exported for unit testing the retry classification without mocking the SDK. */
export function isTransientError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /"code":\s*(503|429)|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test(message);
}

/** Retries a transient (503/429, "high demand") Gemini error with backoff; anything else fails fast. */
async function withTransientRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransientError(err) || attempt === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
    }
  }
  throw lastErr;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient(): GoogleGenAI {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  if (project) {
    return new GoogleGenAI({ vertexai: true, project, location });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiConfigError(
      "Either GOOGLE_CLOUD_PROJECT (for Vertex AI) or GEMINI_API_KEY must be configured.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

export class AiConfigError extends Error {}
export class AiRequestError extends Error {}
export class AiOutputError extends Error {}
/** Thrown before any network call — a fast, free rejection, not an AI failure. */
export class DocumentTooLargeForBackendError extends Error {}

/**
 * A reference to a document already handed to the AI backend, used for the
 * initial analysis call and reused for follow-up Q&A/comparison calls
 * without re-sending the file bytes over our own network each time.
 *
 * - "file": the direct Gemini API's Files API (a URI Google hosts for us) —
 *   the client only ever round-trips this small reference, never the PDF.
 * - "inline": Vertex AI, which has no Files API without a separate GCS
 *   bucket, so the document travels inline (base64) with every request —
 *   see MAX_INLINE_FILE_SIZE_BYTES below for why this path is size-capped
 *   much more tightly.
 */
export type DocumentRef =
  | { kind: "file"; uri: string; mimeType: string }
  | { kind: "inline"; base64: string; mimeType: string };

export function isVertexMode(): boolean {
  return Boolean(process.env.GOOGLE_CLOUD_PROJECT);
}

/**
 * Vercel serverless functions hard-cap request/response bodies at 4.5 MB.
 * Inline mode round-trips the document as base64 (both in the /api/analyze
 * response and every follow-up /api/ask /api/compare request), so it must
 * stay well under that once base64's ~1.37x inflation and the surrounding
 * JSON payload are accounted for. Exported and pure (no network/SDK calls)
 * so it's directly unit-testable.
 */
export const MAX_INLINE_FILE_SIZE_BYTES = 3 * 1024 * 1024;

export function assertInlineSizeAllowed(byteLength: number): void {
  if (byteLength > MAX_INLINE_FILE_SIZE_BYTES) {
    throw new DocumentTooLargeForBackendError(
      `This file is too large for the currently configured AI backend (Vertex AI inline mode supports files up to ${Math.floor(MAX_INLINE_FILE_SIZE_BYTES / (1024 * 1024))} MB, since the document has no Files API equivalent there and must travel with each request). Use a smaller file, or configure the direct Gemini API (GEMINI_API_KEY) for files up to 15 MB.`,
    );
  }
}

/** Uploads a PDF once (Files API on the direct Gemini API) or holds it inline
 * (Vertex AI) so it can be reused across analysis, Q&A and comparison calls. */
export async function prepareDocument(bytes: Uint8Array, displayName: string): Promise<DocumentRef> {
  if (isVertexMode()) {
    // Reject oversized inputs before spending any CPU/tokens encoding or sending them.
    assertInlineSizeAllowed(bytes.byteLength);
    return { kind: "inline", base64: Buffer.from(bytes).toString("base64"), mimeType: "application/pdf" };
  }

  const client = getClient();
  const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });

  try {
    const uploaded = await withTransientRetry(() =>
      client.files.upload({
        file: blob,
        config: { mimeType: "application/pdf", displayName },
      }),
    );

    let file = uploaded;
    let attempts = 0;
    while (file.state === "PROCESSING" && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!file.name) break;
      file = await client.files.get({ name: file.name });
      attempts += 1;
    }

    if (file.state === "FAILED" || !file.uri) {
      throw new AiRequestError("The document could not be processed by the AI service.");
    }

    return { kind: "file", uri: file.uri, mimeType: file.mimeType || "application/pdf" };
  } catch (err) {
    if (err instanceof AiRequestError) throw err;
    logAiError("prepareDocument", err);
    throw new AiRequestError("Failed to upload the document to the AI service.");
  }
}

function documentPart(doc: DocumentRef) {
  return doc.kind === "file"
    ? { fileData: { fileUri: doc.uri, mimeType: doc.mimeType } }
    : { inlineData: { data: doc.base64, mimeType: doc.mimeType } };
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? trimmed).trim();
}

async function generateStructured<T>(params: {
  contents: unknown[];
  schema: ZodSchema<T>;
  promptForRepair: string;
}): Promise<T> {
  const client = getClient();

  const call = async (contents: unknown[]) => {
    const response = await withTransientRetry<{ text?: string }>(() =>
      // The installed @google/genai types don't yet expose this call signature; the
      // request/response shape is documented and validated below via the text field.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client.models.generateContent as any)({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          responseMimeType: "application/json",
          temperature: 0.2,
          // This is a structured-extraction task, not open-ended reasoning: extended
          // "thinking" adds significant latency for no accuracy benefit here, and on
          // Vercel risks exceeding the serverless function's execution time limit.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    );
    const text: string | undefined = response.text;
    if (!text) {
      throw new AiRequestError("The AI service returned an empty response.");
    }
    return text;
  };

  let raw: string;
  try {
    raw = await call(params.contents);
  } catch (err) {
    if (err instanceof AiRequestError) throw err;
    logAiError("generateContent", err);
    throw new AiRequestError("The AI service request failed. Please try again.");
  }

  const tryParse = (text: string): T | null => {
    try {
      const json = JSON.parse(extractJsonText(text));
      const parsed = params.schema.safeParse(json);
      if (!parsed.success) {
        // Diagnostic only: logs which fields failed and why, never the document/model content itself.
        console.error(
          "[gemini:validation]",
          parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" | "),
        );
        return null;
      }
      return parsed.data;
    } catch (err) {
      console.error("[gemini:json-parse]", err instanceof Error ? err.message : String(err));
      return null;
    }
  };

  const first = tryParse(raw);
  if (first) return first;

  // One repair attempt: ask the model to fix its own output to valid JSON.
  try {
    const repaired = await call([
      ...params.contents,
      {
        role: "user",
        parts: [
          {
            text: `Your previous response was not valid JSON matching the required shape. ${params.promptForRepair} Return ONLY the corrected JSON, nothing else.`,
          },
        ],
      },
    ]);
    const second = tryParse(repaired);
    if (second) return second;
  } catch {
    // fall through to error below
  }

  throw new AiOutputError("The AI service returned output that could not be validated.");
}

export async function generateAnalysis<T>(
  doc: DocumentRef,
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  return generateStructured({
    contents: [
      {
        role: "user",
        parts: [documentPart(doc), { text: prompt }],
      },
    ],
    schema,
    promptForRepair: "Match the required document-analysis JSON shape exactly.",
  });
}

export async function generateAnswer<T>(
  doc: DocumentRef,
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  return generateStructured({
    contents: [
      {
        role: "user",
        parts: [documentPart(doc), { text: prompt }],
      },
    ],
    schema,
    promptForRepair: "Match the required question-answer JSON shape exactly.",
  });
}

export async function generateComparison<T>(
  docA: DocumentRef,
  docB: DocumentRef,
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  return generateStructured({
    contents: [
      {
        role: "user",
        parts: [
          { text: "Document A:" },
          documentPart(docA),
          { text: "Document B:" },
          documentPart(docB),
          { text: prompt },
        ],
      },
    ],
    schema,
    promptForRepair: "Match the required comparison JSON shape exactly.",
  });
}
