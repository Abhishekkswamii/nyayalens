"use client";

import { useDocumentSession } from "@/lib/client/session-context";
import { AskAiPanel } from "@/components/ask-ai-panel";

export default function AskPage() {
  const { analysis } = useDocumentSession();
  if (!analysis) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Ask AI</h1>
        <p className="mt-1 text-sm text-muted">
          Ask a question about {analysis.fileName} and get an evidence-backed answer.
        </p>
      </div>
      <AskAiPanel />
    </div>
  );
}
