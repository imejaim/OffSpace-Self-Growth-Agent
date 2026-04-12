import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { getSessionInfo, type UserTier } from '@/lib/auth-helpers'
import { generateInterceptResponse } from '@/lib/ai-router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Monthly newsletter limits per tier */
function getNewsletterLimit(tier: UserTier): number | null {
  switch (tier) {
    case 'free':
      return 0
    case 'basic':
      return 5
    case 'pro':
      return null // unlimited
    case 'payperuse':
      return null
  }
}

interface TopicInput {
  title: string
  query: string
}

interface GenerateRequest {
  topics: TopicInput[]
  format?: 'brief' | 'detailed'
}

const SYSTEM_PROMPT = `You are the editorial team of INTERCEPT, an AI news platform. Generate a custom newsletter based on user-requested topics.

Your team has three members with distinct perspectives:

1. Ko-bujang (코부장) — Tech Lead. Analyzes technology implications, architecture decisions, developer ecosystem impact. Speaks with authority and insight.

2. Oh-gwajang (오과장) — Business Strategist. Covers market impact, business models, competitive landscape, and data-driven analysis. Speaks with precision and logic.

3. Jem-daeri (젬대리) — Community Scout. Captures community reactions, social media buzz, Reddit/Discord/X/YouTube discourse, and behind-the-scenes stories. Speaks with energy and casual flair.

Rules:
- For each topic, provide analysis from ALL THREE characters
- Each character's take should be 2-4 sentences
- Be informative, opinionated, and engaging
- Use English by default
- Do NOT use markdown formatting within character responses
- Return ONLY a valid JSON array, no other text

Output format — return exactly this JSON structure:
[
  {
    "title": "Topic Title",
    "content": {
      "kobu": "Ko-bujang's tech analysis...",
      "oh": "Oh-gwajang's business take...",
      "jem": "Jem-daeri's community buzz..."
    }
  }
]`

function buildUserPrompt(topics: TopicInput[], format: 'brief' | 'detailed'): string {
  const depth = format === 'brief'
    ? 'Keep each character response to 2 sentences.'
    : 'Give each character 3-4 detailed sentences with specific examples.'

  const topicList = topics
    .map((t, i) => `${i + 1}. "${t.title}" — ${t.query}`)
    .join('\n')

  return `Generate a newsletter covering these topics:\n\n${topicList}\n\n${depth}\n\nReturn the JSON array only.`
}

interface TopicOutput {
  title: string
  content: {
    kobu: string
    oh: string
    jem: string
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting (IP-based)
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitResult = await rateLimit(ip)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // Auth check — newsletter requires login
  const { userId, tier } = await getSessionInfo(request)

  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to generate newsletters.' },
      { status: 401 }
    )
  }

  // Parse request body
  let body: GenerateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request format.' },
      { status: 400 }
    )
  }

  const { topics, format = 'brief' } = body

  if (!Array.isArray(topics) || topics.length === 0 || topics.length > 10) {
    return NextResponse.json(
      { error: 'Provide between 1 and 10 topics.' },
      { status: 400 }
    )
  }

  for (const topic of topics) {
    if (!topic.title || !topic.query || typeof topic.title !== 'string' || typeof topic.query !== 'string') {
      return NextResponse.json(
        { error: 'Each topic must have a title and query string.' },
        { status: 400 }
      )
    }
  }

  if (format !== 'brief' && format !== 'detailed') {
    return NextResponse.json(
      { error: 'Format must be "brief" or "detailed".' },
      { status: 400 }
    )
  }

  // Tier-based newsletter limit check
  const limit = getNewsletterLimit(tier)

  if (limit === 0) {
    return NextResponse.json(
      { error: 'Newsletter generation is not available on the Free plan. Please upgrade to Basic or Pro.' },
      { status: 403 }
    )
  }

  if (limit !== null) {
    // Check monthly usage from DB
    const supabase = await createClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count, error: countError } = await supabase
      .from('newsletters')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart)

    if (countError) {
      console.error(JSON.stringify({ type: 'newsletter', status: 'count-error', error: countError.message }))
      return NextResponse.json(
        { error: 'Failed to check newsletter usage.' },
        { status: 500 }
      )
    }

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        { error: `Monthly newsletter limit of ${limit} reached. Upgrade to Pro for unlimited newsletters.` },
        { status: 402 }
      )
    }
  }

  // Generate newsletter via AI
  const newsletterId = crypto.randomUUID()

  let rawText: string
  try {
    rawText = await generateInterceptResponse(
      SYSTEM_PROMPT,
      buildUserPrompt(topics, format)
    )
  } catch (aiErr) {
    console.error(JSON.stringify({ type: 'newsletter', status: 'ai-error', error: String(aiErr) }))
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again later.' },
      { status: 502 }
    )
  }

  // Parse AI response
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let topicResults: TopicOutput[]
  try {
    topicResults = JSON.parse(cleaned)
  } catch {
    console.error(JSON.stringify({ type: 'newsletter', status: 'parse-error', raw: rawText.slice(0, 500) }))
    return NextResponse.json(
      { error: 'Failed to process AI response. Please try again.' },
      { status: 500 }
    )
  }

  // Save to DB
  const supabase = await createClient()
  const createdAt = new Date().toISOString()

  const { error: insertError } = await supabase.from('newsletters').insert({
    id: newsletterId,
    user_id: userId,
    topics: topicResults,
    format,
    created_at: createdAt,
  })

  if (insertError) {
    console.error(JSON.stringify({ type: 'newsletter', status: 'insert-error', error: insertError.message }))
    // Still return the generated content even if save fails
  }

  console.log(JSON.stringify({
    type: 'newsletter',
    userId,
    tier,
    newsletterId,
    topicCount: topicResults.length,
    format,
    timestamp: createdAt,
  }))

  return NextResponse.json({
    newsletter: {
      id: newsletterId,
      topics: topicResults,
      created_at: createdAt,
    },
  })
}
