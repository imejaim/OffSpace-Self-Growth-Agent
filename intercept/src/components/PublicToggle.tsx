'use client'

import { useState } from 'react'

interface PublicToggleProps {
  interceptId: string
  currentVisibility: 'public' | 'private'
  onToggle: () => void
}

export function PublicToggle({ interceptId, currentVisibility, onToggle }: PublicToggleProps) {
  const [optimistic, setOptimistic] = useState(currentVisibility)
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    const next: 'public' | 'private' = optimistic === 'public' ? 'private' : 'public'
    setOptimistic(next)
    setPending(true)
    try {
      const res = await fetch(`/api/intercepts/${interceptId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: next }),
      })
      if (!res.ok) throw new Error('Failed')
      onToggle()
    } catch {
      // Revert on failure
      setOptimistic(optimistic)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={optimistic === 'public' ? '공개 중 — 클릭해서 비공개로' : '비공개 — 클릭해서 공개로'}
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.15rem 0.4rem',
        fontSize: '0.75rem',
        cursor: pending ? 'default' : 'pointer',
        opacity: pending ? 0.5 : 1,
        color: 'var(--color-text-muted)',
        transition: 'opacity 0.15s',
      }}
    >
      {optimistic === 'public' ? '🔓' : '🔒'}
    </button>
  )
}
