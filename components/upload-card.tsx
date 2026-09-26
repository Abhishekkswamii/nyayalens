"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon, CloseIcon } from "@/components/icons";
import { useDocumentSession } from "@/lib/client/session-context";
import { analyzeDocument, validateClientFile } from "@/lib/client/analyze-client";

const PIPELINE_STEPS = [
  "Reading document",
  "Understanding structure",
  "Extracting clauses",
  "Mapping obligations",
  "Reviewing potential concerns",
  "Preparing your summary",
];

export function UploadCard() {
  const router = useRouter();
  const { setAnalysis, loadDemo } = useDocumentSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const pickFile = useCallback((candidate: File) => {
    const validationError = validateClientFile(candidate);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(candidate);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) pickFile(dropped);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setStatus("loading");
    setError(null);

    const interval = setInterval(() => {
      setStepIndex((i) => (i < PIPELINE_STEPS.length - 1 ? i + 1 : i));
    }, 1400);

    try {
      const { analysis, doc } = await analyzeDocument(file);
      setAnalysis(analysis, doc);
      router.push("/analyze");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      clearInterval(interval);
      setStepIndex(0);
    }
  };

  const tryDemo = () => {
    loadDemo();
    router.push("/analyze");
  };

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-card border border-border bg-surface p-8 text-center shadow-card"
      >
        <p className="font-serif text-xl text-ink">Analyzing your document…</p>
        <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left">
          {PIPELINE_STEPS.map((step, i) => (
            <li
              key={step}
              className={`flex items-center gap-2 text-sm transition-colors ${
                i <= stepIndex ? "text-ink" : "text-muted/50"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${i <= stepIndex ? "bg-gold-dark" : "bg-border"}`}
              />
              {step}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`rounded-card border-2 border-dashed p-8 text-center transition-colors ${
          dragActive ? "border-gold-dark bg-gold/5" : "border-border"
        }`}
      >
        <UploadIcon className="mx-auto h-8 w-8 text-gold-dark" />
        <p className="mt-3 font-medium text-ink">Drag and drop a PDF here</p>
        <p className="mt-1 text-sm text-muted">or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="focus-ring mt-3 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          aria-label="Upload a PDF document"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) pickFile(selected);
          }}
        />
        <p className="mt-3 text-xs text-muted">PDF only, up to 4 MB.</p>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-risk-high">
          {error}
        </p>
      )}

      {file && !error && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-surface-secondary/50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="focus-ring rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
            aria-label="Remove selected file"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!file}
          onClick={startAnalysis}
          className="focus-ring flex-1 rounded-md bg-gold-dark px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze document
        </button>
        <button
          type="button"
          onClick={tryDemo}
          className="focus-ring flex-1 rounded-md border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-secondary"
        >
          Try the demo
        </button>
      </div>

      <p className="mt-4 text-xs text-muted">
        Your document is processed securely for this analysis. Do not upload material you are not
        authorized to process.
      </p>
    </div>
  );
}
