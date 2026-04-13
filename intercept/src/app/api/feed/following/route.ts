import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const offset = (page - 1) * limit

    // Fetch followed user IDs first, then query intercepts
    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (followError) {
      console.error('[feed/following] follows error:', followError)
      return NextResponse.json({ error: 'Failed to fetch following list' }, { status: 500 })
    }

    const followingIds = (followData ?? []).map((f: { following_id: string }) => f.following_id)

    if (followingIds.length === 0) {
      return NextResponse.json({ intercepts: [], hasMore: false })
    }

    const { data, error } = await supabase
      .from('intercepts')
      .select(`
        id,
        user_message,
        ai_responses,
        created_at,
        visibility,
        user_id,
        profiles!inner (
          id,
          nickname,
          avatar_url
        )
      `) // MODIFIED: Added user_id
      .eq('visibility', 'public')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit)

    if (error) {
      console.error('[feed/following] DB error:', error)
      return NextResponse.json({ error: 'Failed to fetch following feed' }, { status: 500 })
    }

    const hasMore = (data?.length ?? 0) === limit + 1
    const intercepts = hasMore ? data!.slice(0, limit) : (data ?? [])

    return NextResponse.json({ intercepts, hasMore, followingIds }) // MODIFIED: Added followingIds
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
