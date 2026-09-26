import type { QuestionAnswer } from "@/lib/types";
import type { UploadedDocRef } from "@/lib/client/session-context";

export async function askQuestion(params: {
  question: string;
  isDemo: boolean;
  doc: UploadedDocRef | null;
}): Promise<QuestionAnswer> {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: params.question, isDemo: params.isDemo, doc: params.doc }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "Could not get an answer. Please try again.");
  }
  return body.answer as QuestionAnswer;
}
