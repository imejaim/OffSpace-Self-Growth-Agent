'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'
import { ALL_TEATIMES, CHARACTERS, localizeTeatime } from '@/lib/teatime-data'
import type { Message, Topic, TopicImage, Reference } from '@/lib/teatime-data'
import InterceptButton from './InterceptButton'
import FloatingCharacters from '@/components/FloatingCharacters'
import { CharPositionProvider } from '@/components/CharacterPositionContext'
import PretextMessage from '@/components/PretextMessage'

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

  // Prefer localized name/role from i18n; fall back to data file.
  // i18n uses 'ko' as the key for Ko-bujang (not 'kobu').
  const i18nKey =
    message.characterId === 'kobu'
      ? 'ko'
      : message.characterId === 'oh'
      ? 'oh'
      : message.characterId === 'jem'
      ? 'jem'
      : null
  const i18nChar = i18nKey ? t.characters[i18nKey] : null
  const displayName = i18nChar?.name ?? character.name
  const displayRole = i18nChar?.role

  const context = `${displayName}: ${message.content}`

  return (
    <PretextMessage text={message.content}>
        <div className="conversation-msg" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '4.5rem', flexShrink: 0 }}>
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
            <span className="char-name" style={{ color: character.color, fontSize: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              {displayName.includes('(') ? (
                <>
                  <span>{displayName.split(' (')[0]}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 400 }}>
                    {displayName.split(' (')[1].replace(')', '')}
                  </span>
                </>
              ) : (
                <>
                  <span>{displayName}</span>
                  {displayRole && (
                    <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 400 }}>
                      {displayRole}
                    </span>
                  )}
                </>
              )}
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
        style={{ color: 'var(--color-navy)', background: 'var(--color-bg-muted)' }}
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

  // When null, we render topic.messages (the original AI news conversation).
  // When set, we render these AI-generated messages instead (chatter mode).
  const [chatterMessages, setChatterMessages] = useState<Message[] | null>(null)
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
    const currentTitle = getCurrentTitle()
    const language = locale === 'ko' ? 'ko' : 'en'
    // Debug: log the exact topic being sent so we can verify the edited title
    // (not the original heading) is what reaches the API.
    console.log('[chatter] POST /api/teatime/chatter', {
      topicId: topic.id,
      originalTitle: topic.title,
      editedTitle: currentTitle,
      language,
    })
    try {
      const res = await fetch('/api/teatime/chatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTitle,
          language,
        }),
      })
      let data: { messages?: Message[]; error?: string; topic?: string } = {}
      try {
        data = await res.json()
      } catch (parseErr) {
        console.error('[chatter] response JSON parse failed', parseErr)
        setChatterError(`${t.teatime.chatterReplaceFailed} (bad JSON)`)
        return
      }
      console.log('[chatter] response', {
        status: res.status,
        ok: res.ok,
        echoTopic: data.topic,
        messageCount: Array.isArray(data.messages) ? data.messages.length : 0,
        error: data.error,
      })
      if (!res.ok) {
        setChatterError(
          `[${res.status}] ${data.error ?? t.teatime.chatterReplaceFailed}`
        )
        return
      }
      if (!Array.isArray(data.messages) || data.messages.length === 0) {
        setChatterError(
          `${t.teatime.chatterReplaceFailed} (empty messages)`
        )
        return
      }
      console.log('[chatter] replacing chatterMessages with', data.messages.length, 'messages')
      setChatterMessages(data.messages as Message[])
    } catch (err) {
      console.error('[chatter] fetch failed', err)
      setChatterError(
        `${t.teatime.chatterReplaceFailed} (${err instanceof Error ? err.message : 'network'})`
      )
    } finally {
      setChatterLoading(false)
    }
  }

  const revertChatter = () => {
    setChatterMessages(null)
    setChatterError(null)
  }

  const inChatterMode = chatterMessages !== null
  const messagesToRender = chatterMessages ?? topic.messages

  return (
    <section className="topic-section">
      <div className="topic-heading-row">
        <EditableTopicHeading
          storageKey={storageKey}
          originalTitle={topic.title}
          index={index}
        />
        {inChatterMode ? (
          <div className="chatter-button-group">
            <button
              type="button"
              className="chatter-button"
              onClick={runChatter}
              disabled={chatterLoading}
              title={t.teatime.chatterRegenerate}
            >
              {chatterLoading ? t.teatime.chatterGenerating : t.teatime.chatterRegenerate}
            </button>
            <button
              type="button"
              className="chatter-button chatter-button-secondary"
              onClick={revertChatter}
              disabled={chatterLoading}
              title={t.teatime.chatterRevert}
            >
              {t.teatime.chatterRevert}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="chatter-button"
            onClick={runChatter}
            disabled={chatterLoading}
          >
            {chatterLoading ? t.teatime.chatterGenerating : t.teatime.chatterButton}
          </button>
        )}
      </div>

      {inChatterMode && (
        <div className="chatter-ai-indicator">
          <span className="chatter-ai-pill">{t.teatime.chatterAiGenerated}</span>
        </div>
      )}

      {chatterError && !chatterLoading && (
        <div className="chatter-inline-error" role="alert">
          <strong>수다수다 실패:</strong> {chatterError}
        </div>
      )}

      {topic.images && topic.images.length > 0 && <TopicImages images={topic.images} />}

      <div
        className={`topic-messages${chatterLoading ? ' topic-messages-loading' : ''}`}
        aria-busy={chatterLoading}
      >
        {messagesToRender.map((msg) => (
          <ConversationMessage key={msg.id} message={msg} />
        ))}
      </div>

      <ReferenceList references={topic.references} />
    </section>
  )
}

export default function TeaTimePage() {
  const { t, locale } = useI18n()
  const teatime = localizeTeatime(ALL_TEATIMES[0], locale)

  const dateObj = new Date(teatime.date)
  const dateLabel = dateObj.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <CharPositionProvider>
    <div className="teatime-root" style={{ background: 'var(--color-bg)' }}>
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
              const i18nKey = id === 'kobu' ? 'ko' : id
              const name = t.characters[i18nKey].name
              return (
                <span key={id} className="byline-char" style={{ color: c.color, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {c.avatar && (
                    <Image
                      src={c.avatar}
                      alt={name}
                      width={20}
                      height={20}
                      style={{ borderRadius: '3px', imageRendering: 'pixelated' }}
                    />
                  )}
                  {name}
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
