"use client";

import { useDocumentSession } from "@/lib/client/session-context";

export default function LawyerPrepPage() {
  const { analysis } = useDocumentSession();
  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Prepare for a lawyer</h1>
        <p className="mt-1 text-sm text-muted">
          A checklist of topics and questions to raise with a qualified professional before signing.
        </p>
      </div>

      <ol className="space-y-3">
        {analysis.lawyerPrep.map((item, i) => (
          <li key={item.id} className="rounded-card border border-border bg-surface p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
              {i + 1}. {item.topic}
            </p>
            <p className="mt-1.5 text-sm text-ink">{item.question}</p>
          </li>
        ))}
      </ol>

      {analysis.lawyerPrep.length === 0 && (
        <p className="text-sm text-muted">No specific preparation items were generated for this document.</p>
      )}

      <div className="rounded-card border border-gold/30 bg-gold/10 p-4">
        <p className="text-sm text-ink">
          This checklist helps you prepare for professional advice. It is not legal advice.
        </p>
      </div>
    </div>
  );
}
