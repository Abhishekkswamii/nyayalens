"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";
import { ConcernBadge } from "@/components/concern-badge";
import type { LegalClause } from "@/lib/types";

export function ClauseDetailDialog({
  clause,
  onClose,
}: {
  clause: LegalClause | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (clause) closeRef.current?.focus();
  }, [clause]);

  useEffect(() => {
    if (!clause) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clause, onClose]);

  if (!clause) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close clause details"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clause-dialog-title"
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-card"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="clause-dialog-title" className="font-serif text-xl font-semibold text-ink">
              {clause.title}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{clause.category.replace("-", " ")}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="focus-ring shrink-0 rounded-md p-1.5 text-muted hover:bg-surface-secondary hover:text-ink"
          >
            <CloseIcon />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ConcernBadge level={clause.concernLevel} />
          <span className="text-xs text-muted">Confidence: {clause.confidence}</span>
          {clause.page != null && <span className="text-xs text-muted">Page {clause.page}</span>}
          {clause.section && <span className="text-xs text-muted">Section {clause.section}</span>}
        </div>

        <section className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Original text</h3>
          <blockquote className="mt-1.5 border-l-2 border-gold pl-3 text-sm italic text-ink">
            &ldquo;{clause.originalText}&rdquo;
          </blockquote>
        </section>

        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Plain-English meaning</h3>
          <p className="mt-1.5 text-sm text-ink">{clause.plainEnglish}</p>
        </section>

        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Why it matters</h3>
          <p className="mt-1.5 text-sm text-ink">{clause.whyItMatters}</p>
        </section>

        <section className="mt-4 rounded-md bg-surface-secondary/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Recommended question for professional review
          </h3>
          <p className="mt-1.5 text-sm font-medium text-ink">{clause.recommendedQuestion}</p>
        </section>
      </div>
    </div>
  );
}
