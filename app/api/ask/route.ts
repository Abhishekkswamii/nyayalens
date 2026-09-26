import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai/gemini";
import { buildQAPrompt } from "@/lib/ai/prompts";
import { checkRateLimit, getClientKey } from "@/lib/security/rate-limit";
import { documentRefSchema, qaSchema } from "@/lib/validation/schemas";
import { errorResponse, handleApiError } from "@/lib/api/respond";
import { sanitizeText } from "@/lib/security/sanitize";
import { answerDemoQuestion } from "@/lib/demo/sample-data";
import type { QuestionAnswer } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface AskBody {
  question: string;
  isDemo?: boolean;
  doc?: unknown;
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`ask:${clientKey}`, 20);
  if (!rate.allowed) {
    return errorResponse(
      `Too many requests. Please try again in ${rate.retryAfterSeconds} seconds.`,
      429,
    );
  }

  let body: AskBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const question = sanitizeText(body.question ?? "", 500);
  if (!question) {
    return errorResponse("Please enter a question.", 400);
  }

  if (body.isDemo) {
    const answer: QuestionAnswer = answerDemoQuestion(question);
    return NextResponse.json({ answer });
  }

  const docParse = documentRefSchema.safeParse(body.doc);
  if (!docParse.success) {
    return errorResponse(
      "No analyzed document was found for this session. Please upload a document first.",
      400,
    );
  }

  try {
    const aiResult = await generateAnswer(docParse.data, buildQAPrompt(question), qaSchema);
    const answer: QuestionAnswer = { ...aiResult, question };
    return NextResponse.json({ answer });
  } catch (err) {
    return handleApiError(err);
  }
}
