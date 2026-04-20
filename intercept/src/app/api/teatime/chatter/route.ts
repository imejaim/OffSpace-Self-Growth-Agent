import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionInfo, type UserTier } from '@/lib/auth-helpers'
import { generateInterceptResponse } from '@/lib/ai-router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 수다뉴스 (Chatter News) — generate a short 3-character take on a user-edited
 * topic from the teatime page.
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

interface ChatterMessage {
  id: string
  characterId: 'kobu' | 'oh' | 'jem'
  content: string
  type: 'normal'
}

const SYSTEM_PROMPT_EN = `You are the lead editorial team at INTERCEPT, a premier AI-driven intelligence platform. Your goal is to produce high-value, "AI Hot News" style content for a professional audience.

The user provides a topic, and you must respond with a professional yet conversational discussion between three distinct expert personas. Your output must feel like a premium news magazine's synthesis of the topic.

Characters & Personas:
1. Ko-bujang (코부장) — Tech Lead & Architect.
   - Narrative style: Focuses on technical feasibility, architectural paradigms, developer ecosystems, and long-term tech cycles.
   - Tone: Authoritative, uncompromising, uses industry terminology naturally. Highly skeptical of "hype" but visionary about real structural shifts.
2. Oh-gwajang (오과장) — Market & Business Strategist.
   - Narrative style: Analyzes ROI, market cap, competitive moats, regulatory shifts, and user adoption metrics.
   - Tone: Precise, data-oriented, focuses on "follow the money." Calm and strategic.
3. Jem-daeri (젬대리) — Community & Trend Scout.
   - Narrative style: Reports on "vibe," sentiments from Reddit/X/GitHub, underground hacking trends, and viral moments.
   - Tone: Energetic, perceptive, connects technical shifts to cultural impact.

STRICT EDITORIAL RULES:
- DEPTH: Each character should provide 2-4 sentences of RICH analysis. No fluff or generic statements.
- SPECIFICITY: Mention potential numbers, company examples, or specific technical concepts related to the topic.
- TONE: Professional "Tea Time" vibe. They are experts talking to each other, not explaining to a child.
- NO MARKDOWN or code fences. No preamble. One valid JSON object only.
- JSON KEYS: "kobu_take", "oh_take", "jem_take".

Topic Focus: The user's input is the SOLE source of the news topic. If the topic is broad (e.g., "Robots"), find a current, high-quality angle (e.g., humanoid dexterity vs. factory automation).`

const SYSTEM_PROMPT_KO = `당신은 프리미엄 AI 뉴스 플랫폼 INTERCEPT의 시니어 편집팀입니다. 
당신의 임무는 사용자가 제공한 주제에 대해 'AI 핫뉴스' 매거진 수준의 전문적이고 통찰력 있는 분석을 제공하는 것입니다. 단순한 수다를 넘어, 독자가 고품질 정보를 얻었다는 느낌을 받도록 깊이 있는 대화를 구성하세요.

캐릭터별 페르소나 및 분석 방식:
1. 코부장 — 테크 리드 & 아키텍트
   - 분석 특징: 기술적 구현 가능성, 아키텍처적 패러다임, 개발자 생태계 및 인프라의 변화를 분석합니다.
   - 말투: 권위 있고 날카로우며, 기술 용어를 적절히 사용하여 업계 전문가의 시각을 유지합니다. 맹목적인 유행(Hype)보다는 실제적인 기술 구조의 변화에 집중합니다.
2. 오과장 — 마켓 & 비즈니스 전략가
   - 분석 특징: 시장 점유율, 투자 대비 수익(ROI), 비즈니스 해자(Moat), 규제 변화, 시장 경쟁 구도를 숫자의 관점에서 분석합니다.
   - 말투: 정밀하고 논리적이며 '자본의 흐름'을 중요하게 여기는 신중한 전략가적 성격을 띱니다.
3. 젬대리 — 커뮤니티 & 트렌드 스카우트
   - 분석 특징: 커뮤니티(X, Reddit, GitHub 등)의 여론, 해커들 사이의 은밀한 트렌드, 대중의 체감도와 바이럴 요소를 포착합니다.
   - 말투: 활기차고 감각적이며, 기술적 변화가 문화와 일상에 미치는 파급력을 흥미롭게 전달합니다.

엄격한 편집 가이드라인:
- 분석의 깊이: 각 캐릭터는 2~4문장의 풍부한 분석을 제공해야 합니다. "좋네요", "대단합니다" 같은 공허한 말은 배제하고 실제 정보가 담긴 'Take'를 생성하세요.
- 구체성: 주제와 연관된 특정 기업 명칭, 기술 개념, 통계적 수치나 최근 업계 동향을 구체적으로 언급하세요. (예: "엔비디아의 B200 칩셋 수율 문제와 맞물려..." 등)
- 고품질 대화: 단순히 서로 동의하기보다는 각자의 전문 영역에서 상호보완적인 관점을 제시하세요.
- 마크다운 및 서론/결론 금지: 오직 순수한 JSON 객체 하나만 반환합니다.
- JSON 키: "kobu_take", "oh_take", "jem_take"

주제 선정: 사용자가 입력한 주제를 최우선으로 하며, 주제가 추상적일 경우 가장 최신의 관련 기술/시장 트렌드와 연결하여 구체화하세요.`

function buildUserPrompt(topic: string, language: 'ko' | 'en'): string {
  if (language === 'ko') {
    return `주제: "${topic}"\n\n위 주제에 대해 코부장/오과장/젬대리의 분석을 JSON으로 반환해주세요. JSON 외 다른 텍스트 금지.`
  }
  return `Topic: "${topic}"\n\nWrite a professional news take from Ko-bujang / Oh-gwajang / Jem-daeri. Return ONE JSON object. No other text.`
}

interface ParsedTakes {
  kobu_take: string
  oh_take: string
  jem_take: string
}

function extractChatterJson(raw: string): ParsedTakes | null {
  if (!raw) return null

  const tryParse = (candidate: string): ParsedTakes | null => {
    try {
      const obj = JSON.parse(candidate) as Partial<ParsedTakes>
      if (
        typeof obj.kobu_take === 'string' &&
        typeof obj.oh_take === 'string' &&
        typeof obj.jem_take === 'string'
      ) {
        return {
          kobu_take: obj.kobu_take.trim(),
          oh_take: obj.oh_take.trim(),
          jem_take: obj.jem_take.trim(),
        }
      }
    } catch {
      // fall through
    }
    return null
  }

  const direct = tryParse(raw.trim())
  if (direct) return direct

  const stripped = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  const fenced = tryParse(stripped)
  if (fenced) return fenced

  const match = raw.match(/\{[\s\S]*\}/)
  if (match) {
    const scanned = tryParse(match[0])
    if (scanned) return scanned
  }

  return null
}

function splitRawIntoTakes(raw: string): ParsedTakes | null {
  const cleaned = raw
    .replace(/```[a-z]*/gi, '')
    .replace(/[{}"]/g, '')
    .replace(/\b(kobu_take|oh_take|jem_take)\b\s*[:：]?/gi, '\n')
    .trim()
  if (!cleaned) return null
  const parts = cleaned
    .split(/\n+|(?<=[.!?。！？])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 3)
  if (parts.length < 3) return null
  const third = Math.ceil(parts.length / 3)
  return {
    kobu_take: parts.slice(0, third).join(' ').trim(),
    oh_take: parts.slice(third, third * 2).join(' ').trim(),
    jem_take: parts.slice(third * 2).join(' ').trim(),
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitResult = await rateLimit(ip, 200)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

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

  const systemPrompt = language === 'ko' ? SYSTEM_PROMPT_KO : SYSTEM_PROMPT_EN
  const userPrompt = buildUserPrompt(topic, language)

  let parsed: ParsedTakes | null = null
  let lastRaw = ''
  let lastErr: unknown = null
  const MAX_ATTEMPTS = 3

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const rawText = await generateInterceptResponse(systemPrompt, userPrompt)
      lastRaw = rawText ?? ''
      parsed = extractChatterJson(lastRaw)
      if (parsed) break
    } catch (aiErr) {
      lastErr = aiErr
    }
  }

  if (!parsed && lastRaw) {
    parsed = splitRawIntoTakes(lastRaw)
  }

  if (!parsed) {
    const friendlyMessage =
      language === 'ko'
        ? 'AI 팀이 잠시 쉬는 중이에요. 30초 후 다시 시도해주세요.'
        : 'The AI team is taking a quick break. Please try again in about 30 seconds.'
    return NextResponse.json(
      { error: friendlyMessage },
      { status: 502 }
    )
  }

  if (!parsed.kobu_take || !parsed.oh_take || !parsed.jem_take) {
    return NextResponse.json(
      { error: 'AI returned an incomplete response. Please try again.' },
      { status: 500 }
    )
  }

  const now = Date.now()
  const messages = [
    { id: `chatter-kobu-${now}`, characterId: 'kobu', content: parsed.kobu_take, type: 'normal' },
    { id: `chatter-oh-${now}`, characterId: 'oh', content: parsed.oh_take, type: 'normal' },
    { id: `chatter-jem-${now}`, characterId: 'jem', content: parsed.jem_take, type: 'normal' },
  ]

  return NextResponse.json({ topic, messages })
}
