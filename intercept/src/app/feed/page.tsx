'use client'

import { useState } from 'react'
import { usePollingFeed } from '@/hooks/usePollingFeed'
import { InterceptCard } from '@/components/InterceptCard'
import { useAuth } from '@/components/AuthProvider'
import { useI18n } from '@/lib/i18n/context'

type TabType = 'all' | 'following'

interface FeedItemRaw {
  id: string
  user_message: string
  ai_responses: Array<{ characterId: 'kobu' | 'oh' | 'jem'; content: string }>
  created_at: string
  visibility: 'public' | 'private'
  user_id?: string
  profiles: { id: string; nickname: string; avatar_url?: string | null } | null
}

interface FeedItem {
  id: string
  nickname: string
  avatar_url?: string | null
  user_message: string
  ai_responses: Array<{ characterId: 'kobu' | 'oh' | 'jem'; content: string }>
  created_at: string
  visibility: 'public' | 'private'
  user_id?: string
}

interface FeedResponse {
  intercepts: FeedItemRaw[]
  hasMore: boolean
}

export default function FeedPage() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth() as unknown as { isAuthenticated: boolean }
  const { user } = useAuth()
  const [tab, setTab] = useState<TabType>('all')
  const [page, setPage] = useState(1)

  const feedUrl =
    tab === 'following'
      ? `/api/feed/following?page=${page}&limit=20`
      : `/api/feed?page=${page}&limit=20`

  const { data, loading, error, refetch } = usePollingFeed<FeedResponse>(feedUrl)

  const rawItems = data?.intercepts ?? []
  const hasMore = data?.hasMore ?? false

  // Flatten nested profiles join into the shape InterceptCard expects
  const items: FeedItem[] = rawItems.map((item) => ({
    id: item.id,
    user_message: item.user_message,
    ai_responses: item.ai_responses,
    created_at: item.created_at,
    visibility: item.visibility,
    user_id: item.user_id,
    nickname: item.profiles?.nickname ?? (t.auth.defaultUser || 'Anonymous'),
    avatar_url: item.profiles?.avatar_url ?? null,
  }))

  const handleTabChange = (next: TabType) => {
    setTab(next)
    setPage(1)
  }

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
      }}
    >
      {/* Page heading */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--color-navy)',
            letterSpacing: '-0.03em',
            margin: '0 0 0.25rem',
          }}
        >
          {t.feed.title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          {t.feed.subtitle}
        </p>
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0',
        }}
      >
        {(['all', 'following'] as TabType[]).map((tType) => {
          const label = tType === 'all' ? t.feed.tabAll : t.feed.tabFollowing
          const active = tab === tType
          const needsAuth = tType === 'following' && !user
          return (
            <button
              key={tType}
              onClick={() => !needsAuth && handleTabChange(tType)}
              title={needsAuth ? t.feed.authRequired : undefined}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--color-coral)' : '2px solid transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--color-coral)' : needsAuth ? 'var(--color-border)' : 'var(--color-text-muted)',
                cursor: needsAuth ? 'default' : 'pointer',
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}

        <button
          onClick={refetch}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '0.5rem 0.25rem',
          }}
        >
          {t.feed.refresh}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: 'var(--color-coral-dark)',
            marginBottom: '1rem',
          }}
        >
          {t.feed.loadFailed}: {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && items.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-muted)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
          }}
        >
          {tab === 'following'
            ? t.feed.noFollowing
            : t.feed.noPublic}
        </div>
      )}

      {/* Feed list */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <InterceptCard
              key={item.id}
              intercept={item}
              onVisibilityToggle={refetch}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.6rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            {t.feed.loadMore}
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
