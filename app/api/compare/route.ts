import { NextRequest, NextResponse } from "next/server";
import { generateComparison, uploadPdf } from "@/lib/ai/gemini";
import { buildComparisonPrompt } from "@/lib/ai/prompts";
import { validateFileMetadata, validatePdfMagicBytes } from "@/lib/document/validate";
import { checkRateLimit, getClientKey } from "@/lib/security/rate-limit";
import { comparisonSchema } from "@/lib/validation/schemas";
import { errorResponse, handleApiError } from "@/lib/api/respond";
import type { ComparisonResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`compare:${clientKey}`, 6);
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

  const fileA = formData.get("fileA");
  const fileB = formData.get("fileB");
  if (!(fileA instanceof File) || !(fileB instanceof File)) {
    return errorResponse("Two PDF files are required to compare.", 400);
  }

  for (const file of [fileA, fileB]) {
    const check = validateFileMetadata({ name: file.name, type: file.type, size: file.size });
    if (!check.valid) {
      return errorResponse(check.error ?? "Invalid file.", 400);
    }
  }

  try {
    const [bytesA, bytesB] = await Promise.all([
      fileA.arrayBuffer().then((b) => new Uint8Array(b)),
      fileB.arrayBuffer().then((b) => new Uint8Array(b)),
    ]);

    if (!validatePdfMagicBytes(bytesA) || !validatePdfMagicBytes(bytesB)) {
      return errorResponse("One of the files does not appear to be a valid PDF.", 400);
    }

    const [docA, docB] = await Promise.all([
      uploadPdf(bytesA, fileA.name),
      uploadPdf(bytesB, fileB.name),
    ]);

    const aiResult = await generateComparison(docA, docB, buildComparisonPrompt(), comparisonSchema);

    const result: ComparisonResult = {
      documentAName: fileA.name,
      documentBName: fileB.name,
      rows: aiResult.rows,
      materialDifferences: aiResult.materialDifferences,
    };

    return NextResponse.json({ result });
  } catch (err) {
    return handleApiError(err);
  }
}
