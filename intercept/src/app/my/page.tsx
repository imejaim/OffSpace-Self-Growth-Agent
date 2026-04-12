'use client'

import { useState, useEffect } from 'react'
import { InterceptCard } from '@/components/InterceptCard'
import { useAuth } from '@/components/AuthProvider'
import { useI18n } from '@/lib/i18n/context'

interface InterceptItem {
  id: string
  nickname: string
  avatar_url?: string | null
  user_message: string
  ai_responses: Array<{ characterId: 'kobu' | 'oh' | 'jem'; content: string }>
  created_at: string
  visibility: 'public' | 'private'
  user_id?: string
}

interface MyInterceptsResponse {
  intercepts: InterceptItem[]
  hasMore: boolean
  total: number
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<InterceptItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Fetch intercepts
  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (debouncedSearch) params.set('search', debouncedSearch)

    setLoading(true)
    setError(null)
    fetch(`/api/my/intercepts?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<MyInterceptsResponse>
      })
      .then((data) => {
        if (page === 1) {
          setItems(data.intercepts)
        } else {
          setItems((prev) => [...prev, ...data.intercepts])
        }
        setHasMore(data.hasMore)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, page, debouncedSearch])

  if (authLoading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div
          style={{
            height: 40,
            borderRadius: 8,
            background: 'var(--color-bg-muted)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          maxWidth: 680,
          margin: '4rem auto',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t.my.signInPrompt}
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: 'var(--color-coral)',
            color: '#fff',
            padding: '0.65rem 1.5rem',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          {t.my.goHome}
        </a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Heading */}
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
          📚 {t.my.title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          {t.my.subtitle}
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.my.searchPlaceholder}
          style={{
            width: '100%',
            padding: '0.55rem 0.8rem',
            fontSize: '0.875rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-muted)',
            color: 'var(--color-text)',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#fff5f5',
            border: '1px solid #ffcccc',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: 'var(--color-coral-dark)',
            marginBottom: '1rem',
          }}
        >
          {t.my.loadFailed}: {error}
        </div>
      )}

      {/* Loading */}
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
          <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
          }}
        >
          {debouncedSearch ? t.my.emptyForSearch(debouncedSearch) : t.my.emptyHint}
        </div>
      )}

      {/* List */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <InterceptCard
              key={item.id}
              intercept={{ ...item, user_id: user.id }}
              onVisibilityToggle={() => {
                // Refresh the item in-place
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, visibility: i.visibility === 'public' ? 'private' : 'public' }
                      : i
                  )
                )
              }}
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
            }}
          >
            {t.my.loadMore}
          </button>
        </div>
      )}

      {loading && items.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          {t.my.loading}
        </div>
      )}
    </div>
  )
}
