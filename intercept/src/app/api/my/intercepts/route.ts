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
    const search = searchParams.get('search')?.trim() ?? ''
    const offset = (page - 1) * limit

    let query = supabase
      .from('intercepts')
      .select('id, user_message, ai_responses, created_at, visibility', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&')
      query = query.ilike('user_message', `%${escapedSearch}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[my/intercepts] DB error:', error)
      return NextResponse.json({ error: 'Failed to fetch intercepts' }, { status: 500 })
    }

    const total = count ?? 0
    const intercepts = data ?? []
    const hasMore = offset + intercepts.length < total

    return NextResponse.json({ intercepts, total, hasMore })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
