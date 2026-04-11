'use client'

import { useState } from 'react'

interface PublishResult {
  newsletterId?: string
  content?: string
  [key: string]: unknown
}

interface PublishButtonProps {
  topics: string[]
  onPublish: (result: PublishResult) => void
  disabled?: boolean
}

export function PublishButton({ topics, onPublish, disabled }: PublishButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasTopics = topics.some((t) => t.trim().length > 0)
  const isDisabled = disabled || !hasTopics || loading

  const handleClick = async () => {
    if (isDisabled) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const result = (await res.json()) as PublishResult
      onPublish(result)
    } catch (err) {
      setError((err as Error).message ?? '발행에 실패했어요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: isDisabled ? 'var(--color-border)' : 'var(--color-coral)',
          color: isDisabled ? 'var(--color-text-muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          padding: '0.7rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: isDisabled ? 'default' : 'pointer',
          transition: 'background 0.15s',
          letterSpacing: '-0.01em',
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }}
            />
            코부장 팀이 소식지를 만드는 중...
          </>
        ) : (
          '발행하기'
        )}
      </button>

      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-coral-dark)' }}>{error}</span>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
