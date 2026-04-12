import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/portone'
import { addCredits } from '@/lib/credits'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// KRW 기준: 1,000원 = 10 크레딧 ($1 = 10 credits와 동일 비율)
const KRW_PER_CREDIT = 100

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const { success } = await rateLimit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json() as { paymentId: string }
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })
    }

    // Idempotency check — prevent double-crediting
    const { data: existingTx } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('payment_id', paymentId)
      .limit(1)
      .maybeSingle()

    if (existingTx) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()
      return NextResponse.json({ success: true, credits: 0, balance: profile?.credits ?? 0 })
    }

    // Always verify server-side — never trust client-supplied data
    const payment = await verifyPayment(paymentId)

    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: `Payment not completed (status: ${payment.status})` },
        { status: 400 }
      )
    }

    // Calculate credits: KRW 1,000 → 10 credits
    const totalKrw = payment.amount.total
    const creditAmount = Math.floor(totalKrw / KRW_PER_CREDIT)

    if (creditAmount <= 0) {
      return NextResponse.json({ error: 'Payment amount too small' }, { status: 400 })
    }

    const result = await addCredits(user.id, creditAmount, 'portone', paymentId)

    console.log(JSON.stringify({
      type: 'portone_payment_confirmed',
      userId: user.id,
      paymentId,
      totalKrw,
      creditAmount,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({ success: true, credits: creditAmount, balance: result.balance })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
