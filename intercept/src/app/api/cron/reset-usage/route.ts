import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// This route is called by the Cloudflare cron trigger (via fetch internally).
// It resets daily_used or monthly_used counters in the profiles table
// using SECURITY DEFINER Supabase RPC functions (no service_role key needed).
//
// Cron schedule (wrangler.toml):
//   "0 15 * * *"   -> daily reset   (00:00 KST = 15:00 UTC)
//   "0 15 1 * *"   -> monthly reset (00:00 KST on 1st of month)
//
// Manual setup required:
//   npx wrangler secret put CRON_SECRET
//   (set to a random 32-char string)

export async function GET(request: NextRequest) {
  // --- Auth: verify X-Cron-Secret header ---
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.log(JSON.stringify({ type: 'cron_error', error: 'CRON_SECRET not configured', timestamp: new Date().toISOString() }))
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const providedSecret = request.headers.get('x-cron-secret')
  if (providedSecret !== cronSecret) {
    console.log(JSON.stringify({ type: 'cron_unauthorized', timestamp: new Date().toISOString() }))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Validate type param ---
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type !== 'daily' && type !== 'monthly') {
    return NextResponse.json(
      { error: 'Missing or invalid ?type= param. Use "daily" or "monthly".' },
      { status: 400 }
    )
  }

  // --- Call the appropriate SECURITY DEFINER RPC ---
  try {
    const supabase = await createClient()
    const rpcName = type === 'daily' ? 'reset_daily_usage' : 'reset_monthly_usage'

    const { data, error } = await supabase.rpc(rpcName)

    if (error) {
      console.log(JSON.stringify({ type: 'cron_rpc_error', rpc: rpcName, error: error.message, timestamp: new Date().toISOString() }))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rowsAffected = typeof data === 'number' ? data : 0
    console.log(JSON.stringify({ type: 'cron_reset_success', resetType: type, rowsAffected, timestamp: new Date().toISOString() }))

    return NextResponse.json({
      ok: true,
      resetType: type,
      rowsAffected,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.log(JSON.stringify({ type: 'cron_exception', error: message, timestamp: new Date().toISOString() }))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
