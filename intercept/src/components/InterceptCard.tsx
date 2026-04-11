'use client'

import Image from 'next/image'
import { PublicToggle } from './PublicToggle'
import { useAuth } from './AuthProvider'

interface AiResponse {
  characterId: 'kobu' | 'oh' | 'jem'
  content: string
}

interface InterceptItem {
  id: string
  nickname: string
  avatar_url?: string | null
  user_message: string
  ai_responses: AiResponse[]
  created_at: string
  visibility: 'public' | 'private'
  user_id?: string
}

interface InterceptCardProps {
  intercept: InterceptItem
  onVisibilityToggle?: () => void
}

const CHARACTER_META: Record<string, { name: string; color: string; avatar: string }> = {
  kobu: { name: '코부장', color: 'var(--color-ko)', avatar: '/characters/Ko-bujang.svg' },
  oh:   { name: '오과장', color: 'var(--color-oh)', avatar: '/characters/Oh-gwajang.svg' },
  jem:  { name: '젬대리', color: 'var(--color-jem)', avatar: '/characters/Jem-daeri.svg' },
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return '방금 전'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  return `${day}일 전`
}

export function InterceptCard({ intercept, onVisibilityToggle }: InterceptCardProps) {
  const { user } = useAuth()
  const isOwn = user?.id === intercept.user_id

  return (
    <article
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
    >
      {/* Header: avatar + nickname + timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {intercept.avatar_url ? (
          <img
            src={intercept.avatar_url}
            alt={intercept.nickname}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-ceo)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {intercept.nickname[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
          {intercept.nickname}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {relativeTime(intercept.created_at)}
        </span>
        {isOwn && onVisibilityToggle && (
          <PublicToggle
            interceptId={intercept.id}
            currentVisibility={intercept.visibility}
            onToggle={onVisibilityToggle}
          />
        )}
      </div>

      {/* User message */}
      <div
        style={{
          fontSize: '0.9rem',
          color: 'var(--color-text)',
          background: 'var(--color-bg-muted)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.7rem',
          borderLeft: '3px solid var(--color-ceo)',
        }}
      >
        {intercept.user_message}
      </div>

      {/* AI responses */}
      {intercept.ai_responses && intercept.ai_responses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {intercept.ai_responses.map((resp, i) => {
            const meta = CHARACTER_META[resp.characterId]
            if (!meta) return null
            return (
              <div key={i} style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                <Image
                  src={meta.avatar}
                  alt={meta.name}
                  width={20}
                  height={20}
                  style={{ imageRendering: 'pixelated', borderRadius: 3, flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: meta.color }}>
                    {meta.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: '#222',
                      background: '#f7f7f7',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0 10px 10px 10px',
                      padding: '0.45rem 0.65rem',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                    }}
                  >
                    {resp.content}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}
