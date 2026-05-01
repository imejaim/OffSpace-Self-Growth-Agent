'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'
import { ALL_TEATIMES, CHARACTERS, localizeTeatime } from '@/lib/teatime-data'
import type { Message, Reference, Topic, TopicImage } from '@/lib/teatime-data'
import dynamic from 'next/dynamic'
import InterceptButton from '@/app/teatime/InterceptButton'
import {
  CharPositionProvider,
  useCharPositions,
} from '@/components/CharacterPositionContext'
import PretextMessage from '@/components/PretextMessage'
import { useAppRouter, ViewType } from '@/lib/router-context'

const FloatingCharacters = dynamic(
  () => import('@/components/FloatingCharacters'),
  { ssr: false }
)

function starRating(rating: number) {
  return `${'*'.repeat(rating)}${'o'.repeat(5 - rating)}`
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function ConversationMessage({ message }: { message: Message }) {
  const { t } = useI18n()
  const character = CHARACTERS[message.characterId]
  const [interceptOpen, setInterceptOpen] = useState(false)

  if (!character) return null

  const i18nKey =
    message.characterId === 'kobu'
      ? 'ko'
      : message.characterId === 'oh'
        ? 'oh'
        : 'jem'
  const i18nChar = t.characters[i18nKey]
  const displayName = i18nChar?.name ?? character.name
  const context = `${displayName}: ${message.content}`

  return (
    <PretextMessage text={message.content}>
      <div
        className="conversation-msg"
        style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            width: '4.5rem',
            flexShrink: 0,
          }}
        >
          {character.avatar && (
            <Image
              src={character.avatar}
              alt={displayName}
              width={40}
              height={40}
              className="char-avatar"
              style={{
                borderRadius: '8px',
                imageRendering: 'pixelated',
                border: '1.5px solid var(--color-border)',
              }}
            />
          )}
          <span
            className="char-name"
            style={{
              color: character.color,
              fontSize: '0.85rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.2,
            }}
          >
            <span>{displayName}</span>
          </span>
        </div>
        <span className="msg-text" style={{ alignSelf: 'center' }}>
          <InlineMarkdown text={message.content} />
        </span>
        {!interceptOpen && (
          <button
            className="intercept-hint"
            onClick={() => setInterceptOpen(true)}
            aria-label={t.teatime.interceptButton}
          >
            {t.teatime.interceptButton}
          </button>
        )}
      </div>

      {interceptOpen && (
        <InterceptButton
          messageId={message.id}
          conversationContext={context}
          characterId={message.characterId}
          onClose={() => setInterceptOpen(false)}
        />
      )}
    </PretextMessage>
  )
}

function ReferenceList({ references }: { references: Reference[] }) {
  const { t } = useI18n()
  if (references.length === 0) return null

  return (
    <div className="reference-section">
      <p className="reference-heading">{t.teatime.referenceLinks}</p>
      <ul className="reference-list">
        {references.map((reference, i) => (
          <li key={i}>
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="reference-link"
            >
              {reference.title}
            </a>
            <span className="reference-meta">
              {reference.source} | {reference.date} |{' '}
              <span className="reference-stars">{starRating(reference.rating)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TopicImages({ images }: { images: TopicImage[] }) {
  if (!images || images.length === 0) return null

  return (
    <div className={`topic-images ${images.length > 1 ? 'topic-images-mosaic' : ''}`}>
      {images.map((img, i) => (
        <figure key={i} className="topic-image-figure">
          <img src={img.src} alt={img.alt} className="topic-image" loading="lazy" />
          <figcaption className="topic-image-caption">
            {img.alt} - {img.source}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}


function TopicSection({
  topic,
  index,
  teatimeId,
  onNavigateView,
}: {
  topic: Topic
  index: number
  teatimeId: string
  onNavigateView: (view: ViewType, dir: 'left' | 'right') => void
}) {
  const { t, locale } = useI18n()
  const { viewData, updateViewData } = useAppRouter()
  const viewTopicKey = `chatter-${teatimeId}-${topic.id}`
  const chatterMessages = viewData.teatime?.[viewTopicKey] || null
  const [chatterLoading, setChatterLoading] = useState(false)
  const [chatterError, setChatterError] = useState<string | null>(null)
  const [publishLoading, setPublishLoading] = useState(false)
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const publishNavTimerRef = useRef<number | null>(null)
  const { setAnchorId, setAnchorRect } = useCharPositions()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
        }

        const rect = entry.boundingClientRect
        const center = rect.top + rect.height / 2
        const viewportHeight = window.innerHeight
        if (entry.isIntersecting && center > 0 && center < viewportHeight) {
          setAnchorId(topic.id)
          setAnchorRect(rect)
        }
      },
      { threshold: [0, 0.1, 0.5], rootMargin: '-10% 0px -40% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [setAnchorId, setAnchorRect, topic.id])

  useEffect(() => {
    return () => {
      if (publishNavTimerRef.current) {
        window.clearTimeout(publishNavTimerRef.current)
      }
    }
  }, [])

  const setChatterMessages = (messages: Message[] | null) => {
    updateViewData('teatime', { [viewTopicKey]: messages })
  }

  const runChatter = async () => {
    setChatterLoading(true)
    setChatterError(null)
    const currentTitle = topic.title
    const language = locale === 'ko' ? 'ko' : 'en'

    try {
      const res = await fetch('/api/teatime/chatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: currentTitle, language }),
      })
      const data = await res.json()
      if (!res.ok) {
        setChatterError(data.error ?? t.teatime.chatterReplaceFailed)
        return
      }
      setChatterMessages(data.messages as Message[])
    } catch {
      setChatterError(t.teatime.chatterReplaceFailed)
    } finally {
      setChatterLoading(false)
    }
  }

  const handlePublish = async (visibility: 'private' | 'public') => {
    setPublishLoading(true)
    setChatterError(null)
    const messages = chatterMessages ?? topic.messages
    const title = topic.title
    const storeKey =
      visibility === 'private' ? 'intercept-my-keep' : 'intercept-public-feed'

    try {
      const res = await fetch('/api/teatime/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          title,
          visibility,
          teatimeId,
          topicId: topic.id,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.warning) {
        setChatterError(data.error ?? data.warning ?? 'Publish failed. Please try again.')
        setPublishLoading(false)
        return
      }
    } catch {
      setChatterError('Publish failed. Please try again.')
      setPublishLoading(false)
      return
    }

    try {
      const raw = localStorage.getItem(storeKey)
      const parsed = raw ? JSON.parse(raw) : []
      const entries = Array.isArray(parsed) ? parsed : []
      const entry = {
        id: `${teatimeId}-${topic.id}-${Date.now()}`,
        teatimeId,
        topicId: topic.id,
        title,
        messages,
        images: topic.images ?? [],
        references: topic.references ?? [],
        savedAt: new Date().toISOString(),
        visibility,
      }
      const deduped = entries.filter(
        (item: { teatimeId?: string; topicId?: string } | null) =>
          !(item && item.teatimeId === teatimeId && item.topicId === topic.id)
      )
      deduped.unshift(entry)
      localStorage.setItem(storeKey, JSON.stringify(deduped))
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: storeKey,
          newValue: JSON.stringify(deduped),
        })
      )
    } catch {}

    setFlyDirection(visibility === 'private' ? 'left' : 'right')
    setToast(
      visibility === 'private' ? t.teatime.saveSuccess : t.teatime.publishSuccess
    )

    if (publishNavTimerRef.current) {
      window.clearTimeout(publishNavTimerRef.current)
    }
    publishNavTimerRef.current = window.setTimeout(() => {
      setFlyDirection(null)
      setToast(null)
      setPublishLoading(false)
      onNavigateView(
        visibility === 'private' ? 'my' : 'feed',
        visibility === 'private' ? 'left' : 'right'
      )
    }, 850) as unknown as number
  }

  const messagesToRender = chatterMessages ?? topic.messages

  return (
    <section
      ref={sectionRef}
      className={`topic-section reveal-on-scroll${
        flyDirection === 'left'
          ? ' topic-fly-out-left'
          : flyDirection === 'right'
            ? ' topic-fly-out-right'
            : ''
      }`}
    >
      {toast && (
        <div className={`topic-toast topic-toast-${flyDirection ?? 'idle'}`} role="status">
          {toast}
        </div>
      )}

      <div className="topic-heading-row">
        <div className="topic-heading topic-heading-static">
          <span
            style={{
              fontSize: '0.8rem',
              opacity: 0.6,
              marginRight: '0.5rem',
              fontFamily: 'var(--font-geist-mono)',
            }}
          >
            ISSUE #{index + 1}
          </span>
          <span style={{ flex: 1 }}>{topic.title}</span>
        </div>
        <div
          className="topic-actions-right"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <button
            type="button"
            className="chatter-button"
            onClick={runChatter}
            disabled={chatterLoading}
          >
            {chatterLoading
              ? t.teatime.chatterGenerating
              : chatterMessages
                ? t.teatime.chatterRegenerate
                : t.teatime.chatterButton}
          </button>
          {chatterMessages && (
            <button
              type="button"
              className="chatter-button chatter-button-secondary"
              onClick={() => setChatterMessages(null)}
            >
              {t.teatime.chatterRevert}
            </button>
          )}
        </div>
      </div>

      {chatterMessages && (
        <div className="chatter-ai-indicator">
          <span className="chatter-ai-pill">{t.teatime.chatterAiGenerated}</span>
        </div>
      )}
      {chatterError && (
        <div className="intercept-inline-error" role="alert">
          {chatterError}
        </div>
      )}
      {topic.images && topic.images.length > 0 && <TopicImages images={topic.images} />}
      <div
        className={`topic-messages animate-staggered${
          chatterLoading ? ' topic-messages-loading' : ''
        }`}
      >
        {messagesToRender.map((msg: Message, messageIndex: number) => (
          <div key={msg.id} className={`stagger-${Math.min(5, messageIndex + 1)}`}>
            <ConversationMessage message={msg} />
          </div>
        ))}
      </div>
      <ReferenceList references={topic.references} />
      <div className="topic-action-row">
        <button
          type="button"
          className="chatter-button chatter-button-keep"
          onClick={() => handlePublish('private')}
          disabled={publishLoading}
        >
          {t.teatime.keepButton}
        </button>
        <button
          type="button"
          className="chatter-button chatter-button-publish"
          onClick={() => handlePublish('public')}
          disabled={publishLoading}
        >
          {t.teatime.publishButton}
        </button>
      </div>
    </section>
  )
}

export default function TeatimeView() {
  const { t, locale } = useI18n()
  const { navigate } = useAppRouter()
  const teatime = localizeTeatime(ALL_TEATIMES[0], locale)
  const [jumpKey, setJumpKey] = useState(0)

  const handleHeaderClick = () => {
    setJumpKey((k) => k + 1)
    window.location.reload()
  }

  const dateLabel = new Date(teatime.date).toLocaleDateString(
    locale === 'ko' ? 'ko-KR' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'UTC',
    }
  )

  const JUMP_DELAYS = ['0ms', '150ms', '300ms'] as const

  return (
    <CharPositionProvider>
      <div className="magazine-grain" />
      <div className="teatime-perspective">
        <div className="magazine-container">
          <div className="magazine-content">
            <header
              className="teatime-header premium-glass"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }}
            >
              <div className="teatime-header-inner">
                <button
                  type="button"
                  className="teatime-pub teatime-pub-button"
                  onClick={handleHeaderClick}
                  aria-label="Refresh"
                >
                  {t.teatime.todaysTeatime}
                </button>
                <span
                  className="teatime-indicator"
                  style={{
                    margin: '0 auto',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--color-coral)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.carousel.instantPage}
                </span>
                <span className="teatime-date">{dateLabel}</span>
              </div>
            </header>
            <main className="teatime-main">
              <div className="teatime-masthead">
                <h1 className="teatime-title">{teatime.title}</h1>
                <p className="teatime-intro">{teatime.intro}</p>
                <div className="teatime-byline">
                  {(['kobu', 'oh', 'jem'] as const).map((id, charIndex) => {
                    const character = CHARACTERS[id]
                    if (!character) return null
                    const name = id === 'kobu' ? t.characters.ko.name : t.characters[id].name
                    return (
                      <span
                        key={id}
                        className="byline-char"
                        style={{
                          color: character.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {character.avatar && (
                          <Image
                            key={`${id}-${jumpKey}`}
                            src={character.avatar}
                            alt={name}
                            width={20}
                            height={20}
                            className="byline-char-avatar"
                            style={{
                              borderRadius: '3px',
                              imageRendering: 'pixelated',
                              animationDelay: JUMP_DELAYS[charIndex],
                            }}
                          />
                        )}
                        {name}
                      </span>
                    )
                  })}
                </div>
                <p className="teatime-intercept-hint">{t.teatime.interceptHint}</p>
              </div>
              <hr className="teatime-rule" />
              {teatime.topics.map((topic, index) => (
                <TopicSection
                  key={topic.id}
                  topic={topic}
                  index={index}
                  teatimeId={teatime.id}
                  onNavigateView={(view, direction) => navigate(view, direction)}
                />
              ))}
              <footer className="teatime-footer">
                <p>{t.teatime.footerDesc}</p>
              </footer>
            </main>
          </div>
        </div>
      </div>
      <FloatingCharacters />
    </CharPositionProvider>
  )
}
