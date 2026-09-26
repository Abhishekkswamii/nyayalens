import type { ComparisonResult } from "@/lib/types";

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
