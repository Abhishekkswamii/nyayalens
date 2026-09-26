import { describe, expect, it } from "vitest";
import { computeRiskSummary } from "@/lib/ai/derive";
import type { LegalClause } from "@/lib/types";

function clause(concernLevel: LegalClause["concernLevel"]): LegalClause {
  return {
    id: `c-${concernLevel}-${Math.random()}`,
    title: "Test clause",
    category: "general",
    page: null,
    section: null,
    originalText: "text",
    plainEnglish: "text",
    concernLevel,
    whyItMatters: "text",
    evidence: { page: null, section: null, quote: null, available: false },
    confidence: "high",
    recommendedQuestion: "?",
  };
}

describe("computeRiskSummary", () => {
  it("counts clauses by concern level rather than trusting a supplied count", () => {
    const clauses = [clause("high"), clause("high"), clause("medium"), clause("low"), clause("info")];
    const summary = computeRiskSummary(clauses, "takeaway");
    expect(summary).toEqual({
      totalClauses: 5,
      high: 2,
      medium: 1,
      low: 1,
      keyTakeaway: "takeaway",
    });
  });

  it("returns all-zero counts for an empty clause list", () => {
    const summary = computeRiskSummary([], "no clauses found");
    expect(summary).toEqual({ totalClauses: 0, high: 0, medium: 0, low: 0, keyTakeaway: "no clauses found" });
  });

  it("never drifts from the actual clause list (regression: demo data once hand-authored a mismatched count)", () => {
    // This mirrors a real bug caught during development: DEMO_ANALYSIS.riskSummary
    // was hand-written as { high: 3, medium: 4, low: 1 } while its 8 clauses
    // actually broke down as { high: 3, medium: 3, low: 2 }.
    const clauses = [
      clause("low"),
      clause("medium"),
      clause("low"),
      clause("medium"),
      clause("high"),
      clause("high"),
      clause("high"),
      clause("medium"),
    ];
    const summary = computeRiskSummary(clauses, "x");
    expect(summary.high).toBe(3);
    expect(summary.medium).toBe(3);
    expect(summary.low).toBe(2);
    expect(summary.totalClauses).toBe(8);
  });
});
