'use client'

import { useState, useEffect } from 'react'
import { InterceptCard } from '@/components/InterceptCard'
import { useAuth } from '@/components/AuthProvider'

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
          내 끼어들기 기록을 보려면 로그인해주세요.
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
          홈으로 돌아가기
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
          내 끼어들기 기록
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          내가 남긴 대화들을 확인하고 공개 여부를 설정하세요
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="내 끼어들기 검색..."
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
          불러오기 실패: {error}
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
          {debouncedSearch
            ? `"${debouncedSearch}"에 해당하는 기록이 없어요.`
            : '아직 끼어든 적이 없어요. 티타임에서 끼어들어 보세요!'}
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
            더 보기
          </button>
        </div>
      )}

      {loading && items.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          불러오는 중...
        </div>
      )}
    </div>
  )
}
