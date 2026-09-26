"use client";

import { useDocumentSession } from "@/lib/client/session-context";
import { RightsList } from "@/components/rights-list";

export default function RightsPage() {
  const { analysis } = useDocumentSession();
  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Rights</h1>
        <p className="mt-1 text-sm text-muted">Entitlements explicitly stated in this document.</p>
      </div>
      <RightsList rights={analysis.rights} />
    </div>
  );
}
