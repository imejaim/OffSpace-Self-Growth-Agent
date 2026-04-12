'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'
import { ALL_TEATIMES, CHARACTERS } from '@/lib/teatime-data'
import type { Message, Topic, TopicImage, Reference } from '@/lib/teatime-data'
import InterceptButton from './InterceptButton'
import FloatingCharacters from '@/components/FloatingCharacters'
import { CharPositionProvider } from '@/components/CharacterPositionContext'
import PretextMessage from '@/components/PretextMessage'

interface ChatterData {
  topic: string
  kobu_take: string
  oh_take: string
  jem_take: string
}

function topicEditKey(teatimeId: string, topicId: string) {
  return `intercept-teatime-topic-edits-${teatimeId}-${topicId}`
}

function starRating(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Render **bold** markdown inline
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

  const context = `${character.name}: ${message.content}`

  return (
    <PretextMessage text={message.content}>
      <div className="conversation-line">
        <div className="conversation-msg">
          {character.avatar && (
            <Image
              src={character.avatar}
              alt={character.name}
              width={22}
              height={22}
              className="char-avatar"
              style={{
                borderRadius: '3px',
                imageRendering: 'pixelated',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            />
          )}
          <span className="char-name" style={{ color: character.color }}>
            {character.name}
          </span>
          <span className="char-role">{character.role}</span>
          <span className="msg-text">
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
      </div>
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
        {references.map((r, i) => (
          <li key={i}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="reference-link"
            >
              {r.title}
            </a>
            <span className="reference-meta">
              {r.source} · {r.date} · <span className="reference-stars">{starRating(r.rating)}</span>
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
          <img
            src={img.src}
            alt={img.alt}
            className="topic-image"
            loading="lazy"
          />
          <figcaption className="topic-image-caption">
            {img.alt} — {img.source}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function EditableTopicHeading({
  storageKey,
  originalTitle,
  index,
}: {
  storageKey: string
  originalTitle: string
  index: number
}) {
  const { t } = useI18n()
  // Lazy init reads localStorage only on client; SSR falls through to originalTitle.
  const [title, setTitle] = useState<string>(() => {
    if (typeof window === 'undefined') return originalTitle
    try {
      const saved = window.localStorage.getItem(storageKey)
      return saved && saved.trim() ? saved : originalTitle
    } catch {
      return originalTitle
    }
  })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string>(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== title) {
      setTitle(trimmed)
      try {
        localStorage.setItem(storageKey, trimmed)
      } catch {
        // ignore
      }
    } else {
      setDraft(title)
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(title)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') cancel()
        }}
        className="topic-heading topic-heading-input"
        aria-label={t.teatime.editTopicHint}
      />
    )
  }

  return (
    <button
      type="button"
      className="topic-heading topic-heading-button"
      onClick={() => setEditing(true)}
      title={t.teatime.editTopicHint}
    >
      <span>
        {index + 1}. {title}
      </span>
      <span className="topic-heading-edit-icon" aria-hidden="true">✎</span>
    </button>
  )
}

function ChatterPanel({
  data,
  loading,
  error,
  onRegenerate,
  onDismiss,
}: {
  data: ChatterData | null
  loading: boolean
  error: string | null
  onRegenerate: () => void
  onDismiss: () => void
}) {
  const { t } = useI18n()

  if (!loading && !data && !error) return null

  return (
    <div className="chatter-panel">
      <div className="chatter-panel-header">
        <span className="chatter-panel-title">{t.teatime.chatterTitle}</span>
        <div className="chatter-panel-actions">
          {data && !loading && (
            <button
              type="button"
              className="chatter-action-btn"
              onClick={onRegenerate}
            >
              {t.teatime.chatterRegenerate}
            </button>
          )}
          <button
            type="button"
            className="chatter-action-btn chatter-action-dismiss"
            onClick={onDismiss}
          >
            {t.teatime.chatterDismiss}
          </button>
        </div>
      </div>

      {loading && (
        <div className="chatter-panel-loading">
          <span className="chatter-spinner" />
          {t.teatime.chatterGenerating}
        </div>
      )}

      {error && !loading && (
        <div className="chatter-panel-error">{error}</div>
      )}

      {data && !loading && (
        <div className="chatter-panel-body">
          {(['kobu', 'oh', 'jem'] as const).map((id) => {
            const character = CHARACTERS[id]
            if (!character) return null
            const take =
              id === 'kobu' ? data.kobu_take : id === 'oh' ? data.oh_take : data.jem_take
            if (!take) return null
            return (
              <div key={id} className="chatter-line">
                {character.avatar && (
                  <Image
                    src={character.avatar}
                    alt={character.name}
                    width={22}
                    height={22}
                    className="char-avatar"
                    style={{
                      borderRadius: '3px',
                      imageRendering: 'pixelated',
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      marginTop: 2,
                    }}
                  />
                )}
                <div className="chatter-line-body">
                  <span className="char-name" style={{ color: character.color }}>
                    {character.name}
                  </span>
                  <span className="char-role">{character.role}</span>
                  <p className="chatter-take">{take}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TopicSection({
  topic,
  index,
  teatimeId,
}: {
  topic: Topic
  index: number
  teatimeId: string
}) {
  const { t, locale } = useI18n()
  const storageKey = topicEditKey(teatimeId, topic.id)

  const [chatter, setChatter] = useState<ChatterData | null>(null)
  const [chatterLoading, setChatterLoading] = useState(false)
  const [chatterError, setChatterError] = useState<string | null>(null)

  const getCurrentTitle = (): string => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved && saved.trim()) return saved
    } catch {
      // ignore
    }
    return topic.title
  }

  const runChatter = async () => {
    setChatterLoading(true)
    setChatterError(null)
    setChatter(null)
    try {
      const res = await fetch('/api/teatime/chatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: getCurrentTitle(),
          language: locale === 'ko' ? 'ko' : 'en',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setChatterError(data.error ?? t.teatime.chatterError)
        return
      }
      setChatter(data.chatter as ChatterData)
    } catch {
      setChatterError(t.teatime.chatterError)
    } finally {
      setChatterLoading(false)
    }
  }

  const dismissChatter = () => {
    setChatter(null)
    setChatterError(null)
  }

  return (
    <section className="topic-section">
      <div className="topic-heading-row">
        <EditableTopicHeading
          storageKey={storageKey}
          originalTitle={topic.title}
          index={index}
        />
        <button
          type="button"
          className="chatter-button"
          onClick={runChatter}
          disabled={chatterLoading}
        >
          {chatterLoading ? t.teatime.chatterGenerating : t.teatime.chatterButton}
        </button>
      </div>

      {topic.images && <TopicImages images={topic.images} />}

      <div className="topic-messages">
        {topic.messages.map((msg) => (
          <ConversationMessage key={msg.id} message={msg} />
        ))}
      </div>

      <ChatterPanel
        data={chatter}
        loading={chatterLoading}
        error={chatterError}
        onRegenerate={runChatter}
        onDismiss={dismissChatter}
      />

      <ReferenceList references={topic.references} />
    </section>
  )
}

export default function TeaTimePage() {
  const { t, locale } = useI18n()
  const teatime = ALL_TEATIMES[0]

  const dateObj = new Date(teatime.date)
  const dateLabel = dateObj.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <CharPositionProvider>
    <div className="teatime-root">
      <header className="teatime-header">
        <div className="teatime-header-inner">
          <span className="teatime-pub">{t.teatime.offspaceTeatime}</span>
          <span className="teatime-date">{dateLabel}</span>
        </div>
      </header>

      <main className="teatime-main">
        <div className="teatime-masthead">
          <h1 className="teatime-title">{teatime.title}</h1>
          <p className="teatime-intro">{teatime.intro}</p>
          <div className="teatime-byline">
            {(['kobu', 'oh', 'jem'] as const).map((id) => {
              const c = CHARACTERS[id]
              if (!c) return null
              return (
                <span key={id} className="byline-char" style={{ color: c.color, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {c.avatar && (
                    <Image
                      src={c.avatar}
                      alt={c.name}
                      width={20}
                      height={20}
                      style={{ borderRadius: '3px', imageRendering: 'pixelated' }}
                    />
                  )}
                  {c.name}
                </span>
              )
            })}
          </div>
          <p className="teatime-intercept-hint">
            {t.teatime.interceptHint}
          </p>
        </div>

        <hr className="teatime-rule" />

        {teatime.topics.map((topic, i) => (
          <TopicSection key={topic.id} topic={topic} index={i} teatimeId={teatime.id} />
        ))}

        <footer className="teatime-footer">
          <p>{t.teatime.footerDesc}</p>
        </footer>
      </main>

      <FloatingCharacters />
    </div>
    </CharPositionProvider>
  )
}
