import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { sessionId: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { sessionId } = body

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('intercepts')
      .update({ user_id: user.id })
      .eq('session_id', sessionId)
      .is('user_id', null)
      .select()

    if (error) {
      console.error('[migrate-session] DB error:', error)
      return NextResponse.json({ error: 'Failed to migrate session' }, { status: 500 })
    }

    const migratedCount = data?.length ?? 0

    console.log(JSON.stringify({
      type: 'migrate-session',
      userId: user.id,
      sessionId,
      migratedCount,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({ migratedCount })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
