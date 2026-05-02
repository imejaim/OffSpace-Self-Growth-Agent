'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
    .select('tier, credits, display_name, nickname')
    .eq('id', user.id)
    .single()

  if (!error && data) {
    return { tier: (data.tier as Tier) ?? 'free', credits: (data.credits as number) ?? 0 }
  }

  // No profile yet — upsert default row on first sign-in.
  // Write BOTH display_name and nickname so server-side getSessionInfo
  // (which reads `nickname`) and client-side updateNickname
  // (which reads `display_name`) both see the same value.
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'user'

  await supabase.from('profiles').upsert({
    id: user.id,
    tier: 'free',
    credits: 0,
    daily_limit: 2,
    monthly_limit: 60,
    display_name: displayName,
    nickname: displayName,
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
  const router = useRouter()

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
    let mounted = true

    // Initial user fetch — unblock UI immediately, load profile in background
    supabase.auth.getUser()
      .then(async ({ data }) => {
        if (!mounted) return
        const authUser = data.user ?? null
        setUser(authUser)
        setLoading(false) // unblock UI BEFORE profile fetch
        if (authUser) {
          try {
            await loadProfile(authUser)
          } catch (err) {
            console.error('[AuthProvider] loadProfile failed:', err)
          }
        }
      })
      .catch((err) => {
        console.error('[AuthProvider] getUser failed:', err)
        if (mounted) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const authUser = session?.user ?? null
      setSession(session)
      setUser(authUser)
      setLoading(false) // unblock UI BEFORE profile fetch
      if (authUser) {
        try {
          await loadProfile(authUser)
        } catch (err) {
          console.error('[AuthProvider] loadProfile failed on auth change:', err)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    // 1) Clear local state first so UI updates immediately even if the network
    //    call below is slow or fails.
    setUser(null)
    setSession(null)
    setTier('guest')
    setCredits(0)

    // 2) Tell Supabase to clear cookies on this device. `scope: 'local'`
    //    avoids a server round-trip for revoke (which can fail silently when
    //    the token is already expired) and just wipes browser storage +
    //    cookies — exactly what we need for a UI sign-out.
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('[AuthProvider] signOut failed:', err)
    }

    // 3) Force the App Router to re-fetch every server component. Without
    //    this, server-rendered UI (header, /my, /pricing) keeps showing the
    //    stale signed-in state because Next.js does not know cookies changed.
    router.refresh()
  }

  const updateNickname = async (newNickname: string) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    // Write to BOTH columns: server-side getSessionInfo reads `nickname`,
    // existing client code reads `display_name`. Keep them in sync until
    // the schema is consolidated.
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: newNickname, nickname: newNickname })
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
