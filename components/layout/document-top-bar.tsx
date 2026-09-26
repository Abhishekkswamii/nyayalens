"use client";

import { useEffect, useState } from "react";
import { useDocumentSession } from "@/lib/client/session-context";
import { DocumentIcon, ShieldIcon } from "@/components/icons";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function DocumentTopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { analysis } = useDocumentSession();
  const [jurisdiction, setJurisdiction] = useState("India");

  useEffect(() => {
    const saved = window.localStorage.getItem("nyayalens.jurisdiction");
    if (saved) setJurisdiction(saved);
  }, []);

  const handleJurisdictionChange = (value: string) => {
    setJurisdiction(value);
    window.localStorage.setItem("nyayalens.jurisdiction", value);
  };

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="focus-ring rounded-md border border-border p-2 text-ink lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="hidden shrink-0 rounded-md bg-surface-secondary p-2 sm:block">
          <DocumentIcon className="text-gold-dark" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold text-ink">
            {analysis?.fileName ?? "No document loaded"}
          </p>
          <p className="truncate text-xs text-muted">
            {analysis ? (
              <>
                {analysis.isDemo ? "Demo data" : "Uploaded just now"} · {analysis.pageCount} pages ·{" "}
                {formatBytes(analysis.fileSizeBytes)}
              </>
            ) : (
              "Upload a document from the home page to begin."
            )}
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <span className="sr-only">Jurisdiction</span>
        <select
          value={jurisdiction}
          onChange={(e) => handleJurisdictionChange(e.target.value)}
          className="focus-ring rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm"
        >
          <option>India</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>European Union</option>
          <option>Other</option>
        </select>
      </label>

      <div className="hidden items-center gap-1.5 rounded-full border border-risk-low/30 bg-risk-low/10 px-3 py-1.5 text-xs font-medium text-risk-low sm:flex">
        <ShieldIcon className="h-4 w-4" />
        Your document is private
      </div>
    </header>
  );
}
