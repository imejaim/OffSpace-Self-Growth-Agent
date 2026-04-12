'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type Tier = 'guest' | 'free' | 'basic' | 'pro' | 'payperuse'

interface AuthContextValue {
  user: User | null
  session: Session | null
  tier: Tier
  credits: number
  loading: boolean
  signOut: () => Promise<void>
  updateNickname: (newNickname: string) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  tier: 'guest',
  credits: 0,
  loading: true,
  signOut: async () => {},
  updateNickname: async () => ({ success: false }),
  refreshProfile: async () => {},
})

async function fetchOrCreateProfile(
  supabase: ReturnType<typeof createClient>,
  user: User
): Promise<{ tier: Tier; credits: number }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('tier, credits')
    .eq('id', user.id)
    .single()

  if (!error && data) {
    return { tier: (data.tier as Tier) ?? 'free', credits: (data.credits as number) ?? 0 }
  }

  // No profile yet — upsert default row on first sign-in
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'user'

  await supabase.from('profiles').upsert({
    id: user.id,
    tier: 'free',
    credits: 0,
    daily_limit: 2,
    monthly_limit: 60,
    display_name: displayName,
  })

  return { tier: 'free', credits: 0 }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [tier, setTier] = useState<Tier>('guest')
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  async function loadProfile(authUser: User | null) {
    if (!authUser) {
      setTier('guest')
      setCredits(0)
      return
    }
    const profile = await fetchOrCreateProfile(supabase, authUser)
    setTier(profile.tier)
    setCredits(profile.credits)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data.user ?? null
      setUser(authUser)
      await loadProfile(authUser)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null
      setSession(session)
      setUser(authUser)
      await loadProfile(authUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setTier('guest')
    setCredits(0)
  }

  const updateNickname = async (newNickname: string) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: newNickname })
      .eq('id', user.id)
    
    if (error) return { success: false, error: error.message }
    await loadProfile(user)
    return { success: true }
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      tier, 
      credits, 
      loading, 
      signOut, 
      updateNickname, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
