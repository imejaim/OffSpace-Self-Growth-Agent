import { createClient } from '../lib/supabase/server'

export type UserTier = 'free' | 'basic' | 'pro' | 'payperuse'

export type InterceptLimits = {
  daily: number | null
  monthly: number | null
}

export function getLimitsForTier(tier: UserTier): InterceptLimits {
  switch (tier) {
    case 'free':
      return { daily: 2, monthly: null }
    case 'basic':
      return { daily: null, monthly: 150 }
    case 'pro':
      return { daily: null, monthly: 500 }
    case 'payperuse':
      return { daily: null, monthly: null }
  }
}

export function checkInterceptAllowance(
  userId: string | null,
  tier: UserTier,
  dailyUsed: number,
  monthlyUsed: number
): { allowed: boolean; reason?: string } {
  const limits = getLimitsForTier(tier)

  if (limits.daily !== null && dailyUsed >= limits.daily) {
    return { allowed: false, reason: `Daily limit of ${limits.daily} intercepts reached` }
  }

  if (limits.monthly !== null && monthlyUsed >= limits.monthly) {
    return { allowed: false, reason: `Monthly limit of ${limits.monthly} intercepts reached` }
  }

  return { allowed: true }
}

export async function getSessionInfo(request: Request): Promise<{
  userId: string | null
  sessionId: string | null
  tier: UserTier
  nickname: string | null
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, nickname')
        .eq('id', user.id)
        .single()

      return {
        userId: user.id,
        sessionId: null,
        tier: (profile?.tier as UserTier) ?? 'free',
        nickname: profile?.nickname ?? null,
      }
    }
  } catch {
    // Supabase auth unavailable — fall through to anonymous session
  }

  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)intercept_session=([^;]+)/)
  const sessionId = match ? decodeURIComponent(match[1]) : null

  return {
    userId: null,
    sessionId,
    tier: 'free',
    nickname: null,
  }
}
