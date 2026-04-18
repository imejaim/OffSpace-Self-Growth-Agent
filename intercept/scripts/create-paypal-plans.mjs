#!/usr/bin/env node
// One-off: create PayPal sandbox Product + Basic/Pro Billing Plans and print IDs.
// Reads PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_MODE from intercept/.env.local
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)

const clientId = env.PAYPAL_CLIENT_ID
const secret = env.PAYPAL_CLIENT_SECRET
const mode = env.PAYPAL_MODE ?? 'sandbox'
if (!clientId || !secret) {
  console.error('Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET in .env.local')
  process.exit(1)
}
const apiBase = mode === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

async function token() {
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
  const r = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!r.ok) throw new Error(`token: ${await r.text()}`)
  const j = await r.json()
  return j.access_token
}

async function createProduct(tok) {
  const r = await fetch(`${apiBase}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tok}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `intercept-prod-${Date.now()}`,
    },
    body: JSON.stringify({
      name: 'Intercept Subscription',
      description: 'Intercept — personal news with character AI team',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })
  if (!r.ok) throw new Error(`product: ${await r.text()}`)
  return r.json()
}

async function createPlan(tok, productId, { name, description, price, requestTag }) {
  const r = await fetch(`${apiBase}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tok}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `intercept-plan-${requestTag}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name,
      description,
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: { fixed_price: { value: price, currency_code: 'USD' } },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })
  if (!r.ok) throw new Error(`plan ${name}: ${await r.text()}`)
  return r.json()
}

const tok = await token()
console.log('[ok] token acquired (' + mode + ')')
const product = await createProduct(tok)
console.log('[ok] product:', product.id, '-', product.name)
const basic = await createPlan(tok, product.id, {
  name: 'Intercept Basic',
  description: '150 intercepts/month + 3 topics + 5 newsletters',
  price: '2.99',
  requestTag: 'basic',
})
console.log('[ok] basic plan:', basic.id)
const pro = await createPlan(tok, product.id, {
  name: 'Intercept Pro',
  description: '500 intercepts/month + 10 topics + unlimited newsletters + ad-free',
  price: '8.00',
  requestTag: 'pro',
})
console.log('[ok] pro plan:', pro.id)

console.log('\n--- add these to intercept/.env.local ---')
console.log(`PAYPAL_PRODUCT_ID=${product.id}`)
console.log(`PAYPAL_BASIC_PLAN_ID=${basic.id}`)
console.log(`PAYPAL_PRO_PLAN_ID=${pro.id}`)
console.log(`NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID=${basic.id}`)
console.log(`NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID=${pro.id}`)
