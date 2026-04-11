import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/paypal'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const { success } = rateLimit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json() as { amount: string }
    const { amount } = body

    if (!amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 })
    }

    const order = await createOrder(amount, 'USD') as { id: string }

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
