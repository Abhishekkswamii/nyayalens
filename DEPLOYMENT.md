# Deployment (Vercel)

NyayaLens is a standard Next.js App Router project with no persistent filesystem dependency, so it deploys to Vercel without special configuration.

## Prerequisites

- A Vercel account with access to create a new project.
- Either a Gemini API key (https://aistudio.google.com/apikey) **or** a Google Cloud project with Vertex AI enabled and a service account with the `roles/aiplatform.user` role.

## Steps

1. Push this repository to GitHub (single `main` branch — see below).
2. In Vercel, **New Project → Import** the GitHub repository.
3. Framework preset: Vercel auto-detects **Next.js** — no changes needed to build/output settings.
4. Add environment variables under **Project Settings → Environment Variables** — set **one** of the two backends:
   - **Direct Gemini API (simplest for Vercel):** `GEMINI_API_KEY` (mark as a secret; do not prefix with `NEXT_PUBLIC_`).
   - **Vertex AI:** `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` (e.g. `us-central1`), and credentials — see the note below, since Vercel has no persistent filesystem for a service-account key file.
   - Either way: `GEMINI_MODEL` — optional; verify the model name is actually available for whichever backend you chose (model availability differs between the two — see the README's Limitations section).
5. Deploy. Vercel builds with `npm run build` and serves the API routes (`/api/analyze`, `/api/ask`, `/api/compare`) as serverless functions automatically — no code changes are required for the serverless environment.

> **Vertex AI credentials on Vercel:** `@google/genai`'s Vertex AI mode authenticates via Google's Application Default Credentials, which normally expect a service-account JSON key **file** path in `GOOGLE_APPLICATION_CREDENTIALS`. Vercel's serverless functions have no persistent filesystem to hold that file across deploys, so using Vertex AI here needs either a startup step that writes a `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var out to a temp file before the Google Auth library reads it, or your platform's workload-identity integration if one is available. The direct Gemini API key path needs no such workaround and is the simpler choice for a Vercel deployment.

## Verifying after deploy

- Visit the deployed URL and confirm **Try the demo** works immediately (it requires no API key).
- Upload a small real PDF and confirm live analysis works (requires one of the two backends above to be configured).
- Confirm no `NEXT_PUBLIC_`-prefixed secret ever appears in browser dev tools → Network / Sources.

## If you don't have deployment credentials available

This repository is fully deployment-ready without any further code changes. To confirm it locally instead of on Vercel:

```bash
npm install
npm run build
npm start
```

Then open http://localhost:3000. The production build and server behave identically to what Vercel would run; only the hosting step differs.

## Notes for a serverless environment

- No local/persistent filesystem is used anywhere in the request path — uploaded files are held in memory only for the duration of a single request, then either uploaded to Gemini's Files API (direct API) or sent inline (Vertex AI).
- API routes declare `export const runtime = "nodejs"` (the Gemini SDK requires the Node.js runtime, not the Edge runtime) and a `maxDuration` appropriate to document-analysis latency.
- The in-memory rate limiter (`lib/security/rate-limit.ts`) is per-instance. On Vercel this means limits are enforced per warm serverless instance, not globally across all instances — acceptable for this submission's scope, called out explicitly in the README's Limitations section.
- There is deliberately **no** server-side, in-memory session store for the document reference between `/api/analyze` and `/api/ask`/`/api/compare` — an earlier version of this app had one, and it silently failed on Vercel because separate API routes can run as separate serverless function instances with no shared memory. The validated document reference is instead round-tripped through the client (`sessionStorage`) and re-validated on every request server-side.
