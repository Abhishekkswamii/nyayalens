"use client";

import { useDocumentSession } from "@/lib/client/session-context";
import { ObligationTable } from "@/components/obligation-table";

export default function ObligationsPage() {
  const { analysis } = useDocumentSession();
  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Obligations</h1>
        <p className="mt-1 text-sm text-muted">What each party must do under this document.</p>
      </div>
      <ObligationTable obligations={analysis.obligations} />
    </div>
  );
}
