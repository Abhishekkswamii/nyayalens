import { EmptyState } from "@/components/empty-state";
import { ObligationIcon } from "@/components/icons";
import type { Obligation } from "@/lib/types";

export function ObligationTable({ obligations }: { obligations: Obligation[] }) {
  if (obligations.length === 0) {
    return (
      <EmptyState
        icon={ObligationIcon}
        title="No obligations identified"
        body="No explicit obligations were extracted from this document."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-4 py-3 font-medium">Party</th>
            <th scope="col" className="px-4 py-3 font-medium">Obligation</th>
            <th scope="col" className="px-4 py-3 font-medium">Timing</th>
            <th scope="col" className="px-4 py-3 font-medium">Consequence stated</th>
            <th scope="col" className="px-4 py-3 font-medium">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {obligations.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-secondary/40">
              <td className="px-4 py-3 font-semibold uppercase text-ink">{item.party}</td>
              <td className="px-4 py-3 text-ink">{item.obligation}</td>
              <td className="px-4 py-3 text-muted">{item.timing}</td>
              <td className="px-4 py-3 text-muted">{item.consequence}</td>
              <td className="px-4 py-3 text-muted">
                {item.evidence.available ? (
                  <>Section {item.evidence.section ?? "—"} · Page {item.evidence.page ?? "—"}</>
                ) : (
                  "Evidence unavailable"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
