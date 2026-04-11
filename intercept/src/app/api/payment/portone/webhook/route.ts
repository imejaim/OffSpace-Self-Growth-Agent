import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment, verifyWebhookSignature, type PortOneWebhookPayload } from '@/lib/portone'
import { addCredits } from '@/lib/credits'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KRW_PER_CREDIT = 100

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    const webhookId = request.headers.get('webhook-id') ?? ''
    const webhookTimestamp = request.headers.get('webhook-timestamp') ?? ''
    const webhookSignature = request.headers.get('webhook-signature') ?? ''

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
    }

    const isValid = await verifyWebhookSignature(rawBody, webhookId, webhookTimestamp, webhookSignature)
    if (!isValid) {
      console.log(JSON.stringify({
        type: 'portone_webhook_invalid_signature',
        webhookId,
        timestamp: new Date().toISOString(),
      }))
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    // Reject stale webhooks (replay protection — 5 min window)
    const webhookAge = Math.abs(Date.now() / 1000 - Number(webhookTimestamp))
    if (webhookAge > 300) {
      return NextResponse.json({ error: 'Webhook too old' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody) as PortOneWebhookPayload

    console.log(JSON.stringify({
      type: 'portone_webhook_received',
      eventType: payload.type,
      webhookId,
      timestamp: new Date().toISOString(),
    }))

    // Handle payment completion events
    if (payload.type === 'Transaction.Paid' && payload.data.paymentId) {
      const paymentId = payload.data.paymentId

      const payment = await verifyPayment(paymentId)
      if (payment.status !== 'PAID') {
        return NextResponse.json({ received: true, action: 'skipped_not_paid' })
      }

      // Resolve userId from customData — may be string or { userId: string }
      const raw = payment.customData
      const userId: string | null =
        typeof raw === 'string'
          ? raw
          : raw !== null && typeof raw === 'object' && 'userId' in (raw as object)
          ? String((raw as Record<string, unknown>).userId)
          : null

      if (!userId) {
        console.log(JSON.stringify({
          type: 'portone_webhook_no_user',
          paymentId,
          timestamp: new Date().toISOString(),
        }))
        return NextResponse.json({ received: true, action: 'skipped_no_user' })
      }

      // Verify user exists
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (!profile) {
        return NextResponse.json({ received: true, action: 'skipped_user_not_found' })
      }

      const totalKrw = payment.amount.total
      const creditAmount = Math.floor(totalKrw / KRW_PER_CREDIT)

      // Idempotency check — prevent double-crediting
      const { data: existingTx } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('payment_id', paymentId)
        .limit(1)
        .maybeSingle()

      if (existingTx) {
        return NextResponse.json({ received: true, action: 'already_processed' })
      }

      if (creditAmount > 0) {
        await addCredits(userId, creditAmount, 'portone', paymentId)

        console.log(JSON.stringify({
          type: 'portone_webhook_credits_added',
          userId,
          paymentId,
          totalKrw,
          creditAmount,
          timestamp: new Date().toISOString(),
        }))
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(JSON.stringify({
      type: 'portone_webhook_error',
      error: message,
      timestamp: new Date().toISOString(),
    }))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
