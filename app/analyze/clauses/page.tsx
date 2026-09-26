"use client";

import { useDocumentSession } from "@/lib/client/session-context";
import { ClauseTable } from "@/components/clause-table";

export default function ClausesPage() {
  const { analysis } = useDocumentSession();
  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Clauses</h1>
        <p className="mt-1 text-sm text-muted">All key clauses extracted from {analysis.fileName}.</p>
      </div>
      <ClauseTable clauses={analysis.clauses} />
    </div>
  );
}
