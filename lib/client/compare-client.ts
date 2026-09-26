import { MAX_COMBINED_COMPARE_BYTES } from "@/lib/document/limits";
import type { ComparisonResult } from "@/lib/types";

export function validateCombinedCompareSize(fileA: File, fileB: File): string | null {
  if (fileA.size + fileB.size > MAX_COMBINED_COMPARE_BYTES) {
    return "Both files together must be 4 MB or smaller, since they travel in a single request.";
  }
  return null;
}

export async function compareDocuments(fileA: File, fileB: File): Promise<ComparisonResult> {
  const formData = new FormData();
  formData.append("fileA", fileA);
  formData.append("fileB", fileB);

  const response = await fetch("/api/compare", { method: "POST", body: formData });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? "Comparison failed. Please try again.");
  }

  return body.result as ComparisonResult;
}
