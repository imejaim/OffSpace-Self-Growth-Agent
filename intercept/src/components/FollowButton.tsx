'use client'

import { useState } from 'react'

interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
  onToggle: () => void
}

export function FollowButton({ targetUserId, isFollowing, onToggle }: FollowButtonProps) {
  const [optimistic, setOptimistic] = useState(isFollowing)
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    const next = !optimistic
    setOptimistic(next)
    setPending(true)
    try {
      const res = await fetch('/api/follow', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
      if (!res.ok) throw new Error('Failed')
      onToggle()
    } catch {
      setOptimistic(optimistic)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        background: optimistic ? 'var(--color-bg-muted)' : 'var(--color-coral)',
        color: optimistic ? 'var(--color-text-muted)' : '#fff',
        border: optimistic ? '1px solid var(--color-border)' : 'none',
        borderRadius: 'var(--radius-pill)',
        padding: '0.3rem 0.85rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        cursor: pending ? 'default' : 'pointer',
        opacity: pending ? 0.6 : 1,
        transition: 'background 0.15s, opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {optimistic ? '팔로잉' : '팔로우'}
    </button>
  )
}
