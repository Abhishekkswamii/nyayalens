import Link from "next/link";
import { UploadCard } from "@/components/upload-card";
import { ScaleIcon, DocumentIcon, ObligationIcon, CompareIcon, SparkleIcon } from "@/components/icons";
import { DisclaimerBar } from "@/components/disclaimer-bar";

const CAPABILITIES = [
  { icon: DocumentIcon, title: "Plain-language clauses", body: "Every key clause explained in plain English, with the original text alongside it." },
  { icon: ObligationIcon, title: "Obligations & rights", body: "See exactly what each party must do, and what they're entitled to." },
  { icon: SparkleIcon, title: "Evidence-backed answers", body: "Ask questions and get answers traced to a page, section and quote." },
  { icon: CompareIcon, title: "Compare two documents", body: "See what changed between two versions of an agreement, side by side." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
          <ScaleIcon className="h-6 w-6 text-gold-dark" />
          NyayaLens
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-ink/80">
          <Link href="/help" className="focus-ring rounded hover:text-ink">
            Help & FAQ
          </Link>
          <Link href="/settings" className="focus-ring rounded hover:text-ink">
            Settings
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 py-10 text-center sm:px-8">
        <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark">
          Understand. Verify. Decide.
        </span>
        <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Understand before you sign
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Plain-language insights, key clauses, potential concerns and next questions — powered by AI.
        </p>

        <div className="mt-10 w-full max-w-lg">
          <UploadCard />
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-card border border-border bg-surface p-5 text-left shadow-card">
              <Icon className="h-6 w-6 text-gold-dark" />
              <p className="mt-3 font-serif text-base font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </main>

      <DisclaimerBar />
    </div>
  );
}
