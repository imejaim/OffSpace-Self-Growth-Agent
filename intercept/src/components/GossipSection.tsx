'use client'

import Image from 'next/image'

interface GossipMessage {
  id: string
  source: 'reddit' | 'discord' | 'x' | 'youtube' | string
  content: string
  url?: string
}

interface GossipSectionProps {
  messages: GossipMessage[]
  loading?: boolean
}

const SOURCE_LABEL: Record<string, string> = {
  reddit: 'Reddit',
  discord: 'Discord',
  x: 'X (Twitter)',
  youtube: 'YouTube',
}

export function GossipSection({ messages, loading }: GossipSectionProps) {
  return (
    <section
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        borderLeft: '3px solid var(--color-jem)',
      }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Image
          src="/characters/Jem-daeri.svg"
          alt="젬대리"
          width={24}
          height={24}
          style={{ imageRendering: 'pixelated', borderRadius: 3 }}
        />
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-jem)',
            letterSpacing: '-0.01em',
          }}
        >
          뒷담화 뉴스
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          by 젬대리
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            padding: '0.5rem 0',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              border: '2px solid var(--color-jem)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          젬대리가 커뮤니티를 뒤지는 중...
        </div>
      )}

      {/* Messages */}
      {!loading && messages.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          아직 뒷담화가 없어요.
        </p>
      )}

      {!loading && messages.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.map((msg) => (
            <li
              key={msg.id}
              style={{
                background: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-text)',
              }}
            >
              <div style={{ marginBottom: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--color-jem)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {SOURCE_LABEL[msg.source] ?? msg.source}
                </span>
              </div>
              {msg.url ? (
                <a
                  href={msg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  {msg.content}
                </a>
              ) : (
                msg.content
              )}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  )
}
