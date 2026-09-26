import { describe, expect, it } from "vitest";
import { validateCombinedCompareSize } from "@/lib/client/compare-client";
import { MAX_COMBINED_COMPARE_BYTES } from "@/lib/document/validate";

function fakeFile(size: number): File {
  return { size } as File;
}

describe("validateCombinedCompareSize", () => {
  it("accepts two files whose combined size is within budget", () => {
    const result = validateCombinedCompareSize(fakeFile(1024), fakeFile(1024));
    expect(result).toBeNull();
  });

  it("rejects two files that individually pass but together exceed the combined cap", () => {
    // Neither file alone would trip a naive per-file check at this size, but
    // together they exceed the request body budget both files share.
    const half = Math.floor(MAX_COMBINED_COMPARE_BYTES / 2) + 1024;
    const result = validateCombinedCompareSize(fakeFile(half), fakeFile(half));
    expect(result).toMatch(/4 MB/i);
  });

  it("accepts a combined size exactly at the cap", () => {
    const result = validateCombinedCompareSize(
      fakeFile(MAX_COMBINED_COMPARE_BYTES / 2),
      fakeFile(MAX_COMBINED_COMPARE_BYTES / 2),
    );
    expect(result).toBeNull();
  });
});
