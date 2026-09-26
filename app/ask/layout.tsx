"use client";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/empty-state";
import { SparkleIcon } from "@/components/icons";
import { useDocumentSession } from "@/lib/client/session-context";

export default function AskLayout({ children }: { children: React.ReactNode }) {
  const { analysis } = useDocumentSession();

  return (
    <AppShell>
      {analysis ? (
        children
      ) : (
        <EmptyState
          icon={SparkleIcon}
          title="No document loaded"
          body="Upload a legal document, or try the demo, before asking questions about it."
          actionLabel="Go to upload"
          actionHref="/"
        />
      )}
    </AppShell>
  );
}
