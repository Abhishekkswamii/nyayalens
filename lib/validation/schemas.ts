import { z } from "zod";
import { MAX_FILE_SIZE_BYTES } from "@/lib/document/limits";

const GEMINI_FILE_URI_PREFIX = "https://generativelanguage.googleapis.com/";

/**
 * Vertex AI has no Files API, so its documents travel inline (base64) in the
 * request/response body instead of by reference. Vercel serverless functions
 * hard-cap request/response bodies at 4.5 MB, so this must stay well under
 * that once base64's ~1.37x inflation and the surrounding JSON are accounted
 * for — see MAX_INLINE_FILE_SIZE_BYTES in lib/ai/gemini.ts for the matching
 * pre-encoding size check.
 */
const MAX_INLINE_BASE64_LENGTH = Math.ceil((3 * 1024 * 1024 * 4) / 3); // ~3 MB decoded, base64-inflated

/**
 * A reference to an already-uploaded document, round-tripped through the
 * client between /api/analyze and follow-up /api/ask /api/compare calls (see
 * lib/ai/gemini.ts's DocumentRef). Bounded so a client can't smuggle an
 * oversized payload in under the "inline" variant.
 */
export const documentRefSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("file"),
    uri: z.string().startsWith(GEMINI_FILE_URI_PREFIX),
    mimeType: z.literal("application/pdf"),
  }),
  z.object({
    kind: z.literal("inline"),
    base64: z.string().max(MAX_INLINE_BASE64_LENGTH),
    mimeType: z.literal("application/pdf"),
  }),
]);

export const concernLevelSchema = z.enum(["high", "medium", "low", "info"]);
export const confidenceSchema = z.enum(["high", "medium", "low"]);

export const evidenceCitationSchema = z.object({
  page: z.number().int().positive().nullable(),
  section: z.string().nullable(),
  quote: z.string().max(600).nullable(),
  available: z.boolean(),
});

export const legalClauseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  category: z.enum([
    "payment",
    "termination",
    "confidentiality",
    "intellectual-property",
    "liability",
    "dispute-resolution",
    "privacy",
    "employment",
    "restrictions",
    "general",
  ]),
  page: z.number().int().positive().nullable(),
  section: z.string().nullable(),
  originalText: z.string().min(1).max(2000),
  plainEnglish: z.string().min(1).max(1000),
  concernLevel: concernLevelSchema,
  whyItMatters: z.string().min(1).max(600),
  evidence: evidenceCitationSchema,
  confidence: confidenceSchema,
  recommendedQuestion: z.string().min(1).max(300),
});

export const obligationSchema = z.object({
  id: z.string().min(1),
  party: z.string().min(1).max(120),
  obligation: z.string().min(1).max(400),
  timing: z.string().min(1).max(120),
  consequence: z.string().min(1).max(400),
  evidence: evidenceCitationSchema,
});

export const rightSchema = z.object({
  id: z.string().min(1),
  party: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
  evidence: evidenceCitationSchema,
});

export const riskFindingSchema = z.object({
  id: z.string().min(1),
  clauseId: z.string().nullable(),
  title: z.string().min(1).max(160),
  concernLevel: concernLevelSchema,
  explanation: z.string().min(1).max(600),
  evidence: evidenceCitationSchema,
});

export const documentMetadataSchema = z.object({
  documentType: z.string().min(1).max(120),
  parties: z.array(z.string().max(200)).max(40),
  effectiveDate: z.string().max(60).nullable(),
  duration: z.string().max(120).nullable(),
  jurisdiction: z.string().max(120).nullable(),
});

/**
 * Full risk summary as stored in DocumentAnalysis. The counts are never
 * trusted from the model (see aiRiskSummarySchema below) — they're derived
 * deterministically from the validated clauses array in
 * app/api/analyze/route.ts via lib/ai/derive.ts's computeRiskSummary, so
 * they can never drift from what the UI actually renders.
 */
export const riskSummarySchema = z.object({
  totalClauses: z.number().int().nonnegative(),
  high: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  low: z.number().int().nonnegative(),
  keyTakeaway: z.string().min(1).max(500),
});

/** What we actually ask the model for: a qualitative takeaway, not arithmetic. */
export const aiRiskSummarySchema = z.object({
  keyTakeaway: z.string().min(1).max(500),
});

export const suggestedQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1).max(200),
});

export const lawyerPrepItemSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1).max(160),
  question: z.string().min(1).max(300),
  relatedClauseId: z.string().nullable(),
});

export const analysisSchema = z.object({
  metadata: documentMetadataSchema,
  summary: z.string().min(1).max(2000),
  clauses: z.array(legalClauseSchema).max(25),
  obligations: z.array(obligationSchema).max(25),
  rights: z.array(rightSchema).max(20),
  risks: z.array(riskFindingSchema).max(20),
  riskSummary: aiRiskSummarySchema,
  suggestedQuestions: z.array(suggestedQuestionSchema).max(8),
  lawyerPrep: z.array(lawyerPrepItemSchema).max(10),
});

export const qaSchema = z.object({
  answer: z.string().min(1).max(2000),
  whatDocumentSays: z.string().min(1).max(1500),
  evidence: z.array(evidenceCitationSchema).max(6),
  uncertainty: z.string().max(600).nullable(),
  suggestedNextQuestion: z.string().max(300).nullable(),
  confidence: confidenceSchema,
  grounded: z.boolean(),
});

export const comparisonRowSchema = z.object({
  dimension: z.string().min(1).max(120),
  documentA: z.string().min(1).max(400),
  documentB: z.string().min(1).max(400),
  evidenceA: evidenceCitationSchema,
  evidenceB: evidenceCitationSchema,
  differs: z.boolean(),
});

export const materialDifferenceSchema = z.object({
  dimension: z.string().min(1).max(120),
  whatChanged: z.string().min(1).max(500),
  whyItMayMatter: z.string().min(1).max(500),
});

export const comparisonSchema = z.object({
  rows: z.array(comparisonRowSchema).max(20),
  materialDifferences: z.array(materialDifferenceSchema).max(20),
});

export const uploadValidationSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.literal("application/pdf"),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, "File must be 4 MB or smaller."),
});

export type AnalysisAIResponse = z.infer<typeof analysisSchema>;
export type QAAIResponse = z.infer<typeof qaSchema>;
export type ComparisonAIResponse = z.infer<typeof comparisonSchema>;
