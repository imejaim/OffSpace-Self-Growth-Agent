import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const { success } = rateLimit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const offset = (page - 1) * limit

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('intercepts')
      .select(`
        id,
        user_message,
        ai_responses,
        created_at,
        visibility,
        profiles!inner (
          id,
          nickname,
          avatar_url
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit)

    if (error) {
      console.error('[feed] DB error:', error)
      return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
    }

    const hasMore = (data?.length ?? 0) === limit + 1
    const intercepts = hasMore ? data!.slice(0, limit) : (data ?? [])

    return NextResponse.json({ intercepts, hasMore })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
