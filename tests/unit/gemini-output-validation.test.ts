import { describe, expect, it } from "vitest";
import { analysisSchema } from "@/lib/validation/schemas";

/**
 * These tests exercise the same validate-or-reject path the AI client uses
 * after a model call, without making a real network request. They confirm
 * malformed / hallucinated model output is rejected rather than rendered.
 */
describe("AI output validation (defense against malformed model output)", () => {
  it("rejects output with a fabricated field type (page as a string)", () => {
    const malformed = {
      metadata: { documentType: "NDA", parties: [], effectiveDate: null, duration: null, jurisdiction: null },
      summary: "s",
      clauses: [
        {
          id: "c1",
          title: "Test",
          category: "general",
          page: "one", // should be a number or null
          section: null,
          originalText: "text",
          plainEnglish: "text",
          concernLevel: "low",
          whyItMatters: "text",
          evidence: { page: null, section: null, quote: null, available: false },
          confidence: "high",
          recommendedQuestion: "?",
        },
      ],
      obligations: [],
      rights: [],
      risks: [],
      riskSummary: { keyTakeaway: "ok" },
      suggestedQuestions: [],
      lawyerPrep: [],
    };
    expect(analysisSchema.safeParse(malformed).success).toBe(false);
  });

  it("rejects completely empty or non-object output", () => {
    expect(analysisSchema.safeParse(null).success).toBe(false);
    expect(analysisSchema.safeParse("not json").success).toBe(false);
    expect(analysisSchema.safeParse([]).success).toBe(false);
  });

  it("rejects an oversized clause list beyond the 25-clause cap", () => {
    const tooMany = Array.from({ length: 26 }, (_, i) => ({
      id: `c${i}`,
      title: "Clause",
      category: "general",
      page: null,
      section: null,
      originalText: "text",
      plainEnglish: "text",
      concernLevel: "low",
      whyItMatters: "text",
      evidence: { page: null, section: null, quote: null, available: false },
      confidence: "high",
      recommendedQuestion: "?",
    }));
    const payload = {
      metadata: { documentType: "NDA", parties: [], effectiveDate: null, duration: null, jurisdiction: null },
      summary: "s",
      clauses: tooMany,
      obligations: [],
      rights: [],
      risks: [],
      riskSummary: { keyTakeaway: "ok" },
      suggestedQuestions: [],
      lawyerPrep: [],
    };
    expect(analysisSchema.safeParse(payload).success).toBe(false);
  });
});
