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

export async function addCredits(
  userId: string,
  amount: number,
  provider: string,
  paymentId: string
): Promise<{ success: boolean; balance: number }> {
  const supabase = await createClient()
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
