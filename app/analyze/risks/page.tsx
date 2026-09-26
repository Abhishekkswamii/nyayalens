"use client";

import { useState } from "react";
import { useDocumentSession } from "@/lib/client/session-context";
import { ConcernBadge } from "@/components/concern-badge";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import { EmptyState } from "@/components/empty-state";
import { WarningIcon } from "@/components/icons";
import type { RiskFinding } from "@/lib/types";

export default function RisksPage() {
  const { analysis } = useDocumentSession();
  const [selected, setSelected] = useState<RiskFinding | null>(null);
  if (!analysis) return null;

  const highRisks = analysis.risks.filter((r) => r.concernLevel === "high");

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Risks</h1>
        <p className="mt-1 text-sm text-muted">
          Potential concerns identified from the document, prioritized by how much attention they may
          deserve — not a legal ruling.
        </p>
      </div>

      {analysis.risks.length === 0 ? (
        <EmptyState
          icon={WarningIcon}
          title="No high-concern findings"
          body="No high-concern items were identified from this document."
        />
      ) : (
        <ul className="space-y-3">
          {analysis.risks.map((risk) => (
            <li key={risk.id} className="rounded-card border border-border bg-surface p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-base font-semibold text-ink">{risk.title}</p>
                  <p className="mt-1 text-sm text-muted">{risk.explanation}</p>
                </div>
                <ConcernBadge level={risk.concernLevel} />
              </div>
              <button
                type="button"
                onClick={() => setSelected(risk)}
                className="focus-ring mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-secondary"
              >
                View evidence →
              </button>
            </li>
          ))}
        </ul>
      )}

      {highRisks.length === 0 && analysis.risks.length > 0 && (
        <p className="text-xs text-muted">
          No high-concern items were identified — this reflects the document&apos;s content, not a guarantee
          of legal safety.
        </p>
      )}

      <EvidenceDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        evidence={selected?.evidence ?? { page: null, section: null, quote: null, available: false }}
      />
    </div>
  );
}
