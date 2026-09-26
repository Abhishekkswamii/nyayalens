"use client";

import Link from "next/link";
import { useDocumentSession } from "@/lib/client/session-context";
import { RiskRadar } from "@/components/risk-radar";
import { ClauseTable } from "@/components/clause-table";
import { AskAiPanel } from "@/components/ask-ai-panel";

export default function OverviewPage() {
  const { analysis } = useDocumentSession();
  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">Document overview</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Understand before you sign</h1>
        <p className="mt-1 text-sm text-muted">
          Plain-language insights, key clauses, risks and next steps — powered by AI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-card border border-border bg-surface p-6 shadow-card lg:col-span-2">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Document type</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{analysis.metadata.documentType}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Parties</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{analysis.metadata.parties.join(" ↔ ") || "Not stated"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Effective date</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{analysis.metadata.effectiveDate ?? "Not stated"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Duration</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{analysis.metadata.duration ?? "Not stated"}</dd>
            </div>
          </dl>

          <div className="rounded-md bg-surface-secondary/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Summary</p>
            <p className="mt-1.5 text-sm text-ink">{analysis.summary}</p>
            <Link
              href="/analyze/clauses"
              className="focus-ring mt-3 inline-block text-xs font-semibold text-gold-dark underline"
            >
              Read full plain-English summary →
            </Link>
          </div>
        </div>

        <RiskRadar summary={analysis.riskSummary} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClauseTable clauses={analysis.clauses} />
        </div>
        <AskAiPanel />
      </div>
    </div>
  );
}
