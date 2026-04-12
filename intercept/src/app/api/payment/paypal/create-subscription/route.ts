import { NextRequest, NextResponse } from 'next/server'
import { createSubscription } from '@/lib/paypal'
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
    const { success } = await rateLimit(ip)
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json() as { planId: string }
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 })
    }

    const subscription = await createSubscription(planId, user.id) as {
      id: string
      links?: Array<{ rel: string; href: string }>
    }

    // Store subscription_id immediately so webhook can find by it as fallback
    await supabase
      .from('profiles')
      .update({ subscription_id: subscription.id, subscription_status: 'pending' })
      .eq('id', user.id)

    const approvalUrl = subscription.links?.find((l) => l.rel === 'approve')?.href ?? null

    return NextResponse.json({ subscriptionId: subscription.id, approvalUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
