'use client'

import { useState, useEffect } from 'react'
import { generateNickname } from '@/lib/nicknames'
import { useI18n } from '@/lib/i18n/context'

interface NicknameModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (nickname: string, sessionId: string) => void
}

function generateSessionId(): string {
  return crypto.randomUUID()
}

export function NicknameModal({ isOpen, onClose, onSubmit }: NicknameModalProps) {
  const { t } = useI18n()
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNickname(generateNickname())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    const trimmed = nickname.trim()
    if (!trimmed) return

    const sessionId = generateSessionId()
    localStorage.setItem('intercept-nickname', trimmed)
    localStorage.setItem('intercept-session-id', sessionId)
    onSubmit(trimmed, sessionId)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-4"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-hover)',
        }}
      >
        <div>
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {t.nickname.beforeIntercept}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {t.nickname.description}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
            placeholder={t.nickname.placeholder}
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            autoFocus
          />
          <button
            onClick={() => setNickname(generateNickname())}
            className="rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{
              background: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            title={t.nickname.randomTitle}
          >
            🎲
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.nickname.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!nickname.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              background: 'var(--color-coral)',
              color: '#fff',
            }}
          >
            {t.nickname.start}
          </button>
        </div>
      </div>
    </div>
  )
}
