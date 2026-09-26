import { z } from "zod";

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
  parties: z.array(z.string().max(200)).max(10),
  effectiveDate: z.string().max(60).nullable(),
  duration: z.string().max(120).nullable(),
  jurisdiction: z.string().max(120).nullable(),
});

export const riskSummarySchema = z.object({
  totalClauses: z.number().int().nonnegative(),
  high: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  low: z.number().int().nonnegative(),
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
  clauses: z.array(legalClauseSchema).max(60),
  obligations: z.array(obligationSchema).max(60),
  rights: z.array(rightSchema).max(60),
  risks: z.array(riskFindingSchema).max(60),
  riskSummary: riskSummarySchema,
  suggestedQuestions: z.array(suggestedQuestionSchema).max(12),
  lawyerPrep: z.array(lawyerPrepItemSchema).max(20),
});

export const qaSchema = z.object({
  answer: z.string().min(1).max(2000),
  whatDocumentSays: z.string().min(1).max(1500),
  evidence: z.array(evidenceCitationSchema).max(10),
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

export const askRequestSchema = z.object({
  sessionId: z.string().min(1).max(200),
  question: z.string().min(1).max(500),
});

export const uploadValidationSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.literal("application/pdf"),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(15 * 1024 * 1024, "File must be 15 MB or smaller."),
});

export type AnalysisAIResponse = z.infer<typeof analysisSchema>;
export type QAAIResponse = z.infer<typeof qaSchema>;
export type ComparisonAIResponse = z.infer<typeof comparisonSchema>;
