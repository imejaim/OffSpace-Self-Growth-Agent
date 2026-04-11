import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PayPalWebhookEvent = {
  event_type: string
  resource: {
    id?: string
    plan_id?: string
    subscriber?: {
      email_address?: string
      payer_id?: string
    }
    custom_id?: string
    billing_agreement_id?: string
  }
}

// Maps PayPal plan IDs to internal tier names
// Set PAYPAL_PLAN_ID_BASIC and PAYPAL_PLAN_ID_PRO in environment variables
function getPlanTier(planId?: string): string {
  if (!planId) return 'basic'
  if (planId === process.env.PAYPAL_PLAN_ID_PRO) return 'pro'
  return 'basic'
}

const SUBSCRIPTION_CANCEL_EVENTS = new Set([
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
])

export async function POST(request: NextRequest) {
  const body = await request.text()

  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    return NextResponse.json({ error: 'PAYPAL_WEBHOOK_ID not configured' }, { status: 500 })
  }

  let isValid: boolean
  try {
    isValid = await verifyWebhookSignature(request.headers, body, webhookId)
  } catch {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  let event: PayPalWebhookEvent
  try {
    event = JSON.parse(body) as PayPalWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { event_type, resource } = event

  try {
    const supabase = await createClient()

    if (event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = resource.id
      const userId = resource.custom_id
      const newTier = getPlanTier(resource.plan_id)

      if (subscriptionId && userId) {
        await supabase
          .from('profiles')
          .update({ tier: newTier, subscription_id: subscriptionId, subscription_status: 'active' })
          .eq('id', userId)
      }
    } else if (SUBSCRIPTION_CANCEL_EVENTS.has(event_type)) {
      const subscriptionId = resource.id

      if (subscriptionId) {
        await supabase
          .from('profiles')
          .update({ tier: 'free', subscription_status: event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'cancelled' : 'suspended' })
          .eq('subscription_id', subscriptionId)
      }
    } else if (event_type === 'PAYMENT.SALE.COMPLETED') {
      const subscriptionId = resource.billing_agreement_id
      if (subscriptionId) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('subscription_id', subscriptionId)
      }
    }
  } catch {
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true, event_type })
}
