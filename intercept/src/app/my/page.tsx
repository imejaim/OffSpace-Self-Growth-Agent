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
  const [localItems, setLocalItems] = useState<InterceptItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load localStorage items on mount (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('intercept-my-keep')
      const parsed: InterceptItem[] = raw ? JSON.parse(raw) : []
      setLocalItems(Array.isArray(parsed) ? parsed : [])
    } catch {
      setLocalItems([])
    }
  }, [])

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
        {/* Characters row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          {[
            { src: '/characters/Ko-bujang.svg', name: '코부장', color: '#4A90D9' },
            { src: '/characters/Oh-gwajang.svg', name: '오과장', color: '#E67E22' },
            { src: '/characters/Jem-daeri.svg', name: '젬대리', color: '#27AE60' },
          ].map((char) => (
            <img
              key={char.name}
              src={char.src}
              alt={char.name}
              width={44}
              height={44}
              style={{
                width: 44,
                height: 44,
                imageRendering: 'pixelated',
                outline: `2px solid ${char.color}`,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
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
    <div className="teatime-perspective">
      <div className="magazine-container">
        {/* Left Peek: Home/Teatime */}
        <aside
          className="magazine-peek magazine-peek-left"
          onClick={() => window.location.href = '/teatime'}
          title={t.carousel.instantPagePeek}
        >
          <div className="peek-label">{t.carousel.instantPage}</div>
          <div className="peek-preview">
            <p>{t.carousel.instantPagePeek}</p>
          </div>
        </aside>

        <div className="magazine-content" style={{ padding: '2rem 1.5rem 4rem' }}>
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
      {!loading && items.length === 0 && localItems.length === 0 && !error && (
        debouncedSearch ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
            }}
          >
            {t.my.emptyForSearch(debouncedSearch)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            {/* Characters row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {[
                { src: '/characters/Ko-bujang.svg', name: '코부장', color: '#4A90D9' },
                { src: '/characters/Oh-gwajang.svg', name: '오과장', color: '#E67E22' },
                { src: '/characters/Jem-daeri.svg', name: '젬대리', color: '#27AE60' },
              ].map((char) => (
                <img
                  key={char.name}
                  src={char.src}
                  alt={char.name}
                  width={44}
                  height={44}
                  style={{
                    width: 44,
                    height: 44,
                    imageRendering: 'pixelated',
                    outline: `2px solid ${char.color}`,
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>

            {/* Empty title + desc */}
            <p
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-navy)',
                margin: '0 0 0.4rem',
              }}
            >
              {t.my.emptyTitle}
            </p>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                margin: '0 0 1.5rem',
              }}
            >
              {t.my.emptyDesc}
            </p>

            {/* CTA button */}
            <a
              href="/teatime"
              style={{
                display: 'inline-block',
                background: 'var(--color-coral)',
                color: '#fff',
                padding: '0.65rem 1.5rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                marginBottom: '2rem',
              }}
            >
              {t.my.goToTeatime}
            </a>

            {/* How-to steps */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxWidth: 320,
                margin: '0 auto',
                textAlign: 'left',
              }}
            >
              {[t.my.howStep1, t.my.howStep2, t.my.howStep3].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--color-bg-muted)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ paddingTop: 2 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* List — merge DB items + localStorage items (deduplicate by id) */}
      {(() => {
        const dbIds = new Set(items.map((i) => i.id))
        const merged = [
          ...items,
          ...localItems.filter((i) => !dbIds.has(i.id)),
        ]
        return merged.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {merged.map((item) => (
              <InterceptCard
                key={item.id}
                intercept={{ ...item, user_id: user.id }}
                onVisibilityToggle={() => {
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
        ) : null
      })()}

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

        {/* Right Peek: Feed */}
        <aside
          className="magazine-peek magazine-peek-right"
          onClick={() => window.location.href = '/feed'}
          title={t.carousel.snsPeek}
        >
          <div className="peek-label">{t.carousel.sns}</div>
          <div className="peek-preview">
            <p>{t.carousel.snsPeek}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
