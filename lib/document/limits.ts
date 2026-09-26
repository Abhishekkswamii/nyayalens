/**
 * File-size limits, kept in a dependency-free module on purpose.
 *
 * These constants are imported by client components (e.g.
 * lib/client/compare-client.ts, for instant client-side validation) as well
 * as server code. Defining them here — rather than in lib/document/validate.ts
 * or lib/validation/schemas.ts, which both pull in the full Zod schema set —
 * avoids dragging every AI response schema into the client bundle just to
 * read two numbers. (A prior version of this file did exactly that: it
 * added ~14 kB to the /compare route's first-load JS for zero functional
 * benefit, caught by comparing production build output before/after.)
 *
 * Both values are 4 MB: verified against a production smoke test where
 * Vercel's own gateway rejected an upload over ~4.5 MB (`FUNCTION_PAYLOAD_TOO_LARGE`,
 * HTTP 413) before this app's code ran at all. See lib/ai/gemini.ts's
 * MAX_INLINE_FILE_SIZE_BYTES for the additional, tighter cap specific to
 * Vertex AI's inline (base64 round-trip) mode.
 */
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

/** Compare uploads both files in one request, so this is the combined total, not double the single-file cap. */
export const MAX_COMBINED_COMPARE_BYTES = 4 * 1024 * 1024;
