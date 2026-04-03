import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subscriptionId = searchParams.get('subscriptionId')

  // MVP: mock subscription status response
  return NextResponse.json({
    subscriptionId: subscriptionId ?? null,
    status: subscriptionId ? 'ACTIVE' : 'NOT_FOUND',
    plan: 'premium',
    mode: process.env.PAYPAL_MODE ?? 'sandbox',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log subscription events (stub for webhook handling)
    console.log('[PayPal Webhook]', JSON.stringify(body, null, 2))

    const eventType: string = body?.event_type ?? 'UNKNOWN'

    return NextResponse.json({
      received: true,
      event_type: eventType,
    })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 400 }
    )
  }
}
