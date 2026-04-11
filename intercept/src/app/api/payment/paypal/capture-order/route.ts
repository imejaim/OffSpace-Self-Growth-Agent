import { NextRequest, NextResponse } from 'next/server'
import { captureOrder } from '@/lib/paypal'
import { addCredits } from '@/lib/credits'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { orderId: string }
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const { success } = rateLimit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const captureResult = await captureOrder(orderId) as {
      purchase_units?: Array<{
        payments?: {
          captures?: Array<{ amount?: { value?: string } }>
        }
      }>
    }

    const paidAmount = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
    if (!paidAmount) {
      return NextResponse.json({ error: 'Could not determine payment amount from capture response' }, { status: 500 })
    }

    // $1 = 10 credits — never trust client-supplied credits
    const creditAmount = Math.floor(parseFloat(paidAmount) * 10)
    const result = await addCredits(user.id, creditAmount, 'paypal', orderId)

    return NextResponse.json({ success: true, credits: creditAmount, balance: result.balance })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
