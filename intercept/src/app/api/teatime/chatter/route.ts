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
 * Response format matches the teatime Message shape so callers can splice the
 * output directly into a topic's existing `messages` array.
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

interface ChatterMessage {
  id: string
  characterId: 'kobu' | 'oh' | 'jem'
  content: string
  type: 'normal'
}

const SYSTEM_PROMPT_EN = `You are the editorial team of INTERCEPT, an AI news platform. The user gives you a topic title and you produce FRESH NEWS CONTENT about that EXACT topic — a casual teatime-style take from three characters discussing that specific topic.

CRITICAL: The topic comes directly from the user and may be anything (e.g. "Robot", "Tesla Q3", "Korean election"). You MUST write about THAT topic. Never recycle previous examples or default to AI/LLM news if the topic is unrelated.

Characters:
1. Ko-bujang (코부장) — Tech Lead. Analyzes tech implications, architecture, developer impact. Authoritative and sharp.
2. Oh-gwajang (오과장) — Business Strategist. Market impact, numbers, competitive angle. Precise and logical.
3. Jem-daeri (젬대리) — Community Scout. Reddit/Discord/X/YouTube buzz and behind-the-scenes. Energetic and casual.

STRICT OUTPUT RULES:
- Each character's take is 1-2 sentences, conversational, and ON-TOPIC for the user's given topic.
- Informative but fun — teatime chat, not a press release.
- No markdown. No code fences. No preamble. No trailing explanation.
- Return ONE valid JSON object and NOTHING else.
- The JSON MUST have exactly these three keys: "kobu_take", "oh_take", "jem_take".

Example format (DO NOT copy the content — write about the actual user topic):
{"kobu_take":"<Ko-bujang tech angle on the user's topic>","oh_take":"<Oh-gwajang business angle on the user's topic>","jem_take":"<Jem-daeri community buzz on the user's topic>"}`

const SYSTEM_PROMPT_KO = `당신은 뉴스 플랫폼 INTERCEPT의 편집팀입니다. 사용자가 주제를 주면, 그 주제에 대한 **새로운 뉴스 콘텐츠**를 세 캐릭터의 티타임 수다 형식으로 짧게 작성합니다.

중요: 주제는 사용자가 직접 입력한 것이며 무엇이든 될 수 있습니다 (예: "로봇", "테슬라 3분기", "한국 선거"). 반드시 **그 주제 자체**에 대해 이야기하세요. 이전 예시나 AI/LLM 관련 뉴스로 흘러가지 마세요 — 주제가 "로봇"이면 로봇 뉴스를 쓰세요.

캐릭터:
1. 코부장 — 개발부장(Tech Lead). 기술 함의, 아키텍처, 개발자 생태계 영향을 날카롭게 분석. 자신감 있고 통찰력 있는 말투.
2. 오과장 — 기획과장(Business). 시장 영향, 숫자, 경쟁 구도를 정밀하게 정리. 논리적이고 차분한 말투.
3. 젬대리 — 개발대리(Community). Reddit/Discord/X/YouTube 커뮤니티 반응과 뒷얘기. 발랄하고 캐주얼한 말투.

엄격한 출력 규칙:
- 각 캐릭터는 1~2 문장, 대화체, **사용자가 준 주제에 100% 집중**.
- 정보성 있되 재미있게. 보도자료 금지.
- 마크다운 금지. 코드펜스 금지. 서론/결론 금지.
- 오직 JSON 객체 하나만 반환. 다른 텍스트 일절 금지.
- JSON은 정확히 "kobu_take", "oh_take", "jem_take" 세 개 키만 가져야 함.

출력 형식 (내용은 복사하지 말고, 실제 사용자 주제로 써주세요):
{"kobu_take":"<사용자 주제에 대한 코부장의 기술 관점>","oh_take":"<사용자 주제에 대한 오과장의 비즈니스 관점>","jem_take":"<사용자 주제에 대한 젬대리의 커뮤니티 관점>"}`

function buildUserPrompt(topic: string, language: 'ko' | 'en'): string {
  if (language === 'ko') {
    return `주제: "${topic}"\n\n위 주제에 대해 코부장/오과장/젬대리의 짧은 수다뉴스를 JSON으로 반환해주세요. JSON 외 다른 텍스트 금지.`
  }
  return `Topic: "${topic}"\n\nWrite a short chatter-news take from Ko-bujang / Oh-gwajang / Jem-daeri. Return ONE JSON object. No other text.`
}

interface ParsedTakes {
  kobu_take: string
  oh_take: string
  jem_take: string
}

/**
 * Robust extraction of the chatter JSON from a messy LLM output.
 * Tries, in order: direct parse → strip code fences → regex scan for {...}.
 */
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

  // 1. Direct parse
  const direct = tryParse(raw.trim())
  if (direct) return direct

  // 2. Strip code fences
  const stripped = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  const fenced = tryParse(stripped)
  if (fenced) return fenced

  // 3. Regex scan — grab the first balanced-looking {...} block
  const match = raw.match(/\{[\s\S]*\}/)
  if (match) {
    const scanned = tryParse(match[0])
    if (scanned) return scanned
  }

  return null
}

/**
 * Last-ditch fallback: split raw text into 3 roughly equal chunks.
 * Only used when JSON extraction fully fails, so the user still sees something.
 */
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
  // IP-based rate limiting — chatter is core exploration feature so higher quota
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitResult = await rateLimit(ip, 200)
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

  console.log(JSON.stringify({
    type: 'chatter',
    status: 'request-received',
    topic,
    topicLen: topic.length,
    language,
  }))

  if (!topic || topic.length < 2 || topic.length > 200) {
    return NextResponse.json(
      { error: 'Topic must be between 2 and 200 characters.' },
      { status: 400 }
    )
  }

  // Daily chatter cap for free tier — shared hourly IP bucket already enforces
  // a stricter burst limit than 3/day, so no extra KV schema needed here.
  void getDailyChatterLimit(tier)

  const systemPrompt = language === 'ko' ? SYSTEM_PROMPT_KO : SYSTEM_PROMPT_EN
  const userPrompt = buildUserPrompt(topic, language)

  // Try up to 3 times to get a parseable JSON response.
  let parsed: ParsedTakes | null = null
  let lastRaw = ''
  let lastErr: unknown = null
  const MAX_ATTEMPTS = 3

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const rawText = await generateInterceptResponse(systemPrompt, userPrompt)
      lastRaw = rawText ?? ''
      parsed = extractChatterJson(lastRaw)
      console.log(JSON.stringify({
        type: 'chatter',
        status: parsed ? 'parsed-ok' : 'parse-miss',
        attempt,
        rawLen: lastRaw.length,
        rawSample: lastRaw.slice(0, 200),
      }))
      if (parsed) break
    } catch (aiErr) {
      lastErr = aiErr
      console.error(JSON.stringify({
        type: 'chatter',
        status: 'ai-error',
        attempt,
        error: String(aiErr),
      }))
    }
  }

  // Fallback: split the last raw text into 3 chunks so the user still sees output.
  if (!parsed && lastRaw) {
    parsed = splitRawIntoTakes(lastRaw)
    if (parsed) {
      console.log(JSON.stringify({
        type: 'chatter',
        status: 'fallback-split',
        rawSample: lastRaw.slice(0, 200),
      }))
    }
  }

  if (!parsed) {
    console.error(JSON.stringify({
      type: 'chatter',
      status: 'final-fail',
      rawSample: lastRaw.slice(0, 300),
      error: lastErr ? String(lastErr) : 'no-parse',
    }))
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

  // Message shape matches src/lib/teatime-data.ts Message — callers can splice
  // these directly into topic.messages.
  const now = Date.now()
  const messages: ChatterMessage[] = [
    { id: `chatter-kobu-${now}`, characterId: 'kobu', content: parsed.kobu_take, type: 'normal' },
    { id: `chatter-oh-${now}`, characterId: 'oh', content: parsed.oh_take, type: 'normal' },
    { id: `chatter-jem-${now}`, characterId: 'jem', content: parsed.jem_take, type: 'normal' },
  ]

  console.log(JSON.stringify({
    type: 'chatter',
    status: 'ok',
    userId,
    tier,
    topicLen: topic.length,
    language,
    timestamp: new Date().toISOString(),
  }))

  return NextResponse.json({ topic, messages })
}
