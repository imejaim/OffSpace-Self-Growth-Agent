import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionInfo } from '@/lib/auth-helpers'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/teatime/publish
 *
 * Best-effort server-side save of a teatime topic to the intercepts table when
 * the user hits "보관하기" (private) or "공개하기" (public). The source of truth
 * is actually the client's localStorage, so this endpoint is fire-and-forget:
 * DB failures return 200 with a warning rather than 5xx, to avoid breaking the
 * user-facing flow.
 */

interface PublishMessage {
  id?: string
  characterId: 'kobu' | 'oh' | 'jem'
  content: string
  type?: string
  name?: string
}

interface PublishRequest {
  messages: PublishMessage[]
  title: string
  visibility: 'private' | 'public'
  teatimeId: string
  topicId: string
  nickname?: string
}

const CHARACTER_NAMES: Record<string, string> = {
  kobu: '코부장',
  oh: '오과장',
  jem: '젬대리',
}

export async function POST(request: NextRequest) {
  // Rate limit (60/h per IP, default)
  const ip =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    'unknown'
  const { success: rateLimitOk } = await rateLimit(ip)
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  let body: PublishRequest
  try {
    body = (await request.json()) as PublishRequest
  } catch {
    return NextResponse.json(
      { error: 'Invalid request format.' },
      { status: 400 }
    )
  }

  const { messages, title, visibility, teatimeId, topicId, nickname } = body

  // Basic validation — still be lenient so fire-and-forget clients don't break
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 500) {
    return NextResponse.json(
      { error: 'Title must be a non-empty string up to 500 chars.' },
      { status: 400 }
    )
  }
  if (!Array.isArray(messages)) {
    return NextResponse.json(
      { error: 'messages must be an array.' },
      { status: 400 }
    )
  }
  const resolvedVisibility: 'private' | 'public' =
    visibility === 'public' ? 'public' : 'private'

  // Session info — anonymous allowed. NEVER trust client-sent userId/tier.
  const { userId, sessionId } = await getSessionInfo(request)

  const interceptId = crypto.randomUUID()

  // Resolve nickname — intercepts.nickname is NOT NULL
  const resolvedNickname =
    (typeof nickname === 'string' && nickname.trim()) ||
    (userId ? 'User' : 'Guest')

  const aiResponses = messages.map((m) => ({
    characterId: m.characterId,
    name: m.name || CHARACTER_NAMES[m.characterId] || m.characterId,
    content: typeof m.content === 'string' ? m.content : '',
  }))

  const interceptData: Record<string, unknown> = {
    id: interceptId,
    user_message: `[Topic: ${title.slice(0, 200)}]`,
    ai_responses: aiResponses,
    conversation_context: `Teatime: ${teatimeId ?? 'unknown'}, Topic: ${topicId ?? 'unknown'}`,
    visibility: resolvedVisibility,
    nickname: resolvedNickname,
  }

  if (userId) {
    interceptData.user_id = userId
  } else if (sessionId) {
    interceptData.session_id = sessionId
  }

  // Best-effort DB write. Never fail the request on DB error.
  let warning: string | undefined
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('intercepts').insert(interceptData)
    if (error) {
      warning = 'DB save failed'
      console.error(
        JSON.stringify({
          type: 'teatime-publish',
          status: 'db-error',
          interceptId,
          error: error.message,
          code: error.code,
        })
      )
    }
  } catch (err) {
    warning = 'DB save failed'
    console.error(
      JSON.stringify({
        type: 'teatime-publish',
        status: 'exception',
        interceptId,
        error: err instanceof Error ? err.message : String(err),
      })
    )
  }

  console.log(
    JSON.stringify({
      type: 'teatime-publish',
      status: warning ? 'ok-with-warning' : 'ok',
      userId,
      sessionId: sessionId ? `${sessionId.slice(0, 6)}…` : null,
      interceptId,
      visibility: resolvedVisibility,
      teatimeId,
      topicId,
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    })
  )

  return NextResponse.json({
    ok: true,
    interceptId,
    ...(warning ? { warning } : {}),
  })
}
