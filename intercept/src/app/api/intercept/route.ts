import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredit, refundCredit } from '@/lib/credits'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionInfo, checkInterceptAllowance } from '@/lib/auth-helpers'
import { generateInterceptResponse } from '@/lib/ai-router'
import { generateNickname } from '@/lib/nicknames'
import { getTopicById, pickText } from '@/lib/teatime-data'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `당신은 INTERCEPT라는 AI 뉴스 토론 플랫폼의 세 캐릭터입니다. 사용자가 AI 캐릭터들의 대화를 인터셉트했을 때, 해당 캐릭터들이 자연스럽게 반응해야 합니다. // MODIFIED: Rebranding '끼어들기' to '인터셉트'

캐릭터 정보 (출처 채널 분담):
1. 코부장 (kobu): 베테랑 개발 팀장. 냉철하고 기술적인 분석을 선호하지만 동료들에게는 따뜻함. 공식 블로그, arXiv, 기술 문서, 백서 등 1차 자료를 우선 인용한다.
2. 오과장 (oh): 트렌디한 기획자. 사용자 가치와 비즈니스 임팩트를 중시함. HackerNews, TechCrunch, Crunchbase, 시장 리포트 등 팩트/숫자 출처를 우선 인용한다. 차분하고 정량적인 톤.
3. 젬대리 (jem): 의욕 넘치는 주니어 개발자. 최신 기술 스택에 열광하며 선배들의 조언을 경청함. Reddit, YouTube, X.com, GitHub 같은 커뮤니티 출처를 우선 인용한다.

[엄격한 사실 가드]
- 사용자 프롬프트의 [참고 출처] 에 명시된 링크/제품명/연도/숫자/모델명 외 정보는 절대 추측하지 마라.
- references 에 없는 사실을 물으면 "제공된 출처에서 확인되지 않습니다. 검색이 필요한 질문이에요." 라고 솔직히 답하라.
- 학습 데이터로 그럴듯한 답을 합성하는 것은 거짓말로 간주된다.
- 사용자가 링크를 요청하면 [참고 출처] 의 실제 URL 만 제시하라. URL 을 지어내지 마라.
- references 에서 자기 채널과 일치하는 출처가 있으면 그걸 인용하라. 없으면 자기 채널이 비었음을 솔직히 말하고 다른 캐릭터에게 넘겨라.

응답 규칙:
- 사용자가 방금 대화를 인터셉트한 것처럼 자연스럽게 반응하세요. // MODIFIED: Rebranding '끼어들기' to '인터셉트'
- 세 캐릭터 중 질문에 가장 적합한 2명을 선택하여 대화 형식으로 응답하세요.
- 한국어로만 응답하세요.
- 마크다운 없이 순수 텍스트만 사용하세요.
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
  nickname?: string // ADDED: Nickname from user
  teatimeId?: string // ADDED: source teatime id for grounding context
  topicId?: string // ADDED: source topic id for grounding context
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

// Cap message lines fed into the prompt — protects against pathological topics
// with huge message bodies. References are cheap so we always include all of them.
const MAX_TOPIC_MESSAGES = 12

function buildTopicGroundingBlock(
  teatimeId: string | undefined,
  topicId: string | undefined
): string | null {
  const found = getTopicById(teatimeId, topicId)
  if (!found) return null

  const { teatime, topic } = found
  // Always grounded in Korean — the intercept response is Korean and the
  // archive ko strings are the canonical source of truth for grounding.
  const locale = 'ko' as const

  const category = pickText(topic.category, locale)
  const subtitle = pickText(topic.subtitle, locale)

  const characterName: Record<string, string> = {
    kobu: '코부장',
    oh: '오과장',
    jem: '젬대리',
  }

  const messages = topic.messages.slice(-MAX_TOPIC_MESSAGES).map((m) => {
    const name = characterName[m.characterId] ?? m.characterId
    return `${name}: ${pickText(m.content, locale)}`
  })

  const references = topic.references.map((r) => {
    const title = pickText(r.title, locale)
    const source = pickText(r.source, locale)
    return `- "${title}" — ${source} (${r.date}) — ${r.url}`
  })

  const lines: string[] = []
  lines.push(`[오늘 날짜] ${teatime.date}`)
  lines.push(`[토픽 카테고리] ${category} — ${subtitle}`)
  lines.push('')
  lines.push('[토픽 본문 — 캐릭터 대화 전체]')
  lines.push(...messages)
  lines.push('')
  lines.push('[참고 출처 (이 토픽에서 사용된 실제 references — 이 안에서만 사실 인용 가능)]')
  if (references.length === 0) {
    lines.push('(이 토픽에는 참고 출처가 없습니다.)')
  } else {
    lines.push(...references)
  }

  return lines.join('\n')
}

function buildUserPrompt(
  conversationContext: string,
  userMessage: string,
  characterId?: string,
  teatimeId?: string,
  topicId?: string
): string {
  const groundingBlock = buildTopicGroundingBlock(teatimeId, topicId)

  let prompt = ''
  if (groundingBlock) {
    prompt += `${groundingBlock}\n\n`
  } else {
    console.log(JSON.stringify({
      type: 'intercept-grounding',
      status: 'topic-not-found',
      teatimeId: teatimeId ?? null,
      topicId: topicId ?? null,
    }))
  }

  prompt += `[현재 대화 맥락]\n${conversationContext}\n\n[사용자의 인터셉트]\n${userMessage}` // MODIFIED: Rebranding '끼어들기' to '인터셉트'

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

  const { conversationContext, userMessage, characterId, sessionId, nickname, teatimeId, topicId } = body // MODIFIED: Added nickname + teatimeId/topicId for grounding

  // Light shape validation — both ids are optional but must be strings if present.
  // Bounded to keep prompt size sane and prevent obvious abuse.
  const safeTeatimeId =
    typeof teatimeId === 'string' && teatimeId.length > 0 && teatimeId.length <= 64
      ? teatimeId
      : undefined
  const safeTopicId =
    typeof topicId === 'string' && topicId.length > 0 && topicId.length <= 64
      ? topicId
      : undefined

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
        buildUserPrompt(conversationContext, userMessage, characterId, safeTeatimeId, safeTopicId)
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

    // Resolve nickname — intercepts.nickname is NOT NULL so we must always provide a value
    let resolvedNickname: string
    if (nickname && nickname.trim()) {
      resolvedNickname = nickname.trim()
    } else if (userId) {
      // Try to fetch display_name or nickname from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, nickname')
        .eq('id', userId)
        .single()
      resolvedNickname = profile?.display_name || profile?.nickname || 'User'
    } else {
      // Anonymous guest — use session-based or random nickname
      resolvedNickname = resolvedSessionId
        ? `guest-${resolvedSessionId.slice(0, 6)}`
        : generateNickname()
    }

    // Save intercept to DB
    const interceptData: Record<string, unknown> = {
      id: interceptId,
      user_message: userMessage,
      ai_responses: responses,
      conversation_context: conversationContext,
      visibility: 'private' as const,
      nickname: resolvedNickname,
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
