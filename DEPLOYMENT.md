# Deployment (Vercel)

NyayaLens is a standard Next.js App Router project with no persistent filesystem dependency, so it deploys to Vercel without special configuration.

## Prerequisites

- A Vercel account with access to create a new project.
- A Gemini API key from https://aistudio.google.com/apikey.

## Steps

1. Push this repository to GitHub (single `main` branch — see below).
2. In Vercel, **New Project → Import** the GitHub repository.
3. Framework preset: Vercel auto-detects **Next.js** — no changes needed to build/output settings.
4. Add environment variables under **Project Settings → Environment Variables**:
   - `GEMINI_API_KEY` — your Gemini API key (mark as a secret; do not prefix with `NEXT_PUBLIC_`).
   - `GEMINI_MODEL` — optional, e.g. `gemini-2.5-flash`. If omitted, the app defaults to `gemini-2.5-flash`.
5. Deploy. Vercel builds with `npm run build` and serves the API routes (`/api/analyze`, `/api/ask`, `/api/compare`) as serverless functions automatically — no code changes are required for the serverless environment.

## Verifying after deploy

- Visit the deployed URL and confirm **Try the demo** works immediately (it requires no API key).
- Upload a small real PDF and confirm live analysis works (requires `GEMINI_API_KEY` to be set).
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

- No local/persistent filesystem is used anywhere in the request path — uploaded files are held in memory only for the duration of a single request and forwarded to Gemini's Files API.
- API routes declare `export const runtime = "nodejs"` (the Gemini SDK requires the Node.js runtime, not the Edge runtime) and a `maxDuration` appropriate to document-analysis latency.
- The in-memory rate limiter (`lib/security/rate-limit.ts`) is per-instance. On Vercel this means limits are enforced per warm serverless instance, not globally across all instances — acceptable for this submission's scope, called out explicitly in the README's Limitations section.
