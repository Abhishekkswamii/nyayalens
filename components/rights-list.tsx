import { EmptyState } from "@/components/empty-state";
import { RightsIcon } from "@/components/icons";
import type { Right } from "@/lib/types";

export function RightsList({ rights }: { rights: Right[] }) {
  if (rights.length === 0) {
    return (
      <EmptyState
        icon={RightsIcon}
        title="No rights identified"
        body="No explicit rights or entitlements were extracted from this document."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {rights.map((right) => (
        <li key={right.id} className="rounded-card border border-border bg-surface p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">{right.party}</p>
          <p className="mt-2 text-sm text-ink">{right.description}</p>
          <p className="mt-3 text-xs text-muted">
            {right.evidence.available ? (
              <>Section {right.evidence.section ?? "—"} · Page {right.evidence.page ?? "—"}</>
            ) : (
              "Evidence unavailable"
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
