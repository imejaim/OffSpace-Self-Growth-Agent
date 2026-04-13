'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  // Always initialise from originalTitle so SSR and CSR produce identical HTML.
  // localStorage is read only after mount to avoid hydration mismatch (#418).
  const [title, setTitle] = useState<string>(originalTitle)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string>(originalTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  // On mount: hydrate from localStorage if user saved a custom title.
  // On originalTitle change (locale switch): revert to new locale title unless user has a custom title.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved && saved.trim()) {
        setTitle(saved)
        setDraft(saved)
      } else {
        setTitle(originalTitle)
        setDraft(originalTitle)
      }
    } catch {
      setTitle(originalTitle)
      setDraft(originalTitle)
    }
  }, [originalTitle, storageKey])

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
      <span style={{ fontSize: '0.8rem', opacity: 0.6, marginRight: '0.5rem', fontFamily: 'var(--font-geist-mono)' }}>
        ISSUE #{index + 1}
      </span>
      <span style={{ flex: 1 }}>{title}</span>
      <span className="topic-heading-edit-icon" aria-hidden="true" style={{ fontSize: '0.9rem', opacity: 0.4 }}>✎</span>
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
  const router = useRouter()
  const storageKey = topicEditKey(teatimeId, topic.id)

  // When null, we render topic.messages (the original AI news conversation).
  // When set, we render these AI-generated messages instead (chatter mode).
  const [chatterMessages, setChatterMessages] = useState<Message[] | null>(null)
  const [chatterLoading, setChatterLoading] = useState(false)
  const [chatterError, setChatterError] = useState<string | null>(null)
  
  const [publishLoading, setPublishLoading] = useState(false)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'saved' | 'published'>('idle')
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const publishNavTimerRef = useRef<number | null>(null)

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
    setPublishStatus('idle')
  }

  const handlePublish = async (visibility: 'private' | 'public') => {
    setPublishLoading(true)
    setPublishStatus('idle')
    const currentTitle = getCurrentTitle()
    const messages = chatterMessages ?? topic.messages

    // 1) Always save to localStorage first (MVP — works without login).
    //    Dedupe by teatimeId + topicId so the same item can't pile up.
    const storeKey = visibility === 'private' ? 'intercept-my-keep' : 'intercept-public-feed'
    try {
      const raw = localStorage.getItem(storeKey)
      const parsed = raw ? JSON.parse(raw) : []
      const arr: Array<Record<string, unknown>> = Array.isArray(parsed) ? parsed : []
      const entry = {
        id: `${teatimeId}-${topic.id}-${Date.now()}`,
        teatimeId,
        topicId: topic.id,
        title: currentTitle,
        messages,
        images: topic.images ?? [],
        references: topic.references ?? [],
        savedAt: new Date().toISOString(),
        visibility,
      }
      // Remove any previous entry for the same teatime+topic so the newest wins.
      const deduped = arr.filter(
        (it) => !(it && it.teatimeId === teatimeId && it.topicId === topic.id)
      )
      deduped.unshift(entry)
      localStorage.setItem(storeKey, JSON.stringify(deduped))
      console.log('[publish] saved to localStorage', {
        storeKey,
        entryId: entry.id,
        totalItems: deduped.length,
        visibility,
      })
      // Notify listeners in the same tab. The native `storage` event only
      // fires in OTHER tabs, so /my and /feed pages (which listen for it)
      // wouldn't otherwise notice a save made here. Dispatch manually.
      try {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: storeKey,
            newValue: JSON.stringify(deduped),
          })
        )
      } catch {
        // Some browsers reject StorageEvent construction; fall back to a CustomEvent.
        window.dispatchEvent(new Event('focus'))
      }
    } catch (storageErr) {
      console.error('[publish] localStorage save FAILED', storageErr)
    }

    // 2) Trigger Pretext-style fly-out animation (private = left to Keep, public = right to Feed)
    setFlyDirection(visibility === 'private' ? 'left' : 'right')

    // 3) Toast feedback
    const toastMsg = visibility === 'private' ? t.teatime.saveSuccess : t.teatime.publishSuccess
    setToast(toastMsg)

    // 4) Try API in background — non-fatal if it fails (localStorage already succeeded).
    //    Fire-and-forget so page navigation isn't blocked.
    void (async () => {
      try {
        await fetch('/api/teatime/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            title: currentTitle,
            visibility,
            teatimeId,
            topicId: topic.id,
          }),
        })
      } catch (err) {
        console.warn('[publish] API call failed (localStorage save still succeeded):', err)
      }
    })()

    setPublishStatus(visibility === 'private' ? 'saved' : 'published')

    // 5) After the fly-out animation finishes (~800ms), navigate to the
    //    destination page so the saved item is actually visible.
    //    Cancel any pending navigation first (prevents double-trigger on fast clicks).
    if (publishNavTimerRef.current !== null) {
      window.clearTimeout(publishNavTimerRef.current)
    }
    publishNavTimerRef.current = window.setTimeout(() => {
      publishNavTimerRef.current = null
      setFlyDirection(null)
      setToast(null)
      setPublishStatus('idle')
      setPublishLoading(false)
      router.push(visibility === 'private' ? '/my' : '/feed')
    }, 850)
  }

  const inChatterMode = chatterMessages !== null
  const messagesToRender = chatterMessages ?? topic.messages

  return (
    <section
      className={`topic-section${
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
        <EditableTopicHeading
          storageKey={storageKey}
          originalTitle={topic.title}
          index={index}
        />
        <div className="topic-actions-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {inChatterMode ? (
            <>
              <button
                type="button"
                className="chatter-button"
                onClick={runChatter}
                disabled={chatterLoading}
                title={t.teatime.chatterRegenerate}
              >
                {chatterLoading ? '...' : '↻'}
              </button>
              <button
                type="button"
                className="chatter-button chatter-button-secondary"
                onClick={revertChatter}
                disabled={chatterLoading}
                title={t.teatime.chatterRevert}
              >
                ↶
              </button>
            </>
          ) : (
            <button
              type="button"
              className="chatter-button"
              onClick={runChatter}
              disabled={chatterLoading}
              title={t.teatime.chatterButton}
            >
              {chatterLoading ? '...' : t.teatime.chatterButton}
            </button>
          )}
          
        </div>
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

      <div className="topic-action-row">
        <button
          type="button"
          className={`chatter-button chatter-button-keep keep-btn ${publishStatus === 'saved' ? 'success' : ''}`}
          onClick={() => handlePublish('private')}
          disabled={publishLoading}
          title={t.teatime.keepButton}
          style={{
            background: publishStatus === 'saved' ? 'var(--color-green)' : 'var(--color-green-light)',
            color: publishStatus === 'saved' ? 'white' : 'var(--color-green)',
            border: 'none',
            padding: '0.5rem 1.2rem',
            fontSize: '0.85rem'
          }}
        >
          {publishStatus === 'saved' ? '✓' : t.teatime.keepButton}
        </button>
        <button
          type="button"
          className={`chatter-button chatter-button-publish post-btn ${publishStatus === 'published' ? 'success' : ''}`}
          onClick={() => handlePublish('public')}
          disabled={publishLoading}
          title={t.teatime.publishButton}
          style={{
            background: publishStatus === 'published' ? 'var(--color-coral)' : 'rgba(231, 76, 60, 0.1)',
            color: publishStatus === 'published' ? 'white' : 'var(--color-coral)',
            border: 'none',
            padding: '0.5rem 1.2rem',
            fontSize: '0.85rem'
          }}
        >
          {publishStatus === 'published' ? '✓' : t.teatime.publishButton}
        </button>
      </div>
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
      <div className="teatime-perspective">
        <div className="magazine-container">
          {/* Left Peek: My Keep */}
          <aside
            className="magazine-peek magazine-peek-left"
            onClick={() => window.location.href = '/my'}
            title={t.carousel.myKeepPeek}
          >
            <div className="peek-label">{t.carousel.myKeep}</div>
            <div className="peek-preview">
              <p>{t.carousel.myKeepPeek}</p>
            </div>
          </aside>

          {/* Main Magazine: Teatime Content */}
          <div className="magazine-content">
            <header className="teatime-header">
              <div className="teatime-header-inner">
                <span className="teatime-pub">{t.teatime.offspaceTeatime}</span>
                <span className="teatime-indicator" style={{ 
                  margin: '0 auto', 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  color: 'var(--color-coral)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase'
                }}>
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
      {/* FloatingCharacters must be OUTSIDE .teatime-perspective because its
          `perspective: 1500px` creates a containing block for fixed descendants,
          which breaks `position: fixed` on .floating-overlay (chars scroll with
          the page instead of tracking the viewport). */}
      <FloatingCharacters />
    </CharPositionProvider>
  )
}
