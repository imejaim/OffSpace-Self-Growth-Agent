import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Intercept ID is required' }, { status: 400 })
    }

    let body: { visibility: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { visibility } = body

    if (visibility !== 'public' && visibility !== 'private') {
      return NextResponse.json(
        { error: 'visibility must be "public" or "private"' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('intercepts')
      .update({ visibility })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('visibility')
      .single()

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Intercept not found or access denied' }, { status: 404 })
      }
      console.error('[visibility] DB error:', error)
      return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 })
    }

    return NextResponse.json({ success: true, visibility: data.visibility })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
