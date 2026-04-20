# Intercept Payment Stack — Verified Facts

Captured: 2026-04-14
Source: direct code read during ULTRAWORK session (Cloudflare daily-limit incident follow-up)
Provenance: `intercept/src/lib/paypal.ts`, `intercept/src/lib/portone.ts`, `intercept/src/lib/credits.ts`, `intercept/src/app/api/payment/**`, `intercept/src/components/PaymentSelector.tsx`, `intercept/wrangler.toml`, `intercept/.env.local`

This file is the immutable source record for the payment subsystem as it stands on 2026-04-14. Do not edit in place; add dated follow-up files if the stack changes.

---

## Providers

- **Global / USD**: PayPal (sandbox during MVP, `PAYPAL_MODE=sandbox`)
- **Korea / KRW**: PortOne V2, browser SDK `@portone/browser-sdk/v2`
- **Credit store**: Supabase `profiles.credits` column + `credit_transactions` table + RPC functions (`deduct_credit`, `add_credits`, `refund_credit`)
- **Runtime**: Next.js 16 App Router route handlers with `export const runtime = 'nodejs'` on every payment route

## Secret Resolution Pattern (Critical)

Both `intercept/src/lib/paypal.ts` and `intercept/src/lib/portone.ts` use the same helper:

```
export async function resolveEnv(key: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const val = (env as any)?.[key];
    if (typeof val === "string" && val.length > 0) return val;
  } catch {
    // Not in Cloudflare runtime
  }
  const fromProcess = process.env?.[key];
  if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  return undefined;
}
```

Why it matters: on Cloudflare Workers with `nodejs_compat`, secrets declared via `wrangler secret put` land on `getCloudflareContext().env`, **not** on `process.env`. The same function falls back to `process.env` on local dev so `.env.local` values work without code changes. This is why the stack works identically on `localhost:3000` and on `interceptnews.app` without provider stubs.

`lib/portone.ts` imports `resolveEnv` from `lib/paypal.ts` — a single shared implementation.

## PayPal — Route Surface

- `POST /api/payment/paypal/create-order` — auth required, rate-limited, calls `createOrder(amount, 'USD')`, returns `{ orderId }`.
- `POST /api/payment/paypal/capture-order` — auth required, rate-limited, extracts `purchase_units[0].payments.captures[0].amount.value`, converts to credits at `$1 = 10 credits`, calls `addCredits(userId, amount, 'paypal', orderId)`.
- `POST /api/payment/paypal/create-subscription` — creates a subscription on a PayPal plan ID (plan IDs live in env).
- `POST /api/payment/paypal/webhook` — verifies signature via `verifyWebhookSignature()`, handles `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `PAYMENT.SALE.COMPLETED`. Updates `profiles.tier`, `profiles.subscription_id`, `profiles.subscription_status`.

## PayPal — Required Env

Consumed by `lib/paypal.ts` and the webhook route:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE` — `sandbox` or `production`; switches API base to `api-m.sandbox.paypal.com` vs `api-m.paypal.com`.
- `PAYPAL_WEBHOOK_ID` — required only for the webhook route, otherwise it 500s.
- `PAYPAL_PLAN_ID_PRO` — webhook uses this to distinguish pro from basic on activation.
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — public, used by the PayPal JS SDK on the browser.

Token caching: `generateAccessToken()` caches the OAuth token in a module-level `tokenCache` with a 60s expiry buffer.

## PortOne — Route Surface

- Browser SDK opens payment dialog from `PaymentSelector.tsx` with `PortOne.requestPayment({ storeId, paymentId, orderName, totalAmount, currency: 'KRW', channelKey, payMethod, customer, customData })`. Pay methods: `EASY_PAY`, `CARD`, `TRANSFER`, `MOBILE`. EASY_PAY deliberately omits `easyPay: {}` — passing an empty object breaks the V2 SDK request.
- `POST /api/payment/portone/confirm` — auth required, rate-limited, idempotency-checks `credit_transactions.payment_id`, calls `verifyPayment(paymentId)` against `api.portone.io/payments/{paymentId}`, requires `payment.status === 'PAID'`, converts KRW to credits at `1000 KRW = 10 credits` (`KRW_PER_CREDIT = 100`), calls `addCredits(userId, amount, 'portone', paymentId)`.
- `POST /api/payment/portone/webhook` — verifies HMAC-SHA256 of `{webhookId}.{webhookTimestamp}.{body}` against `PORTONE_WEBHOOK_SECRET`.

## PortOne — Required Env

- `PORTONE_TEST_SECRET_KEY` — server REST auth for `api.portone.io`.
- `PORTONE_WEBHOOK_SECRET` — HMAC key for webhook signature verification.
- `NEXT_PUBLIC_PORTONE_STORE_ID` — public, embedded in the browser SDK call.
- `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` — public, channel routing.
- (Server-side copy) `PORTONE_CHANNEL_KEY` — mirrored in `.env.local`.
- Unused but present in `.env.local`: `PORTONE_TEST_MID`, `PORTONE_TEST_CLIENT_KEY`.

## Credits Library (`lib/credits.ts`)

Only four exports, all backed by Supabase RPC functions:

- `getBalance(userId) → number`
- `deductCredit(userId, interceptId) → { success, balance }` → RPC `deduct_credit`
- `addCredits(userId, amount, provider, paymentId) → { success, balance }` → RPC `add_credits`
- `refundCredit(userId, interceptId) → { success, balance }` → RPC `refund_credit`

Interpretation: Supabase Postgres functions own the atomic balance mutation; the Node layer does not do the arithmetic itself. The `credit_transactions` table is referenced for idempotency checks in the PortOne confirm route, and `paymentId` is the unique key.

## Credit Economy Exchange Rates

- PayPal: **$1 = 10 credits** (computed at `Math.floor(parseFloat(paidAmount) * 10)` in `capture-order/route.ts`).
- PortOne: **1,000 KRW = 10 credits** (computed at `Math.floor(totalKrw / 100)` in `portone/confirm/route.ts`).
- Client package definitions in `PaymentSelector.tsx`:
  - `10 credits / 1,000 KRW`
  - `50 credits / 4,500 KRW` (10% 할인 배지)
  - `100 credits / 8,000 KRW` (20% 할인 배지)

## PaymentSelector Behavior

Pay button is disabled while `status === 'loading'`. On success, a static "테스트 모드 — 실제 결제가 발생하지 않습니다" line is shown because the MVP is locked to sandbox/test keys. `PortOne.requestPayment` is called with `(as any)` casting because the V2 SDK types are incomplete for `EASY_PAY` omission.

If no user is logged in, the pay button sets an error state and the error box renders an inline Google OAuth `signInWithOAuth` button using `window.location.origin + '/auth/callback'` as the redirect.

## Tier / Plan Mapping

From `lib/auth-helpers.ts::getLimitsForTier`:

- `free` — 2 intercepts per day, no monthly cap
- `basic` — no daily cap, 150 intercepts per month
- `pro` — no daily cap, 500 intercepts per month
- `payperuse` — no daily or monthly cap; gated entirely by `credits` balance

The intercept route (`POST /api/intercept`) checks `payperuse` separately: it requires `profile.credits > 0`, and `deductCredit` is called **before** the AI call with `refundCredit` on failure, using a pre-minted `interceptId` as the idempotency key.

## Wrangler / Deployment Surface

`intercept/wrangler.toml` public vars (as of 2026-04-14):

- `NEXT_PUBLIC_SITE_URL = "https://interceptnews.app"`
- `NEXT_PUBLIC_BASE_URL = "https://interceptnews.app"`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — sandbox client ID inlined
- `NEXT_PUBLIC_PORTONE_STORE_ID` — inlined
- `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` — inlined

Secrets (`wrangler secret put <KEY>`):

- `PORTONE_TEST_SECRET_KEY`
- `PORTONE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID` (required for webhook verification)
- `PAYPAL_PLAN_ID_PRO` (optional, differentiates pro plan in webhook)
- `GEMINI_API_KEY`
- `CRON_SECRET`

## Local Development Parity

Because `resolveEnv` falls back to `process.env`, everything payment-related runs on `localhost:3000` when `.env.local` is populated. Verified probes on 2026-04-14:

- `GET /pricing` → 200
- `POST /api/payment/paypal/create-order` → 401 (auth-required, route alive)
- `POST /api/payment/portone/confirm` → 401 (auth-required, route alive)

The only remote dependencies that actually execute from localhost during a full run are: PayPal sandbox (`api-m.sandbox.paypal.com`), PortOne (`api.portone.io`), Supabase (`ptbumikpnehlbxsbhmsx.supabase.co`), and Gemini (when intercept is triggered). None of them require the Cloudflare Worker to be reachable.

## Known Gaps

- PayPal `BILLING.SUBSCRIPTION.ACTIVATED` uses `resource.custom_id` as the user id — that requires the subscription creation call to pass `custom_id` matching the Supabase user id. `lib/paypal.ts::createSubscription(planId, customId)` supports it, but nothing in the repo verifies the call site actually sends it.
- PayPal billing plan IDs are not in the repo — they must be created once in the PayPal dashboard and set via `PAYPAL_PLAN_ID_BASIC` / `PAYPAL_PLAN_ID_PRO` secrets. The webhook falls through to `basic` when `PAYPAL_PLAN_ID_PRO` does not match.
- PortOne live switch is not implemented — the store/channel keys hardcoded in `wrangler.toml` are test-mode values.
- The `credit_transactions.payment_id` uniqueness check is the only idempotency guard; if it fails to match because of schema drift, double-crediting is possible.
- The `deduct_credit` / `add_credits` / `refund_credit` Postgres function bodies are not versioned in the repo — they live only in the Supabase project. Schema drift between dev and prod is invisible to source control.

## Related Source Files

- `intercept/src/lib/paypal.ts`
- `intercept/src/lib/portone.ts`
- `intercept/src/lib/credits.ts`
- `intercept/src/app/api/payment/paypal/create-order/route.ts`
- `intercept/src/app/api/payment/paypal/capture-order/route.ts`
- `intercept/src/app/api/payment/paypal/create-subscription/route.ts`
- `intercept/src/app/api/payment/paypal/webhook/route.ts`
- `intercept/src/app/api/payment/portone/confirm/route.ts`
- `intercept/src/app/api/payment/portone/webhook/route.ts`
- `intercept/src/components/PaymentSelector.tsx`
- `intercept/src/components/PaymentModal.tsx`
- `intercept/src/components/SubscribeButton.tsx`
- `intercept/src/lib/auth-helpers.ts` (tier limits)
- `intercept/wrangler.toml`
- `intercept/.env.local`
