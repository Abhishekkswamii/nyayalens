/**
 * Lightweight, dev/test-only duration logging for the AI pipeline — not an
 * observability platform, just enough to catch a regression (e.g. an
 * accidental extra model call) while iterating locally. No-op in
 * production, and never logs document or model content.
 */
const ENABLED = process.env.NODE_ENV !== "production";

export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!ENABLED) return fn();
  const start = Date.now();
  try {
    return await fn();
  } finally {
    console.info(`[perf] ${label}: ${Date.now() - start}ms`);
  }
}
