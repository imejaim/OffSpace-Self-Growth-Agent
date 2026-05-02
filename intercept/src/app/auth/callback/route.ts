import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const origin = new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Server-side profile ensure — guarantees a profiles row exists before
      // the user can reach any flow that depends on it (e.g. PayPal capture).
      // The DB also has a trigger on auth.users insert (003_profile_self_heal.sql)
      // but this is a belt-and-suspenders safety net for cases where the trigger
      // is not yet deployed or the user predates it.
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const displayName =
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          user.email?.split('@')[0] ??
          'user'

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              tier: 'free',
              credits: 0,
              daily_limit: 2,
              monthly_limit: 60,
              display_name: displayName,
              nickname: displayName,
              auth_type: user.is_anonymous ? 'anonymous' : 'google',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          )

        if (upsertError) {
          console.error(
            JSON.stringify({
              type: 'auth_callback_profile_upsert_failed',
              userId: user.id,
              error: upsertError.message,
              timestamp: new Date().toISOString(),
            })
          )
        }
      }
    } else {
      console.error(
        JSON.stringify({
          type: 'auth_callback_exchange_failed',
          error: exchangeError.message,
          timestamp: new Date().toISOString(),
        })
      )
    }
  }

  return NextResponse.redirect(origin + '/')
}
