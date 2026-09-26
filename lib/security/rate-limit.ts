/**
 * Minimal in-memory sliding-window rate limiter, appropriate for a single
 * serverless-region hackathon deployment. Not distributed — if this needs
 * to scale across regions, swap for a shared store, but that is out of
 * scope for this submission.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

export function checkRateLimit(
  key: string,
  limit: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
