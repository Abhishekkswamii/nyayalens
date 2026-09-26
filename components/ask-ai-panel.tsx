"use client";

import { useState } from "react";
import { SparkleIcon } from "@/components/icons";
import { EvidenceDrawer } from "@/components/evidence-drawer";
import { useDocumentSession } from "@/lib/client/session-context";
import { askQuestion } from "@/lib/client/ask-client";
import type { QuestionAnswer } from "@/lib/types";

export function AskAiPanel({ compact = false }: { compact?: boolean }) {
  const { analysis, doc } = useDocumentSession();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  if (!analysis) return null;

  const submit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setQuestion(trimmed);
    try {
      const result = await askQuestion({ question: trimmed, isDemo: analysis.isDemo, doc });
      setAnswer(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
        <SparkleIcon className="text-gold-dark" /> Ask AI about this document
      </h2>
      <p className="mt-1 text-sm text-muted">Get answers with evidence from your document.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="mt-4 flex gap-2"
      >
        <label className="sr-only" htmlFor="ask-ai-input">
          Ask about this document
        </label>
        <input
          id="ask-ai-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this document…"
          className="focus-ring flex-1 rounded-md border border-border bg-surface px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-label="Send question"
          className="focus-ring rounded-md bg-gold-dark px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-risk-high">
          {error}
        </p>
      )}

      {loading && (
        <p role="status" aria-live="polite" className="mt-4 text-sm text-muted">
          Thinking through your document…
        </p>
      )}

      {answer && !loading && (
        <div className="mt-4 space-y-3 rounded-md border border-border bg-surface-secondary/50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Answer</p>
            <p className="mt-1 text-sm text-ink">{answer.answer}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">What the document says</p>
            <p className="mt-1 text-sm text-ink">{answer.whatDocumentSays}</p>
          </div>
          {answer.uncertainty && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">What is uncertain</p>
              <p className="mt-1 text-sm text-ink">{answer.uncertainty}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs text-muted">
              Confidence: <span className="font-medium text-ink">{answer.confidence}</span>{" "}
              {!answer.grounded && "· Not strongly grounded in the document"}
            </span>
            <button
              type="button"
              onClick={() => setEvidenceOpen(true)}
              className="focus-ring rounded-md border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-surface"
            >
              View evidence →
            </button>
          </div>
          {answer.suggestedNextQuestion && (
            <button
              type="button"
              disabled={loading}
              onClick={() => submit(answer.suggestedNextQuestion!)}
              className="focus-ring block w-full rounded-md border border-dashed border-border px-3 py-2 text-left text-xs text-gold-dark hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suggested next question: {answer.suggestedNextQuestion}
            </button>
          )}
        </div>
      )}

      {!compact && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suggested questions</p>
          <ul className="mt-2 space-y-1.5">
            {analysis.suggestedQuestions.map((sq) => (
              <li key={sq.id}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => submit(sq.question)}
                  className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sq.question} <span aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <EvidenceDrawer
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        title={answer?.question ?? "Evidence"}
        evidence={answer?.evidence ?? []}
      />
    </div>
  );
}
