import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredit, refundCredit } from '@/lib/credits'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionInfo, checkInterceptAllowance } from '@/lib/auth-helpers'
import { generateInterceptResponse } from '@/lib/ai-router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `당신은 INTERCEPT라는 AI 뉴스 토론 플랫폼의 세 캐릭터입니다. 사용자가 AI 캐릭터들의 대화에 끼어들었을 때, 해당 캐릭터들이 자연스럽게 반응해야 합니다.

세 캐릭터:

1. 코부장 (코드명: kobu) — 개발부장. 10년 이상 경력의 베테랑 개발자. 큰 그림을 보고, 권위 있지만 친근하다. 말투: 차분하고 통찰력 있음. "~군요", "~네요" 등 격식 있는 반말 사용.

2. 오과장 (코드명: oh) — 기획과장. 전략과 데이터를 중시하는 비즈니스 마인드. 숫자와 근거를 좋아함. 말투: 논리적이고 분석적. "~입니다", "~죠" 등 정중한 표현 사용.

3. 젬대리 (코드명: jem) — 개발대리. 열정 넘치는 신입 개발자. 최신 트렌드에 밝고 캐주얼함. 말투: 신나고 활기참. "ㅋㅋ", "ㅎㅎ", "~요!" 등 캐주얼한 표현 사용.

규칙:
- 항상 정확히 2명의 캐릭터가 응답합니다
- 각 응답은 1~3문장으로 간결하게
- 사용자가 방금 대화에 끼어든 것처럼 자연스럽게 반응 (당황하거나 반기거나 논쟁하거나)
- 한국어로만 응답
- 마크다운 없이 순수 텍스트만 사용
- 반드시 아래 JSON 배열 형식만 반환하고 다른 텍스트는 절대 포함하지 마세요:
[
  {"characterId": "kobu", "name": "코부장", "content": "..."},
  {"characterId": "oh", "name": "오과장", "content": "..."}
]`

interface InterceptRequest {
  conversationContext: string
  userMessage: string
  characterId?: string
  sessionId?: string
}

interface CharacterResponse {
  characterId: string
  name: string
  content: string
}

const CHARACTER_NAMES: Record<string, string> = {
  kobu: '코부장',
  oh: '오과장',
  jem: '젬대리',
}

function buildUserPrompt(
  conversationContext: string,
  userMessage: string,
  characterId?: string
): string {
  let prompt = `[현재 대화 맥락]\n${conversationContext}\n\n[사용자의 끼어들기]\n${userMessage}`

  if (characterId && CHARACTER_NAMES[characterId]) {
    prompt += `\n\n위 메시지는 ${CHARACTER_NAMES[characterId]}의 발언에 대한 반응입니다. ${CHARACTER_NAMES[characterId]}는 반드시 응답에 포함해야 합니다.`
  }

  prompt +=
    '\n\n이 상황에 가장 적합한 2명의 캐릭터를 선택해 자연스럽게 반응해 주세요. JSON 배열만 반환하세요.'

  return prompt
}

export async function POST(request: NextRequest) {
  // Rate limiting (IP-based)
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const { success: rateLimitOk } = await rateLimit(ip)
  if (!rateLimitOk) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 })
  }

  let body: InterceptRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: '요청 형식이 올바르지 않습니다.' },
      { status: 400 }
    )
  }

  const { conversationContext, userMessage, characterId, sessionId } = body

  if (!conversationContext || !userMessage) {
    return NextResponse.json(
      { error: '대화 맥락과 메시지를 모두 입력해 주세요.' },
      { status: 400 }
    )
  }

  // Auth + tier check
  const { userId, tier } = await getSessionInfo(request)
  const resolvedSessionId = sessionId ?? null

  // Fetch usage counts
  const supabase = await createClient()
  let dailyUsed = 0
  let monthlyUsed = 0
  let credits = 0

  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_used, monthly_used, credits')
      .eq('id', userId)
      .single()

    dailyUsed = profile?.daily_used ?? 0
    monthlyUsed = profile?.monthly_used ?? 0
    credits = profile?.credits ?? 0
  } else if (resolvedSessionId) {
    const { count } = await supabase
      .from('intercepts')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', resolvedSessionId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    dailyUsed = count ?? 0
  }

  // payperuse: check credits
  if (tier === 'payperuse') {
    if (credits <= 0) {
      return NextResponse.json(
        { error: '크레딧이 부족합니다. 크레딧을 충전해 주세요.' },
        { status: 402 }
      )
    }
  } else {
    const allowance = checkInterceptAllowance(userId, tier, dailyUsed, monthlyUsed)
    if (!allowance.allowed) {
      return NextResponse.json({ error: allowance.reason }, { status: 402 })
    }
  }

  // For payperuse, generate a placeholder intercept id for credit deduction
  // We deduct before AI call, refund on failure
  const interceptId = crypto.randomUUID()
  let creditDeducted = false

  if (tier === 'payperuse' && userId) {
    try {
      await deductCredit(userId, interceptId)
      creditDeducted = true
    } catch (err) {
      console.error('[intercept] deductCredit failed:', err)
      return NextResponse.json({ error: '크레딧 차감에 실패했습니다.' }, { status: 500 })
    }
  }

  try {
    let rawText: string
    try {
      rawText = await generateInterceptResponse(
        SYSTEM_PROMPT,
        buildUserPrompt(conversationContext, userMessage, characterId)
      )
    } catch (aiErr) {
      console.error('[AI Router Error]', aiErr)

      if (creditDeducted && userId) {
        await refundCredit(userId, interceptId).catch((e) =>
          console.error('[intercept] refundCredit failed:', e)
        )
      }

      return NextResponse.json(
        { error: 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 502 }
      )
    }

    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let responses: CharacterResponse[]
    try {
      responses = JSON.parse(cleaned)
    } catch {
      console.error('[Gemini Parse Error] raw:', rawText)

      if (creditDeducted && userId) {
        await refundCredit(userId, interceptId).catch((e) =>
          console.error('[intercept] refundCredit failed:', e)
        )
      }

      return NextResponse.json(
        { error: 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.' },
        { status: 500 }
      )
    }

    // Save intercept to DB
    const interceptData: Record<string, unknown> = {
      id: interceptId,
      user_message: userMessage,
      ai_responses: responses,
      conversation_context: conversationContext,
      visibility: 'private',
    }

    if (userId) {
      interceptData.user_id = userId
    } else if (resolvedSessionId) {
      interceptData.session_id = resolvedSessionId
    }

    await supabase.from('intercepts').insert(interceptData)

    // Increment usage counters atomically to prevent race conditions
    if (userId) {
      const isMonthlyTier = tier === 'basic' || tier === 'pro'
      if (tier === 'free' || isMonthlyTier) {
        await supabase.rpc('increment_usage', {
          p_user_id: userId,
          p_field: isMonthlyTier ? 'monthly_used' : 'daily_used',
        })
      }
    }

    console.log(JSON.stringify({
      type: 'intercept',
      userId,
      tier,
      interceptId,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({ responses })
  } catch (err) {
    if (creditDeducted && userId) {
      await refundCredit(userId, interceptId).catch((e) =>
        console.error('[intercept] refundCredit failed:', e)
      )
    }

    console.error('[Intercept Route Error]', err)
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }
}
