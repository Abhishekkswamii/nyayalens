import type { DocumentAnalysis } from "@/lib/types";
import type { ClientDocumentRef } from "@/lib/client/session-context";

export interface AnalyzeSuccess {
  analysis: DocumentAnalysis;
  doc: ClientDocumentRef;
}

export async function analyzeDocument(file: File): Promise<AnalyzeSuccess> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/analyze", { method: "POST", body: formData });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? "Analysis failed. Please try again.");
  }

  return body as AnalyzeSuccess;
}

export const MAX_CLIENT_FILE_SIZE = 15 * 1024 * 1024;

export function validateClientFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are supported.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > MAX_CLIENT_FILE_SIZE) return "File must be 15 MB or smaller.";
  return null;
}
