"use client";

import { useRouter } from "next/navigation";
import { useDocumentSession } from "@/lib/client/session-context";
import { ShieldIcon } from "@/components/icons";

export default function SettingsPage() {
  const { analysis, clear } = useDocumentSession();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage privacy and session data.</p>
      </div>

      <section className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
          <ShieldIcon className="text-gold-dark" /> Privacy
        </h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-ink">What is processed</dt>
            <dd className="mt-1 text-muted">
              An uploaded PDF is sent to Google&apos;s Gemini API for document understanding and analysis.
              Extracted analysis (clauses, obligations, summary, etc.) is returned to your browser.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Why it is processed</dt>
            <dd className="mt-1 text-muted">
              Processing is required to generate the summary, clause extraction, risk findings and
              answers you see in the app.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">What this app stores</dt>
            <dd className="mt-1 text-muted">
              NyayaLens itself does not persist your document or analysis in a database — the analysis
              is kept only in your browser&apos;s session storage for this browser tab. The uploaded PDF is
              held temporarily by Google&apos;s Gemini Files API (subject to Google&apos;s own retention policy,
              typically up to 48 hours) so follow-up questions can reference it without re-uploading.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">What it does not store</dt>
            <dd className="mt-1 text-muted">
              No document content is written to application logs. No account or persistent user profile
              is created.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Handling sensitive files</dt>
            <dd className="mt-1 text-muted">
              Only upload documents you are authorized to process. Avoid uploading documents containing
              other people&apos;s sensitive personal data unless you have the right to do so.
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="font-serif text-lg font-semibold text-ink">Session data</h2>
        <p className="mt-2 text-sm text-muted">
          {analysis ? `Currently loaded: ${analysis.fileName}` : "No document currently loaded."}
        </p>
        <button
          type="button"
          disabled={!analysis}
          onClick={() => {
            clear();
            router.push("/");
          }}
          className="focus-ring mt-4 rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear this session
        </button>
      </section>
    </div>
  );
}
