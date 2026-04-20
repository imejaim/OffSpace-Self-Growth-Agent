# Local-First Development Workflow

Updated: 2026-04-14
Status: stable

## Purpose

Intercept deploys to Cloudflare Workers via OpenNext. Every HTTP hit on the
deployed site — HTML, API route, internal fetch, OAuth redirect — consumes the
Workers daily request quota. Using the deployed site as the primary dev surface
burns that quota even with zero real users.

This page is the durable rule for how the Holonomic Brain develops on this
repo: **build and verify on localhost first, deploy only when a change is
confirmed to work**.

## The Rule

- `npm run dev` on `http://localhost:3000` is the default development surface.
- Login, intercept generation, payment stubs, and feed must all be usable on
  localhost without touching the deployed Worker.
- Deployment (`npm run deploy`) is performed only after a change has been
  verified locally.
- `wrangler dev` / `npm run preview` are optional edge-parity checks; they
  still count against Worker quotas and must not replace local dev as the
  daily workflow.

## Why It Matters

Observed incident (2026-04-14): Cloudflare reported the daily request limit
exceeded on `interceptnews.app` with no real traffic. Root cause was a mix of:

- repeated developer navigation against the deployed site instead of
  localhost
- `workers_dev = true` leaving the `*.workers.dev` subdomain publicly
  reachable and scrape-prone
- `middleware.ts` running `supabase.auth.getUser()` on every non-static
  request, so each page view fans out into multiple backend hits

None of this is fixable by "being careful." The only durable fix is to stop
using production as the dev surface.

## Required Local Environment

`intercept/.env.local` must contain at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY` — enables the AI Router Gemini fallback path, which is
  what makes intercept generation work locally without a Workers AI binding
- `NEXT_PUBLIC_BASE_URL="http://localhost:3000"`
- `NEXT_PUBLIC_SITE_URL="http://localhost:3000"` — **must** be localhost in
  local dev, otherwise OAuth redirects and share links bounce back to the
  deployed Worker
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (sandbox) for payment UI rendering
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_MODE=sandbox`
- `CRON_SECRET` only if you want to hit `/api/cron/reset-usage` locally

## What Works Locally And What Does Not

| Feature | Local status | Notes |
|--------|--------------|-------|
| Supabase anonymous session | Works | Pure REST, same keys as prod |
| Supabase Google OAuth | Works **after** redirect URL is whitelisted | See below |
| Intercept generation (`/api/intercept`) | Works via Gemini fallback | Workers AI binding only exists in CF runtime; the router falls through to Gemini automatically |
| Rate limit | Works via in-memory fallback | KV binding absent locally; `lib/rate-limit.ts` already handles this |
| Teatime publish / newsletter generate | Works for read; write paths that depend on CF secrets must be tested on staging | |
| PayPal sandbox checkout | Works | Uses `PAYPAL_MODE=sandbox` |
| PortOne (Korea) | Works for UI; webhook must be tunneled | |
| Cloudflare cron triggers | Not available locally | Invoke the route manually with `x-cron-secret` header |

## One-Time Setup For Local OAuth

Supabase blocks OAuth redirects that are not on the allowlist. To make Google
login work on `http://localhost:3000`:

1. Open the Supabase project dashboard.
2. Authentication → URL Configuration → Redirect URLs.
3. Add `http://localhost:3000/auth/callback`.
4. Keep `https://interceptnews.app/auth/callback` in the same list so prod
   still works.

No code change is required — `LoginButton.tsx` already uses
`window.location.origin + '/auth/callback'`.

## Cloudflare Hygiene (Prod Side)

These are production settings the Holonomic Brain must maintain alongside the
local-first rule:

- `wrangler.toml` should set `workers_dev = false`. Leaving the
  `*.workers.dev` subdomain on exposes a second public entrypoint that
  can be crawled and counted against quota.
- Keep `interceptnews.app` / `www.interceptnews.app` as the only custom
  domain routes.
- Prefer deploying only after `npm run dev` verification, not during
  active design iteration.

## Development Protocol

1. Pull latest, `cd intercept`, `npm install` if lockfile changed.
2. `npm run dev` → open `http://localhost:3000/teatime`.
3. Exercise the feature: login, intercept, navigation, payment sandbox.
4. Check server logs in the terminal and browser console for errors.
5. If the change touches CF-specific code (Workers AI, KV, cron), optionally
   run `npm run preview` for an edge parity check. Keep this short.
6. When satisfied, `npm run deploy`.
7. Smoke-test the deployed URL once, then stop.

## Failure Modes To Watch For

- "Login works locally but redirects to prod" → `.env.local` still has
  `NEXT_PUBLIC_SITE_URL` pointing at `https://interceptnews.app`.
- "Intercept returns 502 locally" → `GEMINI_API_KEY` missing from
  `.env.local` or revoked.
- "Rate limit exceeded locally" → in-memory store is tracking your dev IP;
  restart the dev server.
- "Daily Cloudflare request limit exceeded with no users" → someone is
  developing against the deployed site, or `workers_dev` is still exposing
  the subdomain.

## Related Pages

- [Holonomic Brain Operating Model](../strategy/holonomic-brain-operating-model.md)
- [Auth And Session Model](./auth-and-session-model.md)
- [Payment And Operations Model](./payment-and-operations-model.md)
