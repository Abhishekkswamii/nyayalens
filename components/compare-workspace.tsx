"use client";

import { useState } from "react";
import { CompareIcon, UploadIcon } from "@/components/icons";
import { EmptyState } from "@/components/empty-state";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import { compareDocuments } from "@/lib/client/compare-client";
import { validateClientFile } from "@/lib/client/analyze-client";
import { DEMO_COMPARISON } from "@/lib/demo/sample-data";
import type { ComparisonResult, EvidenceCitation } from "@/lib/types";

function FilePicker({
  label,
  file,
  onPick,
}: {
  label: string;
  file: File | null;
  onPick: (file: File) => void;
}) {
  return (
    <label className="flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-border bg-surface px-4 py-8 text-center hover:border-gold-dark">
      <UploadIcon className="h-6 w-6 text-gold-dark" />
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="max-w-full truncate text-xs text-muted">{file ? file.name : "PDF, up to 15 MB"}</span>
      <input
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onPick(selected);
        }}
      />
    </label>
  );
}

export function CompareWorkspace() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [evidence, setEvidence] = useState<EvidenceCitation | null>(null);

  const canCompare = fileA && fileB;

  const runCompare = async () => {
    if (!fileA || !fileB) return;
    const errA = validateClientFile(fileA);
    const errB = validateClientFile(fileB);
    if (errA || errB) {
      setError(errA ?? errB);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const comparison = await compareDocuments(fileA, fileB);
      setResult(comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Compare</h1>
        <p className="mt-1 text-sm text-muted">
          Upload two documents to see factual differences, side by side. NyayaLens does not rank the
          documents or decide which is &ldquo;better&rdquo;.
        </p>
      </div>

      {!result && (
        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row">
            <FilePicker label="Document A" file={fileA} onPick={setFileA} />
            <FilePicker label="Document B" file={fileB} onPick={setFileB} />
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-risk-high">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!canCompare || loading}
              onClick={runCompare}
              className="focus-ring flex-1 rounded-md bg-gold-dark px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Comparing…" : "Compare documents"}
            </button>
            <button
              type="button"
              onClick={() => setResult(DEMO_COMPARISON)}
              className="focus-ring flex-1 rounded-md border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-secondary"
            >
              Try demo comparison
            </button>
          </div>
        </div>
      )}

      {loading && (
        <p role="status" aria-live="polite" className="text-sm text-muted">
          Reading both documents and comparing key dimensions…
        </p>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {result.documentAName} <span aria-hidden="true">vs.</span> {result.documentBName}
            </p>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setFileA(null);
                setFileB(null);
              }}
              className="focus-ring rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-secondary"
            >
              Compare different documents
            </button>
          </div>

          <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">Dimension</th>
                  <th scope="col" className="px-4 py-3 font-medium">Document A</th>
                  <th scope="col" className="px-4 py-3 font-medium">Document B</th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Evidence</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.dimension} className="border-b border-border last:border-0 hover:bg-surface-secondary/40">
                    <td className="px-4 py-3 font-medium text-ink">
                      {row.dimension} {row.differs && <span className="ml-1 text-gold-dark">●</span>}
                    </td>
                    <td className="px-4 py-3 text-ink">{row.documentA}</td>
                    <td className="px-4 py-3 text-ink">{row.documentB}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEvidence(row.evidenceA)}
                        className="focus-ring text-xs font-medium text-gold-dark underline"
                      >
                        Evidence →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
              <CompareIcon className="text-gold-dark" /> Material differences
            </h2>
            {result.materialDifferences.length === 0 ? (
              <EmptyState
                icon={CompareIcon}
                title="No material differences found"
                body="The documents appear consistent across the compared dimensions."
              />
            ) : (
              <ul className="mt-3 space-y-3">
                {result.materialDifferences.map((diff) => (
                  <li key={diff.dimension} className="rounded-card border border-border bg-surface p-4 shadow-card">
                    <p className="text-sm font-semibold text-ink">{diff.dimension}</p>
                    <p className="mt-1 text-sm text-muted">{diff.whatChanged}</p>
                    <p className="mt-1 text-xs text-gold-dark">{diff.whyItMayMatter}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <EvidenceDrawer
        open={evidence !== null}
        onClose={() => setEvidence(null)}
        title="Comparison evidence"
        evidence={evidence ?? { page: null, section: null, quote: null, available: false }}
      />
    </div>
  );
}
