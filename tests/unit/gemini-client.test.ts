import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertInlineSizeAllowed,
  DocumentTooLargeForBackendError,
  isTransientError,
  isVertexMode,
  MAX_INLINE_FILE_SIZE_BYTES,
} from "@/lib/ai/gemini";

describe("isTransientError", () => {
  it("classifies a 503 UNAVAILABLE error as transient", () => {
    const err = new Error('{"error":{"code":503,"status":"UNAVAILABLE","message":"high demand"}}');
    expect(isTransientError(err)).toBe(true);
  });

  it("classifies a 429 RESOURCE_EXHAUSTED error as transient", () => {
    const err = new Error('{"error":{"code":429,"status":"RESOURCE_EXHAUSTED"}}');
    expect(isTransientError(err)).toBe(true);
  });

  it("does not retry a permanent 404 model-not-found error", () => {
    const err = new Error('{"error":{"code":404,"status":"NOT_FOUND","message":"model not found"}}');
    expect(isTransientError(err)).toBe(false);
  });

  it("does not retry a permanent 403 permission error", () => {
    const err = new Error('{"error":{"code":403,"status":"PERMISSION_DENIED"}}');
    expect(isTransientError(err)).toBe(false);
  });

  it("does not retry a generic schema/programming error", () => {
    expect(isTransientError(new TypeError("Cannot read properties of undefined"))).toBe(false);
  });
});

describe("assertInlineSizeAllowed / MAX_INLINE_FILE_SIZE_BYTES", () => {
  it("allows a file at or under the inline-mode cap", () => {
    expect(() => assertInlineSizeAllowed(MAX_INLINE_FILE_SIZE_BYTES)).not.toThrow();
    expect(() => assertInlineSizeAllowed(1024)).not.toThrow();
  });

  it("rejects a file over the inline-mode cap before any network call", () => {
    expect(() => assertInlineSizeAllowed(MAX_INLINE_FILE_SIZE_BYTES + 1)).toThrow(
      DocumentTooLargeForBackendError,
    );
  });
});

describe("isVertexMode", () => {
  const originalProject = process.env.GOOGLE_CLOUD_PROJECT;

  afterEach(() => {
    if (originalProject === undefined) delete process.env.GOOGLE_CLOUD_PROJECT;
    else process.env.GOOGLE_CLOUD_PROJECT = originalProject;
    vi.unstubAllEnvs();
  });

  it("is false when no Google Cloud project is configured", () => {
    delete process.env.GOOGLE_CLOUD_PROJECT;
    expect(isVertexMode()).toBe(false);
  });

  it("is true when a Google Cloud project is configured", () => {
    process.env.GOOGLE_CLOUD_PROJECT = "some-project";
    expect(isVertexMode()).toBe(true);
  });
});
