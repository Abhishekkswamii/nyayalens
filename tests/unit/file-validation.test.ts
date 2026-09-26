import { describe, expect, it } from "vitest";
import { validateFileMetadata, validatePdfMagicBytes, MAX_FILE_SIZE_BYTES } from "@/lib/document/validate";

describe("validateFileMetadata", () => {
  it("accepts a valid PDF under the size limit", () => {
    const result = validateFileMetadata({ name: "contract.pdf", type: "application/pdf", size: 1024 });
    expect(result.valid).toBe(true);
  });

  it("rejects a non-PDF mime type and extension", () => {
    const result = validateFileMetadata({ name: "contract.docx", type: "application/msword", size: 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/PDF/i);
  });

  it("rejects an empty file", () => {
    const result = validateFileMetadata({ name: "empty.pdf", type: "application/pdf", size: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it("rejects a file over the size limit", () => {
    const result = validateFileMetadata({
      name: "huge.pdf",
      type: "application/pdf",
      size: MAX_FILE_SIZE_BYTES + 1,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/4 MB/i);
  });

  it("rejects a file with no name", () => {
    const result = validateFileMetadata({ name: "", type: "application/pdf", size: 1024 });
    expect(result.valid).toBe(false);
  });

  it("accepts a .pdf extension even with a generic mime type", () => {
    const result = validateFileMetadata({ name: "contract.pdf", type: "application/octet-stream", size: 1024 });
    expect(result.valid).toBe(true);
  });
});

describe("validatePdfMagicBytes", () => {
  it("accepts bytes starting with the PDF signature", () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(validatePdfMagicBytes(bytes)).toBe(true);
  });

  it("rejects bytes without the PDF signature", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    expect(validatePdfMagicBytes(bytes)).toBe(false);
  });

  it("rejects a too-short buffer", () => {
    const bytes = new Uint8Array([0x25, 0x50]);
    expect(validatePdfMagicBytes(bytes)).toBe(false);
  });

  it("rejects content that merely claims to be a PDF by extension", () => {
    // A file renamed to .pdf but containing non-PDF bytes must still fail the content check.
    const bytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // MZ header (executable)
    expect(validatePdfMagicBytes(bytes)).toBe(false);
  });
});
