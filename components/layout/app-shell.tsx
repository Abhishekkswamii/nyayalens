"use client";

import { useState } from "react";
import { SidebarNav } from "@/components/layout/sidebar";
import { DisclaimerBar } from "@/components/disclaimer-bar";
import { DocumentTopBar } from "@/components/layout/document-top-bar";
import { CloseIcon } from "@/components/icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface px-4 py-6 lg:block">
          <SidebarNav />
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-ink/30"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative flex w-72 flex-col bg-surface px-4 py-6 shadow-card">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="focus-ring absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-surface-secondary"
              >
                <CloseIcon />
                <span className="sr-only">Close navigation</span>
              </button>
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <DocumentTopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <DisclaimerBar />
        </div>
      </div>
    </div>
  );
}
