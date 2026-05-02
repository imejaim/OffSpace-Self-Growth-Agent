import { createClient } from '@/lib/supabase/server'

export async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error) throw new Error(`getBalance failed: ${error.message}`)
  return data.credits as number
}

export async function deductCredit(
  userId: string,
  interceptId: string
): Promise<{ success: boolean; balance: number }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('deduct_credit', {
    p_user_id: userId,
    p_intercept_id: interceptId,
  })

  if (error) throw new Error(`deductCredit failed: ${error.message}`)
  return { success: true, balance: data as number }
}

/**
 * Ensures a profiles row exists for the given user. Used as a safety net
 * before crediting so the flow never fails with "Profile not found" if the
 * DB trigger and AuthProvider both somehow missed the user.
 *
 * Idempotent — UPSERT with ignoreDuplicates so repeated calls are no-ops.
 */
async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      tier: 'free',
      credits: 0,
      daily_limit: 2,
      monthly_limit: 60,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  if (error) {
    console.error(
      JSON.stringify({
        type: 'ensure_profile_failed',
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    )
    // Do not throw — let the caller's RPC attempt run. If the profile really
    // is missing the RPC will return a clear error; if it exists, the upsert
    // failure was a benign race.
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  provider: string,
  paymentId: string
): Promise<{ success: boolean; balance: number }> {
  const supabase = await createClient()

  // Defense-in-depth: ensure the profile row exists before calling the RPC.
  // The DB-side add_credits (003_profile_self_heal.sql) also self-heals, but
  // we keep this here so production environments running the older 001 schema
  // do not fail when a user's profile row was never written.
  await ensureProfile(supabase, userId)

  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_provider: provider,
    p_payment_id: paymentId,
  })

  if (error) throw new Error(`addCredits failed: ${error.message}`)
  return { success: true, balance: data as number }
}

export async function refundCredit(
  userId: string,
  interceptId: string
): Promise<{ success: boolean; balance: number }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('refund_credit', {
    p_user_id: userId,
    p_intercept_id: interceptId,
  })

  if (error) throw new Error(`refundCredit failed: ${error.message}`)
  return { success: true, balance: data as number }
}
