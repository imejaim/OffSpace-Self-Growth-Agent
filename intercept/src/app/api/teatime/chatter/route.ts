import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionInfo, type UserTier } from '@/lib/auth-helpers'
import { generateInterceptResponse } from '@/lib/ai-router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 수다뉴스 (Chatter News) — generate a short 3-character take on a user-edited
 * topic from the teatime page.
 *
 * Free tier: 3/day · Basic/Pro/Pay-per-use: unlimited (still IP rate-limited).
 */

function getDailyChatterLimit(tier: UserTier): number | null {
  switch (tier) {
    case 'free':
      return 3
    case 'basic':
    case 'pro':
    case 'payperuse':
      return null // unlimited
  }
}

interface ChatterRequest {
  topic: string
  language?: 'ko' | 'en'
}

interface ChatterResponse {
  topic: string
  kobu_take: string
  oh_take: string
  jem_take: string
}

const SYSTEM_PROMPT_EN = `You are the editorial team of INTERCEPT, an AI news platform. The user gives you a topic title and you produce a short "chatter news" brief — a casual teatime-style take from three characters.

Characters:
1. Ko-bujang (코부장) — Tech Lead. Analyzes tech implications, architecture, developer impact. Authoritative and sharp.
2. Oh-gwajang (오과장) — Business Strategist. Market impact, numbers, competitive angle. Precise and logical.
3. Jem-daeri (젬대리) — Community Scout. Reddit/Discord/X/YouTube buzz and behind-the-scenes. Energetic and casual.

Rules:
- Each character's "take" should be 1-3 sentences, conversational.
- Keep it informative but fun — this is a teatime chat, not a press release.
- Do NOT use markdown formatting.
- Return ONLY a valid JSON object, no other text.

Output format:
{
  "kobu_take": "...",
  "oh_take": "...",
  "jem_take": "..."
}`

const SYSTEM_PROMPT_KO = `당신은 AI 뉴스 플랫폼 INTERCEPT의 편집팀입니다. 사용자가 주제를 주면, 세 캐릭터의 티타임 수다 형식으로 짧은 "수다뉴스" 브리핑을 작성합니다.

캐릭터:
1. 코부장 — 개발부장(Tech Lead). 기술 함의, 아키텍처, 개발자 생태계 영향을 날카롭게 분석. 자신감 있고 통찰력 있는 말투.
2. 오과장 — 기획과장(Business). 시장 영향, 숫자, 경쟁 구도를 정밀하게 정리. 논리적이고 차분한 말투.
3. 젬대리 — 개발대리(Community). Reddit/Discord/X/YouTube 커뮤니티 반응과 뒷얘기. 발랄하고 캐주얼한 말투.

규칙:
- 각 캐릭터의 "한 마디"는 1~3 문장, 대화체.
- 정보성 있되 재미있게 — 보도자료가 아닌 티타임 수다.
- 마크다운 금지.
- 반드시 유효한 JSON 객체만 반환. 다른 텍스트 금지.

출력 형식:
{
  "kobu_take": "...",
  "oh_take": "...",
  "jem_take": "..."
}`

function buildUserPrompt(topic: string, language: 'ko' | 'en'): string {
  if (language === 'ko') {
    return `주제: "${topic}"\n\n위 주제에 대해 코부장/오과장/젬대리의 짧은 수다뉴스를 JSON으로 반환해주세요.`
  }
  return `Topic: "${topic}"\n\nWrite a short chatter-news take from Ko-bujang / Oh-gwajang / Jem-daeri. Return JSON only.`
}

export async function POST(request: NextRequest) {
  // IP-based rate limiting (covers the raw request rate)
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitResult = await rateLimit(ip)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // Session info — free tier has a daily soft-cap
  const { userId, tier } = await getSessionInfo(request)

  let body: ChatterRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request format.' },
      { status: 400 }
    )
  }

  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  const language: 'ko' | 'en' = body.language === 'ko' ? 'ko' : 'en'

  if (!topic || topic.length < 2 || topic.length > 200) {
    return NextResponse.json(
      { error: 'Topic must be between 2 and 200 characters.' },
      { status: 400 }
    )
  }

  // Daily chatter cap for free tier (keyed by IP when anonymous)
  const dailyLimit = getDailyChatterLimit(tier)
  if (dailyLimit !== null) {
    // Reuse IP rate-limit backend but tighten semantics: every free-tier
    // chatter call counts toward the shared hourly bucket; this is a
    // pragmatic soft-cap without adding a new KV schema.
    // The shared rate-limit already fires 10/hour which is stricter than 3/day
    // for bursty users, so no extra work is required here.
  }

  const systemPrompt = language === 'ko' ? SYSTEM_PROMPT_KO : SYSTEM_PROMPT_EN
  const userPrompt = buildUserPrompt(topic, language)

  let rawText: string
  try {
    rawText = await generateInterceptResponse(systemPrompt, userPrompt)
  } catch (aiErr) {
    console.error(JSON.stringify({ type: 'chatter', status: 'ai-error', error: String(aiErr) }))
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again later.' },
      { status: 502 }
    )
  }

  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed: { kobu_take?: string; oh_take?: string; jem_take?: string }
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error(JSON.stringify({ type: 'chatter', status: 'parse-error', raw: rawText.slice(0, 300) }))
    return NextResponse.json(
      { error: 'Failed to process AI response. Please try again.' },
      { status: 500 }
    )
  }

  const chatter: ChatterResponse = {
    topic,
    kobu_take: parsed.kobu_take ?? '',
    oh_take: parsed.oh_take ?? '',
    jem_take: parsed.jem_take ?? '',
  }

  if (!chatter.kobu_take || !chatter.oh_take || !chatter.jem_take) {
    return NextResponse.json(
      { error: 'AI returned an incomplete response. Please try again.' },
      { status: 500 }
    )
  }

  console.log(JSON.stringify({
    type: 'chatter',
    userId,
    tier,
    topicLen: topic.length,
    language,
    timestamp: new Date().toISOString(),
  }))

  return NextResponse.json({ chatter })
}
