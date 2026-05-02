'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CHARACTERS } from '@/lib/teatime-data'

type FeedMessage = {
  characterId: 'kobu' | 'oh' | 'jem'
  name?: string
  content: string
}

type FeedItem = {
  id: string
  title: string
  nickname: string
  createdAt: string
  messages: FeedMessage[]
}

type ApiIntercept = {
  id: string
  nickname?: string
  user_message: string
  ai_responses: FeedMessage[]
  created_at: string
}

type LocalPublishedTopic = {
  id?: string
  title?: string
  messages?: FeedMessage[]
  savedAt?: string
}

function normalizeApiItem(item: ApiIntercept): FeedItem {
  return {
    id: item.id,
    title: item.user_message,
    nickname: item.nickname || 'Guest',
    createdAt: item.created_at,
    messages: Array.isArray(item.ai_responses) ? item.ai_responses : [],
  }
}

function loadLocalItems(): FeedItem[] {
  try {
    const raw = localStorage.getItem('intercept-public-feed')
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []

    return parsed.map((item: LocalPublishedTopic, index: number) => ({
      id: item.id || `local-public-${index}`,
      title: item.title || 'Untitled topic',
      nickname: 'Guest',
      createdAt: item.savedAt || new Date().toISOString(),
      messages: Array.isArray(item.messages) ? item.messages : [],
    }))
  } catch {
    return []
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.max(0, Math.floor(diff / 60000))
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  return `${Math.floor(hr / 24)}일 전`
}

export default function FeedView() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadFeed() {
      setLoading(true)
      setError(null)
      const localItems = loadLocalItems()

      try {
        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), 6000)
        const res = await fetch('/api/feed?limit=20', {
          cache: 'no-store',
          signal: controller.signal,
        })
        window.clearTimeout(timeoutId)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load feed')

        const apiItems = Array.isArray(data.intercepts)
          ? data.intercepts.map(normalizeApiItem)
          : []
        const seen = new Set(apiItems.map((item: FeedItem) => item.id))
        const merged = [
          ...apiItems,
          ...localItems.filter((item) => !seen.has(item.id)),
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        if (!cancelled) setItems(merged)
      } catch (err) {
        if (!cancelled) {
          setItems(localItems)
          setError(err instanceof Error ? err.message : 'Failed to load feed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFeed()

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'intercept-public-feed') {
        setItems((current) => {
          const localItems = loadLocalItems()
          const localIds = new Set(localItems.map((item) => item.id))
          return [
            ...current.filter(
              (item) => !item.id.startsWith('teatime-') && !localIds.has(item.id)
            ),
            ...localItems,
          ].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return (
    <main className="feed-view">
      <header className="feed-view-header">
        <p className="feed-view-kicker">FEED</p>
        <h1 className="feed-view-title">공개 인터셉트</h1>
      </header>

      {error && items.length > 0 && (
        <p className="feed-view-error">서버 피드를 불러오지 못해 이 브라우저의 공개 항목을 보여줍니다.</p>
      )}

      {loading ? (
        <p className="feed-view-empty">피드를 불러오는 중입니다.</p>
      ) : items.length === 0 ? (
        <p className="feed-view-empty">아직 공개된 인터셉트가 없습니다.</p>
      ) : (
        <div className="feed-card-list">
          {items.map((item) => (
            <article className="feed-card" key={item.id}>
              <div className="feed-card-meta">
                <span>{item.nickname}</span>
                <span>{relativeTime(item.createdAt)}</span>
              </div>
              <h2 className="feed-card-title">{item.title}</h2>
              <div className="feed-message-list">
                {item.messages.slice(0, 3).map((message, index) => {
                  const character = CHARACTERS[message.characterId]
                  if (!character) return null
                  return (
                    <div className="feed-message" key={`${item.id}-${message.characterId}-${index}`}>
                      <Image
                        src={character.avatar}
                        alt={message.name || character.name}
                        width={24}
                        height={24}
                        className="feed-message-avatar"
                      />
                      <div>
                        <p
                          className="feed-message-name"
                          style={{ color: character.color }}
                        >
                          {message.name || character.name}
                        </p>
                        <p className="feed-message-text">{message.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
