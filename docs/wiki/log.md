# Wiki Log

## [2026-04-14] wiki | bootstrap

- Created `docs/raw/` as the immutable source layer.
- Created `docs/wiki/` with schema, index, and log files.
- Added first architecture page for auth/session knowledge.
- Added first incident page for the production login regression and fix.
- Added second-brain adoption plan aligned to the LLM Wiki pattern.

## [2026-04-14] incident | login hydration regression

- Recorded the login regression as a first-class incident instead of leaving it only in meeting logs.
- Promoted the auth/session fix into durable architecture knowledge and prevention rules.

## [2026-04-14] memory | project memory update

- Updated machine-readable project memory to point agents to the wiki layer.
- Added explicit note that auth regressions must be documented in `docs/wiki/incidents/`.

## [2026-04-14] strategy | holonomic brain

- Added the `Holonomic Brain` operating model for the repository.
- Recorded the multi-agent roster, nicknames, and working environments.
- Promoted project identity and agent self-model knowledge into first-class durable memory.

## [2026-04-14] docs | archive cleanup

- Moved historical `ULTRAPLAN` snapshots out of the main `docs/` surface into `docs/archive/plans/2026-04-13/`.
- Kept `AnCo_Meeting.md` at the top level because it is still an active operational note.
- Added an archive readme so historical docs stay discoverable without competing with the wiki.

## [2026-04-14] crystallization | meeting notes

- Promoted the product identity pivot and three-surface service model out of `AnCo_Meeting.md` into a strategy page.
- Promoted pricing and payment setup dependencies out of the meeting notes into an architecture page.
- Reduced the risk that core product and operations knowledge remains trapped in operational logs.

## [2026-04-14] tooling | graphify

- Installed Graphify and connected it to Codex, Gemini CLI, OpenCode, and Antigravity.
- Generated the initial code graph in `graphify-out/`.
- Recorded the rule that Graphify is the structural graph layer and the wiki remains the curated durable knowledge layer.

## [2026-04-14] architecture | local-first development rule

- Cloudflare reported the daily Workers request limit exceeded on `interceptnews.app` with no real user traffic.
- Root causes: developing against the deployed site instead of localhost, `workers_dev = true` exposing the `*.workers.dev` subdomain, and `middleware.ts` running `supabase.auth.getUser()` on every non-static hit.
- Added `docs/wiki/architecture/local-first-development.md` as the durable rule: `npm run dev` is the primary surface; deployment is the final step after local verification.
- Updated `intercept/.env.local` so `NEXT_PUBLIC_SITE_URL` points at `http://localhost:3000`, preventing OAuth redirects and share links from bouncing back to prod during local dev.
- Flagged `workers_dev = false` as a required prod config change (pending operator approval).
- **Update (same day)**: operator approved. Set `workers_dev = false` in `intercept/wrangler.toml`, fixed a blocking TypeScript error in `TeatimeView.tsx` (implicit any on `messagesToRender.map` callback), and deployed. Wrangler confirmed: `workers.dev route is disabled`; only `interceptnews.app` and `www.interceptnews.app` remain as public entrypoints. Post-deploy smoke tests passed (root, /teatime, /feed all 200).
- Tightened `intercept/src/middleware.ts` matcher to exclude `/api/*`, webhooks, cron, and common static extensions, so API routes and external webhooks no longer trigger a redundant `supabase.auth.getUser()` per hit. Session refresh remains active for page navigations.
- Verified local payment flow works on `localhost:3000`: `/pricing` returns 200, `/api/payment/paypal/create-order` returns 401 without auth (route alive), `/api/payment/portone/confirm` returns 401 without auth (route alive). PayPal and PortOne libs already use a `resolveEnv()` helper that falls back to `process.env`, so sandbox credentials from `.env.local` are picked up without code changes.

## [2026-04-14] knowledge | payment domain into the Holonomic Brain

- Added `docs/raw/payment/intercept-payment-stack-2026-04-14.md` — full verified facts from direct code read: providers, route surface, `resolveEnv` pattern, credit economy rates, tier mapping, known gaps.
- Added `docs/raw/payment/env-variables-2026-04-14.md` — public/secret env var snapshot with purpose and consumer for each key.
- Promoted the facts into `docs/wiki/architecture/payment-and-operations-model.md` under a new "Verified Stack (2026-04-14)" section linking back to the raw files.
- Established the "지식화" workflow as a durable feedback memory so future agents know exactly what to do when the operator says "이것 지식화해": raw → wiki → index → log → machine memory.

## [2026-04-14] tooling | holonomic brain visualization

- Built a single-file HTML force-directed graph viewer that merges code nodes from `graphify-out/graph.json` with `docs/wiki/*` knowledge nodes and `docs/raw/*` source nodes into one shared visualization, colored by layer.
- Stored at `graphify-out/holonomic-brain.html`, regenerable via `scripts/build_brain_viz.py`.

## [2026-04-14] incident | payment provider regression

- Confirmed from official PortOne docs that TossPayments no longer allows `payMethod: EASY_PAY` without `easyPay.easyPayProvider`; the old assumption about an implicit unified picker was stale after the 2024-01-31 update.
- Updated `intercept/src/components/PaymentSelector.tsx` to add explicit provider choice (`KAKAOPAY`, `NAVERPAY`, `TOSSPAY`), include `redirectUrl` for mobile, and surface clearer contract/test-mode failures.
- Recorded the checkout failure and its prevention rules in `docs/raw/payment/portone-tosspayments-easypay-2026-04-14.md` and `docs/wiki/incidents/2026-04-14-payment-provider-regression.md`.
- Extended `docs/wiki/architecture/payment-and-operations-model.md` so payment knowledge now includes provider-specific checkout rules, fail-closed PayPal setup rules, and pricing-page escape-path checks.

## [2026-04-16] strategy | brain-system additions

- Added USER preferences layer at `docs/wiki/strategy/user-operating-preferences.md` to hold 대표님의 reporting style and operating principles, separate from project facts.
- Added delegation contract at `docs/wiki/strategy/delegation-contract.md`: subagents start from zero knowledge; parent must pass explicit minimum context packet.
- Added regenerable SQLite FTS5 search index at `data/brain/brain.db`, rebuilt via `scripts/index_brain.py`, queried via `scripts/search_brain.py`.
