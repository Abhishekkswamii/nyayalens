import { NextRequest, NextResponse } from "next/server";
import { generateAnalysis, prepareDocument } from "@/lib/ai/gemini";
import { buildAnalysisPrompt } from "@/lib/ai/prompts";
import { validateFileMetadata, validatePdfMagicBytes } from "@/lib/document/validate";
import { checkRateLimit, getClientKey } from "@/lib/security/rate-limit";
import { analysisSchema } from "@/lib/validation/schemas";
import { errorResponse, generateId, handleApiError } from "@/lib/api/respond";
import type { DocumentAnalysis } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`analyze:${clientKey}`, 10);
  if (!rate.allowed) {
    return errorResponse(
      `Too many requests. Please try again in ${rate.retryAfterSeconds} seconds.`,
      429,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Could not read the upload. Please try again.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return errorResponse("No file was provided.", 400);
  }

  const metaCheck = validateFileMetadata({ name: file.name, type: file.type, size: file.size });
  if (!metaCheck.valid) {
    return errorResponse(metaCheck.error ?? "Invalid file.", 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (!validatePdfMagicBytes(bytes)) {
    return errorResponse("The file does not appear to be a valid PDF.", 400);
  }

  try {
    const doc = await prepareDocument(bytes, file.name);
    const aiResult = await generateAnalysis(doc, buildAnalysisPrompt(), analysisSchema);

    const analysis: DocumentAnalysis = {
      sessionId: generateId("session"),
      fileName: file.name,
      pageCount: estimatePageCount(bytes),
      fileSizeBytes: file.size,
      metadata: aiResult.metadata,
      summary: aiResult.summary,
      clauses: aiResult.clauses,
      obligations: aiResult.obligations,
      rights: aiResult.rights,
      risks: aiResult.risks,
      riskSummary: aiResult.riskSummary,
      suggestedQuestions: aiResult.suggestedQuestions,
      lawyerPrep: aiResult.lawyerPrep,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ analysis, doc });
  } catch (err) {
    return handleApiError(err);
  }
}

/** Rough page-count estimate from PDF object markers — good enough for display; not exact for all PDFs. */
function estimatePageCount(bytes: Uint8Array): number {
  const text = Buffer.from(bytes).toString("latin1");
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches && matches.length > 0 ? matches.length : 1;
}
