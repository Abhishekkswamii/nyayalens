import { uploadValidationSchema } from "@/lib/validation/schemas";

// Re-exported for existing importers; new code should prefer importing
// straight from lib/document/limits.ts, which has no Zod dependency and is
// safe to use from client components without bloating the client bundle.
export { MAX_FILE_SIZE_BYTES, MAX_COMBINED_COMPARE_BYTES } from "@/lib/document/limits";
import { MAX_FILE_SIZE_BYTES } from "@/lib/document/limits";

export const ALLOWED_MIME_TYPE = "application/pdf";
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/** Validates metadata (name/type/size) without reading the file body. */
export function validateFileMetadata(file: {
  name: string;
  type: string;
  size: number;
}): FileValidationResult {
  if (!file.name) {
    return { valid: false, error: "The file has no name." };
  }
  if (file.size === 0) {
    return { valid: false, error: "The file is empty." };
  }
  if (file.type !== ALLOWED_MIME_TYPE && !file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "Only PDF files are supported." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File must be 4 MB or smaller." };
  }

  const parsed = uploadValidationSchema.safeParse({
    fileName: file.name,
    mimeType: ALLOWED_MIME_TYPE,
    sizeBytes: file.size,
  });

  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues[0]?.message ?? "Invalid file." };
  }

  return { valid: true };
}

/** Confirms the file body actually starts with the PDF magic bytes — a real content check, not just a trusted extension. */
export function validatePdfMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  return PDF_MAGIC_BYTES.every((byte, i) => bytes[i] === byte);
}
