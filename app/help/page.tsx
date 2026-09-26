const FAQ = [
  {
    q: "Is this legal advice?",
    a: "No. NyayaLens provides informational assistance to help you understand a document and prepare questions. It is not a substitute for a qualified lawyer.",
  },
  {
    q: "How accurate is the analysis?",
    a: "The AI extracts information directly from your document and cites evidence (page, section, quote) wherever possible. Always verify important clauses against the original document, and treat concern levels as prioritization, not a legal ruling.",
  },
  {
    q: "What happens if the AI can't find something?",
    a: "It will say so directly — for example, 'the uploaded document does not provide enough information to determine this' — rather than guessing.",
  },
  {
    q: "What file types are supported?",
    a: "PDF only, up to 4 MB, in this version (a Vercel platform limit on upload size — see the README for details).",
  },
  {
    q: "Can I try it without an API key configured?",
    a: "Yes — use \"Try the demo\" on the home page, which uses a small synthetic sample agreement clearly labeled as demo data.",
  },
];

export const metadata = { title: "Help & FAQ" };

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Help & FAQ</h1>
        <p className="mt-1 text-sm text-muted">How to use NyayaLens, and its limitations.</p>
      </div>

      <section>
        <h2 className="font-serif text-lg font-semibold text-ink">Frequently asked questions</h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-card border border-border bg-surface p-5 shadow-card">
              <dt className="font-semibold text-ink">{item.q}</dt>
              <dd className="mt-1.5 text-sm text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="limitations" className="scroll-mt-20 rounded-card border border-gold/30 bg-gold/10 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">Responsible use & limitations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
          <li>NyayaLens is an informational tool, not a lawyer, and does not provide legal advice.</li>
          <li>It never claims certainty about legality, enforceability, or the outcome of a dispute.</li>
          <li>It analyzes only the document you provide — it does not consult external legal databases or case law.</li>
          <li>AI-generated summaries can miss nuance. Always read the original document and consult a qualified professional for decisions that matter.</li>
          <li>Uploaded documents are treated as untrusted data — any instructions embedded in a document&apos;s text are ignored, not followed.</li>
        </ul>
      </section>
    </div>
  );
}
