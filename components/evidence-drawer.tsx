"use client";

import { useEffect, useRef } from "react";
import { CloseIcon, EvidenceIcon } from "@/components/icons";
import type { EvidenceCitation } from "@/lib/types";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  evidence: EvidenceCitation | EvidenceCitation[];
}

export function EvidenceDrawer({ open, onClose, title, evidence }: EvidenceDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const items = Array.isArray(evidence) ? evidence : [evidence];

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close evidence panel"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="evidence-drawer-title" className="flex items-center gap-2 font-serif text-lg text-ink">
            <EvidenceIcon className="text-gold-dark" /> Evidence
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="focus-ring rounded-md p-1.5 text-muted hover:bg-surface-secondary hover:text-ink"
          >
            <CloseIcon />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-sm text-muted">{title}</p>
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="rounded-card border border-border bg-surface-secondary/40 p-4">
                {item.available ? (
                  <>
                    <div className="mb-2 flex flex-wrap gap-3 text-xs font-medium text-muted">
                      {item.page != null && <span>Page {item.page}</span>}
                      {item.section && <span>Section {item.section}</span>}
                    </div>
                    {item.quote && (
                      <blockquote className="border-l-2 border-gold pl-3 text-sm italic text-ink">
                        &ldquo;{item.quote}&rdquo;
                      </blockquote>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted">Evidence unavailable for this item.</p>
                )}
              </li>
            ))}
            {items.length === 0 && <p className="text-sm text-muted">Evidence unavailable.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
