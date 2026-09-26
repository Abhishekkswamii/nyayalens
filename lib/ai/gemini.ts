import { GoogleGenAI } from "@google/genai";
import type { ZodSchema } from "zod";
import { SYSTEM_INSTRUCTIONS } from "@/lib/ai/prompts";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiConfigError("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

export class AiConfigError extends Error {}
export class AiRequestError extends Error {}
export class AiOutputError extends Error {}

export interface UploadedDoc {
  uri: string;
  mimeType: string;
}

/** Uploads a PDF once via the Files API so it can be referenced (by URI) across
 * analysis, Q&A and comparison calls without re-sending the bytes each time. */
export async function uploadPdf(bytes: Uint8Array, displayName: string): Promise<UploadedDoc> {
  const client = getClient();
  const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });

  try {
    const uploaded = await client.files.upload({
      file: blob,
      config: { mimeType: "application/pdf", displayName },
    });

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

    return { uri: file.uri, mimeType: file.mimeType || "application/pdf" };
  } catch (err) {
    if (err instanceof AiRequestError) throw err;
    throw new AiRequestError("Failed to upload the document to the AI service.");
  }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.models.generateContent as any)({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
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
    throw new AiRequestError("The AI service request failed. Please try again.");
  }

  const tryParse = (text: string): T | null => {
    try {
      const json = JSON.parse(extractJsonText(text));
      const parsed = params.schema.safeParse(json);
      return parsed.success ? parsed.data : null;
    } catch {
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
  doc: UploadedDoc,
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  return generateStructured({
    contents: [
      {
        role: "user",
        parts: [{ fileData: { fileUri: doc.uri, mimeType: doc.mimeType } }, { text: prompt }],
      },
    ],
    schema,
    promptForRepair: "Match the required document-analysis JSON shape exactly.",
  });
}

export async function generateAnswer<T>(
  doc: UploadedDoc,
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  return generateStructured({
    contents: [
      {
        role: "user",
        parts: [{ fileData: { fileUri: doc.uri, mimeType: doc.mimeType } }, { text: prompt }],
      },
    ],
    schema,
    promptForRepair: "Match the required question-answer JSON shape exactly.",
  });
}

export async function generateComparison<T>(
  docA: UploadedDoc,
  docB: UploadedDoc,
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  return generateStructured({
    contents: [
      {
        role: "user",
        parts: [
          { text: "Document A:" },
          { fileData: { fileUri: docA.uri, mimeType: docA.mimeType } },
          { text: "Document B:" },
          { fileData: { fileUri: docB.uri, mimeType: docB.mimeType } },
          { text: prompt },
        ],
      },
    ],
    schema,
    promptForRepair: "Match the required comparison JSON shape exactly.",
  });
}
