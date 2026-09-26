"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/empty-state";
import { DocumentIcon } from "@/components/icons";
import { useDocumentSession } from "@/lib/client/session-context";

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  const { analysis } = useDocumentSession();

  return (
    <AppShell>
      {analysis ? (
        children
      ) : (
        <EmptyState
          icon={DocumentIcon}
          title="No document loaded"
          body="Upload a legal document, or try the demo, to begin an analysis."
          actionLabel="Go to upload"
          actionHref="/"
        />
      )}
    </AppShell>
  );
}
