import { NextResponse } from "next/server";
import { AiConfigError, AiOutputError, AiRequestError } from "@/lib/ai/gemini";

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Maps internal errors to safe, user-facing messages — never leaks stack traces or internals. */
export function handleApiError(err: unknown) {
  if (err instanceof AiConfigError) {
    return errorResponse(
      "Live AI mode is not configured on this server. Try demo mode, or set GEMINI_API_KEY (or GOOGLE_CLOUD_PROJECT for Vertex AI).",
      503,
    );
  }
  if (err instanceof AiRequestError) {
    return errorResponse("The AI service request failed. Please try again in a moment.", 502);
  }
  if (err instanceof AiOutputError) {
    return errorResponse("The AI response could not be validated. Please try again.", 502);
  }
  return errorResponse("Something went wrong while processing your request.", 500);
}

let counter = 0;
export function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}
