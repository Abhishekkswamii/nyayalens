import type { LegalClause, RiskSummary } from "@/lib/types";

/**
 * The clause-level concern counts are computed here from the validated
 * clauses array, never trusted from the model's own arithmetic — the model
 * is only asked for a qualitative `keyTakeaway` (see aiRiskSummarySchema in
 * lib/validation/schemas.ts). This is strictly cheaper (no extra tokens
 * spent having the model count its own output) and strictly more correct
 * (the numbers the UI shows can never drift from the clauses it renders).
 */
export function computeRiskSummary(clauses: LegalClause[], keyTakeaway: string): RiskSummary {
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const clause of clauses) {
    if (clause.concernLevel === "high") high += 1;
    else if (clause.concernLevel === "medium") medium += 1;
    else if (clause.concernLevel === "low") low += 1;
  }

  return {
    totalClauses: clauses.length,
    high,
    medium,
    low,
    keyTakeaway,
  };
}
