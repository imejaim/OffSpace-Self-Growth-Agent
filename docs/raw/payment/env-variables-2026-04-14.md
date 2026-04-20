# Payment Env Variables — Snapshot 2026-04-14

Captured from `intercept/.env.local` and `intercept/wrangler.toml` on 2026-04-14.
Secret values intentionally redacted — this file records names, locations, and purposes only.

## Public (safe to inline in wrangler.toml `[vars]`)

| Name | Purpose | Location |
|---|---|---|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal JS SDK browser client ID | wrangler.toml + .env.local |
| `NEXT_PUBLIC_PORTONE_STORE_ID` | PortOne V2 store ID for browser SDK | wrangler.toml + .env.local |
| `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` | PortOne V2 channel routing key | wrangler.toml + .env.local |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirect / share link base | wrangler.toml (prod) + .env.local (localhost) |
| `NEXT_PUBLIC_BASE_URL` | Internal fetch base | wrangler.toml (prod) + .env.local (localhost) |

## Server secrets (Cloudflare `wrangler secret put` + .env.local)

| Name | Purpose | Consumed by |
|---|---|---|
| `PAYPAL_CLIENT_ID` | REST OAuth basic-auth username | `lib/paypal.ts::generateAccessToken` |
| `PAYPAL_CLIENT_SECRET` | REST OAuth basic-auth password | `lib/paypal.ts::generateAccessToken` |
| `PAYPAL_MODE` | `sandbox` or `production` | `lib/paypal.ts::getPayPalApiBase` |
| `PAYPAL_WEBHOOK_ID` | Required for webhook signature verification | `api/payment/paypal/webhook/route.ts` |
| `PAYPAL_PLAN_ID_PRO` | Differentiates pro vs basic on subscription activation | `api/payment/paypal/webhook/route.ts::getPlanTier` |
| `PORTONE_TEST_SECRET_KEY` | PortOne REST auth for `api.portone.io` | `lib/portone.ts::verifyPayment` |
| `PORTONE_WEBHOOK_SECRET` | HMAC-SHA256 key for webhook signature | `lib/portone.ts::verifyWebhookSignature` |
| `PORTONE_CHANNEL_KEY` | Server-side mirror (unused by route logic) | .env.local only |
| `PORTONE_TEST_MID`, `PORTONE_TEST_CLIENT_KEY` | Legacy / unused | .env.local only |

## Adjacent

- `GEMINI_API_KEY` — not payment but shares `resolveEnv()` pattern and is the reason intercept generation works locally.
- `CRON_SECRET` — guards `/api/cron/reset-usage` which resets `daily_used` / `monthly_used`, which in turn affects tier allowances (indirectly payment-adjacent).

## Local vs Prod Divergence

The only value that intentionally differs between `.env.local` and `wrangler.toml` is `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_BASE_URL` (localhost vs `interceptnews.app`). Every other env var has identical behavior in both surfaces because `resolveEnv` falls back to `process.env` on local dev.
