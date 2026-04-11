'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface CreditInfo {
  credits: number
  tier: string
  dailyUsed: number
  dailyLimit: number | null
  monthlyUsed: number
  monthlyLimit: number | null
}

export default function CreditBadge() {
  const { user, loading: authLoading } = useAuth()
  const [info, setInfo] = useState<CreditInfo | null>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!user) return
    setFetching(true)
    fetch('/api/credits')
      .then((res) => (res.ok ? res.json() : null))
      .then(setInfo)
      .catch(() => null)
      .finally(() => setFetching(false))
  }, [user])

  // Guest: show static free limit
  if (!authLoading && !user) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-mono text-zinc-400">
        ⚡ 2/2 today
      </span>
    )
  }

  // Loading state
  if (authLoading || fetching || !info) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-mono text-zinc-500 animate-pulse">
        ⚡ ...
      </span>
    )
  }

  let label: string
  let isLow = false

  if (info.tier === 'free') {
    const limit = info.dailyLimit ?? 2
    const remaining = Math.max(0, limit - info.dailyUsed)
    label = `${remaining}/${limit} today`
    isLow = remaining === 0
  } else if (info.tier === 'payperuse') {
    label = `${info.credits} left`
    isLow = info.credits <= 2
  } else {
    // basic / pro subscription
    const limit = info.monthlyLimit ?? 0
    const remaining = Math.max(0, limit - info.monthlyUsed)
    label = `${remaining} left`
    isLow = remaining <= 10
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-mono',
        isLow
          ? 'bg-red-950/50 border-red-800 text-red-400'
          : 'bg-zinc-800 border-zinc-700 text-zinc-300',
      ].join(' ')}
    >
      ⚡ {label}
    </span>
  )
}
