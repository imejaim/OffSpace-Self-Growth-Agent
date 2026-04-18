import { NextResponse } from 'next/server'
import { resolveEnv } from '@/lib/paypal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = await resolveEnv('NEXT_PUBLIC_PAYPAL_CLIENT_ID')
  const basicPlanId =
    (await resolveEnv('NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID')) ??
    (await resolveEnv('PAYPAL_BASIC_PLAN_ID'))
  const proPlanId =
    (await resolveEnv('NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID')) ??
    (await resolveEnv('PAYPAL_PRO_PLAN_ID'))
  const mode = (await resolveEnv('PAYPAL_MODE')) ?? 'sandbox'

  return NextResponse.json({
    clientId: clientId ?? null,
    mode,
    plans: {
      basic: basicPlanId ?? null,
      pro: proPlanId ?? null,
    },
  })
}
