"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { DocumentAnalysis } from "@/lib/types";
import { DEMO_ANALYSIS } from "@/lib/demo/sample-data";

export interface UploadedDocRef {
  uri: string;
  mimeType: string;
}

interface SessionState {
  analysis: DocumentAnalysis | null;
  doc: UploadedDocRef | null;
  compareA: { name: string } | null;
}

interface DocumentSessionValue extends SessionState {
  setAnalysis: (analysis: DocumentAnalysis, doc: UploadedDocRef | null) => void;
  loadDemo: () => void;
  clear: () => void;
}

const STORAGE_KEY = "nyayalens.session.v1";

const DocumentSessionContext = createContext<DocumentSessionValue | null>(null);

export function DocumentSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ analysis: null, doc: null, compareA: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionState;
        setState(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be unavailable (private browsing); non-fatal
    }
  }, [state, hydrated]);

  const setAnalysis = useCallback((analysis: DocumentAnalysis, doc: UploadedDocRef | null) => {
    setState({ analysis, doc, compareA: null });
  }, []);

  const loadDemo = useCallback(() => {
    setState({ analysis: DEMO_ANALYSIS, doc: null, compareA: null });
  }, []);

  const clear = useCallback(() => {
    setState({ analysis: null, doc: null, compareA: null });
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // non-fatal
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, setAnalysis, loadDemo, clear }),
    [state, setAnalysis, loadDemo, clear],
  );

  return <DocumentSessionContext.Provider value={value}>{children}</DocumentSessionContext.Provider>;
}

export function useDocumentSession(): DocumentSessionValue {
  const ctx = useContext(DocumentSessionContext);
  if (!ctx) {
    throw new Error("useDocumentSession must be used within DocumentSessionProvider");
  }
  return ctx;
}
