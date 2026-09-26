import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit(key, 5).allowed).toBe(true);
    }
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      checkRateLimit(key, 3);
    }
    const result = checkRateLimit(key, 3);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    checkRateLimit(keyA, 1);
    expect(checkRateLimit(keyA, 1).allowed).toBe(false);
    expect(checkRateLimit(keyB, 1).allowed).toBe(true);
  });
});
