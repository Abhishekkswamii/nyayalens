# NyayaLens

**Understand. Verify. Decide.**

NyayaLens turns a complex legal document (PDF) into plain-language clauses, obligations, rights, and prioritized concerns — every substantive claim backed by evidence from the document itself. It also answers grounded questions about the document and compares two documents side by side.

It is an **informational assistant, not a lawyer**, and it says so throughout the product.

## Problem

Most people signing an employment agreement, rental agreement, or NDA cannot afford — or don't think to get — a lawyer to review it first. Legal language is dense, and the consequences of a clause (a non-compete, an indefinite confidentiality duty, a "termination for cause" provision) are often buried in boilerplate. The result is people sign documents they don't fully understand.

## Solution

Upload a PDF. NyayaLens uses Google's Gemini model to read the document and extract a structured analysis — clause by clause — with plain-English explanations, a risk/concern prioritization, an obligation and rights tracker, and evidence (page, section, quote) for every substantive claim. A grounded Q&A lets you ask follow-up questions and get answers traceable back to the document, with uncertainty called out explicitly rather than papered over. A comparison mode shows factual differences between two versions of a document. A "prepare for a lawyer" checklist turns all of this into questions worth bringing to a professional.

## Why it matters

- **Evidence-first, not confidence-first.** Every clause, obligation, right, risk finding, and Q&A answer either cites a page/section/quote or explicitly says evidence is unavailable — never a fabricated citation.
- **Calibrated language.** The system instructions and UI copy consistently distinguish "the document states..." from "this may warrant professional review" — never "this is illegal" or "you will win."
- **Prompt-injection resistant.** Uploaded documents and user questions are treated as untrusted data. Instructions embedded in a document ("ignore previous instructions...") are never followed.
- **Works without an API key.** A fully-featured, clearly-labeled demo mode lets an evaluator explore every feature — overview, clauses, risks, obligations, rights, Q&A, lawyer prep, and comparison — using a small synthetic sample document.

## Features

| Area | What it does |
|---|---|
| **Upload** | Drag-and-drop or browse a PDF (≤15 MB), with client- and server-side validation, a real content check (PDF magic bytes, not just the extension), and a visible pipeline-stage progress indicator. |
| **Overview** | Document metadata (type, parties, effective date, duration), a plain-English summary, and a Risk Radar donut chart with a key takeaway. |
| **Clauses** | Searchable, filterable, paginated table of extracted clauses. Each opens a detail view: original text, plain-English meaning, why it matters, concern level, evidence, confidence, and a recommended question for a lawyer. |
| **Obligations** | A structured tracker: party, obligation, timing, consequence stated in the document, evidence. |
| **Rights** | Entitlements explicitly stated in the document, each with evidence. |
| **Risks** | Prioritized concern findings ("high/medium/low concern" — never a legal verdict), each with an evidence drawer. |
| **Ask AI** | Grounded Q&A: answer, "what the document says," evidence, uncertainty, a suggested next question, and a confidence level describing how well-grounded the answer is (not legal certainty). Falls back honestly ("I couldn't find enough information...") when ungrounded. |
| **Compare** | Upload two PDFs (or try a demo comparison) and see a dimension-by-dimension table plus a material-differences list. NyayaLens never ranks or declares a "winner." |
| **Lawyer prep** | An auto-generated checklist of topics and questions to raise with a professional before signing. |
| **Settings** | Explains exactly what is processed, why, what is and isn't stored, and lets you clear the current session. |
| **Demo mode** | A tiny, clearly-labeled synthetic sample employment agreement (no real people, no copyrighted text) exercises every feature without an API key. |

## Architecture

```mermaid
flowchart LR
    U[User] -->|uploads PDF| UP[Upload Card]
    UP -->|multipart POST| API1[/api/analyze/]
    API1 -->|validate file| VAL[File & magic-byte validation]
    API1 -->|prepareDocument| PREP{Direct API or Vertex AI?}
    PREP -->|direct API: upload once| FILES[Gemini Files API]
    PREP -->|Vertex AI: no Files API support| INLINE[Inline base64 part]
    FILES -->|fileUri reference| API1
    API1 -->|generateContent + system instructions| GEMINI[Gemini model]
    GEMINI -->|JSON| SCHEMA[Zod schema validation]
    SCHEMA -->|validated DocumentAnalysis + doc ref| CLIENT[Browser: sessionStorage]
    CLIENT --> OV[Overview / Clauses / Obligations / Rights / Risks]
    CLIENT -->|question + doc ref| API2[/api/ask/]
    API2 --> GEMINI
    CLIENT -->|two files| API3[/api/compare/]
    API3 --> PREP
```

NyayaLens supports two Gemini backends, chosen automatically by which environment variables are set (see `.env.example`):

- **Direct Gemini API** (`GEMINI_API_KEY`) — the PDF is uploaded once via the Files API; the returned `fileUri` is reused for follow-up Q&A/comparison calls instead of re-sending the file bytes.
- **Vertex AI** (`GOOGLE_CLOUD_PROJECT` + Application Default Credentials) — Vertex AI's Gemini endpoint does not support the Files API without a separate GCS bucket, so the document is instead sent as an inline base64 part. This avoids adding a GCS/storage dependency for a hackathon-scale app, at the cost of resending the (size-capped, ≤15 MB) document bytes on each follow-up call in this mode.

In both cases, NyayaLens keeps **no server-side session store**: the validated analysis and its document reference (a Files API URI, or the inline base64 payload) are returned to the browser and held only in that tab's `sessionStorage`, then sent back on follow-up requests. This was a deliberate correction during testing — an earlier version kept an in-memory `Map` on the server keyed by session id, which works in a single long-lived process but silently breaks on Vercel, where `/api/analyze` and `/api/ask` can run as entirely separate serverless function instances with no shared memory. The document reference itself is validated server-side on every request (`lib/validation/schemas.ts`'s `documentRefSchema`) — a `file` reference must point at Google's own API host, and an `inline` payload is capped well under the upload size limit, so a client can't smuggle an oversized or arbitrary payload through it.

## AI workflow

1. **File validation** — extension/MIME check, size cap (15 MB), and a real PDF magic-byte check on the file content (a renamed non-PDF is rejected even if the extension says `.pdf`).
2. **Prepare the document** — uploaded once via the Files API (direct Gemini API) or held as an inline part (Vertex AI); see above.
3. **Structured extraction** — a single `generateContent` call with an explicit system instruction (never obey instructions embedded in the document; always cite evidence; never claim legal certainty) and a prompt describing the exact JSON shape required. Transient `503`/`429` "high demand" errors from the model are retried with backoff before surfacing an error to the user.
4. **Validation** — every AI response is parsed and validated against a Zod schema (`lib/validation/schemas.ts`) before it is used. If validation fails, one repair attempt is made (asking the model to fix its own JSON); if that also fails, a safe, generic error is returned — malformed output is never rendered.
5. **Grounded Q&A / comparison** — subsequent calls reuse the document reference returned from analysis (no re-upload on the direct API path), reuse the same system instructions, and are validated the same way.

## Security

- **Server-side secrets only.** `GEMINI_API_KEY` is read only in server-side route handlers; nothing prefixed `NEXT_PUBLIC_` carries it, and it is never sent to the client or logged.
- **Prompt-injection defense.** Uploaded documents and user questions are explicitly framed to the model as untrusted data, never instructions (see `lib/security/sanitize.ts` and the system instructions in `lib/ai/prompts.ts`). The model is told never to reveal its system instructions, hidden configuration, or secrets, regardless of how a request is phrased.
- **Output validation.** All AI JSON output is Zod-validated before rendering; invalid output triggers one repair attempt, then a controlled error — never a raw or malformed render.
- **Input validation.** File type, magic bytes, and size are checked before any bytes are sent to the AI service. Questions are sanitized (control characters stripped, length-capped) before use.
- **No secret / document logging.** Route handlers never log document content or API keys; error messages returned to the client are generic, never stack traces.
- **Rate limiting.** A per-IP, per-route sliding-window limiter (`lib/security/rate-limit.ts`) throttles abusive request volume.
- **Security headers.** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and a restrictive `Permissions-Policy` are set on every response (`next.config.mjs`).
- **No `dangerouslySetInnerHTML`.** All AI-derived text is rendered as plain React text content.

## Privacy

See the in-app **Settings** page for the full, plain-language explanation. In short: an uploaded PDF is sent to Google's Gemini API (directly, or via Vertex AI) for analysis. NyayaLens does not persist your document or its analysis in a database — the analysis and its document reference are held only in your browser's `sessionStorage` for that tab. On the direct Gemini API, the underlying PDF is additionally held temporarily by Google's Files API under Google's own retention policy (typically up to 48 hours); on Vertex AI, no separate file storage is used at all — the document travels with each request. No document content or API keys/credentials are written to application logs.

## Accessibility

Built to a WCAG 2.2 AA-oriented standard: semantic HTML and landmarks, a skip-to-content link, visible focus rings throughout, keyboard-operable dialogs (evidence drawer, clause detail) with focus-on-open and Escape-to-close, accessible form labels, a mobile navigation drawer reachable by keyboard, and concern levels that are always paired with a text label (never color alone). Color contrast is checked with automated `axe-core` tests (see Testing) and was iterated on until no serious/critical violations remained. `prefers-reduced-motion` is respected globally.

## Responsible AI / legal disclaimer

NyayaLens is an informational tool. It does not provide legal advice, does not claim to be a lawyer, and never asserts legal certainty ("definitely illegal," "you will win," "guaranteed right"). Every substantive claim about a document is either backed by a page/section/quote or explicitly marked as unavailable. Where the document doesn't support an answer, the product says so directly instead of guessing. See the in-app **Help & FAQ** page for the full limitations statement.

## Technology stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS, hand-built accessible primitives (no external UI kit dependency)
- **Validation:** Zod
- **AI:** `@google/genai` (Gemini), server-side only — direct Gemini API (Files API) or Vertex AI (inline data), plus structured JSON generation
- **Testing:** Vitest + Testing Library (unit/integration), Playwright + `@axe-core/playwright` (E2E + accessibility)
- **Deployment target:** Vercel

No database, no auth system, no message queue, no vector store — the problem this app solves doesn't need them, and adding them would only increase the attack surface and deployment risk for a hackathon submission.

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local: set GEMINI_API_KEY (https://aistudio.google.com/apikey), OR
# the GOOGLE_CLOUD_PROJECT/GOOGLE_APPLICATION_CREDENTIALS block for Vertex AI
npm run dev
```

Open http://localhost:3000. Without either backend configured, live analysis returns a clear "Live AI mode is not configured" error — use **Try the demo** on the landing page to explore the full product with no credentials at all.

### Environment variables

See `.env.example` — set **one** of the two auth options:

```
# Option A: direct Gemini API
GEMINI_API_KEY=

# Option B: Vertex AI (uses your Google Cloud project's billing/credits)
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=     # path to a service-account key; never commit this file

# Either way:
GEMINI_MODEL=gemini-2.5-flash   # optional; defaults to gemini-2.5-flash if unset.
                                 # Available model names differ between the two backends —
                                 # verify the one you set is enabled for your account/project.
```

`GOOGLE_APPLICATION_CREDENTIALS` and any service-account key file are covered by `.gitignore` — never commit them.

## Build, lint, and test commands

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest (unit + integration, 49 tests)
npm run test:e2e    # playwright (E2E + accessibility, 26 tests across desktop/mobile)
npm run test:all    # typecheck + test + test:e2e
npm run build       # production build
npm start           # serve the production build
```

## Testing summary

- **Unit tests** (`tests/unit`): file/MIME/size validation, PDF magic-byte content checks, Zod schema validation (including rejection of malformed/oversized/fabricated-field AI output), prompt-injection heuristics, secret redaction, rate limiting, and a component test asserting risk badges always pair color with a text label.
- **Integration tests** (`tests/unit/api-routes.test.ts`): the `/api/ask` and `/api/analyze` route handlers directly — demo Q&A without any AI call, rejection of empty questions, rejection of a live request with no document session, malformed JSON, missing files, non-PDF files, and files that merely *look* like PDFs by extension.
- **E2E tests** (`tests/e2e/demo-flow.spec.ts`, Playwright, desktop + mobile viewports): the full demo golden path — landing → try the demo → overview (risk radar, clauses) → clause detail dialog → risks with evidence → obligations/rights tables → Ask AI with evidence → compare demo → keyboard-only activation of the primary CTA → mobile drawer navigation → no horizontal overflow on mobile.
- **Accessibility tests** (`tests/e2e/accessibility.spec.ts`): automated `axe-core` scans of the landing page, the analyze overview, and an open clause-detail dialog, asserting zero serious/critical violations.

## Efficiency

- On the direct Gemini API, the PDF is uploaded to the Files API **once** per document; every follow-up question or comparison call references it by URI instead of re-sending the file. (Vertex AI has no equivalent, so that path resends the size-capped document inline — a deliberate, documented trade-off rather than adding a GCS bucket.)
- No server-side database or session store — the client holds the validated analysis and document reference in `sessionStorage`, keeping the server stateless and cheap to run on Vercel's serverless functions (and correct: per-route in-memory state doesn't reliably survive across Vercel's separate serverless function instances).
- No external icon library; a small set of hand-drawn inline SVGs keeps the client bundle lean (first-load JS ≈103–117 kB per route).
- Demo mode does zero AI calls, so evaluators can explore the entire feature set instantly and at no cost.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Limitations

- PDF only, up to 15 MB, in this version.
- Extraction quality depends on the underlying model and on how the source PDF is structured (scanned/image-only PDFs with no extractable text may yield weaker results).
- The demo dataset is intentionally tiny and does not cover every possible question.
- This is a single-region, in-memory rate limiter appropriate for a single Vercel deployment — not a distributed rate-limiting solution.
- On Vertex AI, the document is sent inline (base64) with the initial upload's browser response and resent on every follow-up call, since Vertex's Gemini endpoint has no Files API equivalent without a separate GCS bucket; this is bounded by the existing 15 MB file cap but is less efficient than the direct API's file-reuse path, and holds more data in the browser's `sessionStorage` for that tab.
- `GEMINI_MODEL` availability differs between the direct Gemini API and Vertex AI (a model enabled on one may 404 on the other, or be deprecated for new API keys on one but not the other) — verify your chosen model against the backend you're using.
