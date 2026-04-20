# Payment And Operations Model

## Scope

This page captures the durable payment and operations knowledge that should not remain only in meeting notes.

## Current Commercial Stack

- global payments: PayPal
- Korea payments: PortOne V2
- auth and identity store: Supabase
- deploy surface: Cloudflare

## Pricing Snapshot

Confirmed pricing model from the working notes:

- Free: 2 intercepts per day, about 60 per month, 1 topic, ads on
- Basic: $2.99 per month, 150 intercepts per month, 3 topics, 5 newsletters per month
- Pro: $8 per month, 500 intercepts per month, 10 topics, unlimited newsletters, no ads
- Pay-per-use: $1 per 10 credits

This page records the operating snapshot, not a permanent business contract. Update it when pricing changes are intentionally shipped.

## Operational Dependencies

Known operations dependencies from the April 2026 working notes:

- usage reset functions exist in Supabase
- reset endpoint uses `CRON_SECRET`
- external cron is still treated as an operational task
- PayPal billing plan IDs are a separate setup dependency
- PortOne live switch is a later-stage operational task

## Durable Rules

- payment configuration should be documented as an operating model, not scattered across chat
- placeholder production values must not survive into public pages
- production payment verification should include both UI behavior and state updates in Supabase
- billing setup tasks should be tracked as explicit operational dependencies

## Known Checks

When payment or credits flows change, verify:

- `/pricing` renders the intended plans and buttons
- `/pricing/credits` resolves correctly
- pricing and credits screens always expose a clear route back to `/`, `/teatime`, `/feed`, or `/my`
- PayPal flow reaches the expected status update
- PortOne test flow records the expected transaction state
- no placeholder email or fake production contact values remain

## Verified Stack (2026-04-14)

Raw source-of-truth: `docs/raw/payment/intercept-payment-stack-2026-04-14.md`
(captured by direct code read during the Cloudflare daily-limit incident follow-up)

### Route Surface

- PayPal: `create-order`, `capture-order`, `create-subscription`, `webhook`
- PortOne V2: `confirm`, `webhook`
- All routes run under the Node.js runtime (`export const runtime = 'nodejs'`)

### Secret Resolution Pattern

`lib/paypal.ts` and `lib/portone.ts` share a `resolveEnv(key)` helper that:

1. tries `getCloudflareContext().env[key]` first (where `wrangler secret put` secrets actually land)
2. falls back to `process.env[key]` for local dev

Every payment secret must go through this helper, never raw `process.env`. The helper is the reason the entire payment flow runs unchanged on `localhost:3000` and on `interceptnews.app`.

### Credit Economy

- `$1 = 10 credits` (PayPal capture path)
- `1,000 KRW = 10 credits` (PortOne confirm path)
- Balance state lives in Supabase: `profiles.credits` column, mutated only via RPCs (`deduct_credit`, `add_credits`, `refund_credit`) — the Node layer never does the arithmetic itself
- Idempotency key for PortOne: `credit_transactions.payment_id`
- Idempotency key for intercept deduction: pre-minted `interceptId`; `deductCredit` runs **before** the AI call, `refundCredit` on failure

### Tier Mapping (from `lib/auth-helpers.ts`)

- `free` — 2 daily intercepts
- `basic` — 150 monthly
- `pro` — 500 monthly
- `payperuse` — credit-gated, no daily/monthly cap

PayPal subscription webhook maps `BILLING.SUBSCRIPTION.ACTIVATED.resource.plan_id` to `basic` or `pro` via the `PAYPAL_PLAN_ID_PRO` secret, and updates `profiles.tier` + `profiles.subscription_id` + `profiles.subscription_status`.

### Required Secrets

Full list with purposes: `docs/raw/payment/env-variables-2026-04-14.md`

Minimum set for a working flow:

- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `PAYPAL_WEBHOOK_ID` (webhook only)
- PortOne: `PORTONE_TEST_SECRET_KEY`, `PORTONE_WEBHOOK_SECRET`
- Public (wrangler vars): `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `NEXT_PUBLIC_PORTONE_STORE_ID`, `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`

### Known Operational Gaps

- PayPal billing plan IDs are not in source control — they live only in the PayPal dashboard and as wrangler secrets.
- Supabase Postgres functions (`deduct_credit`, `add_credits`, `refund_credit`) are not versioned in the repo — schema drift between environments is invisible to source control.
- PortOne store/channel keys are test-mode values; live switch is a separate operational task.
- PayPal subscription `custom_id` must equal the Supabase user id on creation, otherwise the activation webhook cannot resolve the account — nothing in the repo verifies that the call site passes it.

## Provider-Specific Checkout Rules (2026-04-14)

Raw source-of-truth: `docs/raw/payment/portone-tosspayments-easypay-2026-04-14.md`

### PortOne V2 + TossPayments

- `payMethod: EASY_PAY` must include `easyPay.easyPayProvider`.
- Supported providers currently surfaced in the product:
  - `KAKAOPAY`
  - `NAVERPAY`
  - `TOSSPAY`
- Mobile checkout must include `redirectUrl`.
- Test mode does not remove the provider requirement.
- Some easy-pay methods may still fail in test mode or without a live contract enabled on the TossPayments side.

### PayPal

- Subscription buttons must not render with placeholder plan IDs.
- Missing client or plan configuration should fail closed and be exposed to the operator as setup debt, not as a fake-ready checkout state.

### Local Parity Probes (2026-04-14)

- `GET /pricing` → 200
- `POST /api/payment/paypal/create-order` → 401 without auth (route alive)
- `POST /api/payment/portone/confirm` → 401 without auth (route alive)

No code changes were needed to make payment flows work on localhost — `.env.local` plus the `resolveEnv` helper is sufficient.

## Related Pages

- [Product Identity And Surface Model](../strategy/product-identity-and-surface-model.md)
- [Auth And Session Model](./auth-and-session-model.md)
- [Local-First Development Workflow](./local-first-development.md)
