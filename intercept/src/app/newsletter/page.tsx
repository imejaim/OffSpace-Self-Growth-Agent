'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'
import { useAuth } from '@/components/AuthProvider'
import { EditableTopic } from '@/components/EditableTopic'

/* ── Types ───────────────────────────────────────────────────────────── */

interface TopicInput {
  title: string
  query: string
}

interface TopicContent {
  kobu: string
  oh: string
  jem: string
}

interface TopicResult {
  title: string
  content: TopicContent
}

interface Newsletter {
  id: string
  topics: TopicResult[]
  created_at: string
}

/* ── Constants ───────────────────────────────────────────────────────── */

const DEFAULT_TOPICS: TopicInput[] = [
  { title: 'Hot News', query: 'trending AI and tech news today' },
  { title: 'My Interest', query: '' },
  { title: 'Behind-the-News', query: 'community voices from Reddit Discord X YouTube' },
]

const CHARACTERS = [
  {
    key: 'kobu' as const,
    name: '코부장',
    role: 'Tech Lead',
    avatar: '/characters/Ko-bujang.svg',
    color: 'var(--color-ko)',
  },
  {
    key: 'oh' as const,
    name: '오과장',
    role: 'Business',
    avatar: '/characters/Oh-gwajang.svg',
    color: 'var(--color-oh)',
  },
  {
    key: 'jem' as const,
    name: '젬대리',
    role: 'Community',
    avatar: '/characters/Jem-daeri.svg',
    color: 'var(--color-jem)',
  },
]

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  payperuse: 'Pay-per-use',
}

const NEWSLETTER_LIMIT: Record<string, number | null> = {
  free: 0,
  basic: 5,
  pro: null,
  payperuse: null,
}

/* ── Subcomponents ───────────────────────────────────────────────────── */

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    free: { bg: 'var(--color-bg-muted)', text: 'var(--color-text-muted)' },
    basic: { bg: '#FFF3CD', text: '#856404' },
    pro: { bg: '#D4EDDA', text: '#155724' },
    payperuse: { bg: '#CCE5FF', text: '#004085' },
  }
  const style = colors[tier] ?? colors.free
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: style.bg,
        color: style.text,
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {TIER_LABELS[tier] ?? tier}
    </span>
  )
}

function TopicCard({
  index,
  topic,
  onChange,
  disabled,
}: {
  index: number
  topic: TopicInput
  onChange: (updated: TopicInput) => void
  disabled: boolean
}) {
  const { t } = useI18n()
  const accent =
    index === 0
      ? 'var(--color-coral)'
      : index === 1
      ? 'var(--color-ko)'
      : 'var(--color-jem)'

  const labels = [t.newsletter.hotNews, t.newsletter.myInterest, t.newsletter.behindNews]
  const queryPlaceholders = [
    t.newsletter.placeholderHotNews,
    t.newsletter.placeholderInterest,
    t.newsletter.placeholderBehindNews,
  ]

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-card)',
        padding: '1.25rem 1.5rem',
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: accent,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {labels[index]}
        </span>
      </div>

      {/* Editable title */}
      <div style={{ marginBottom: '0.75rem' }}>
        <EditableTopic
          defaultTitle={topic.title}
          onSubmit={(newTitle) => onChange({ ...topic, title: newTitle })}
          disabled={disabled}
        />
      </div>

      {/* Query input — topic 2 (My Interest) is user-free; others pre-filled */}
      <input
        type="text"
        value={topic.query}
        onChange={(e) => onChange({ ...topic, query: e.target.value })}
        placeholder={queryPlaceholders[index]}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
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
  )
}

function NewsletterResult({ newsletter }: { newsletter: Newsletter }) {
  const { t, locale } = useI18n()
  return (
    <div style={{ marginTop: '2.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="section-divider" style={{ margin: 0 }} />
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--color-navy)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {t.newsletter.yourNewsletter}
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {new Date(newsletter.created_at).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        </span>
      </div>

      {/* Topics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {newsletter.topics.map((topic, i) => (
          <section
            key={i}
            style={{
              borderBottom: i < newsletter.topics.length - 1 ? '1px solid var(--color-border)' : 'none',
              paddingBottom: i < newsletter.topics.length - 1 ? '2rem' : 0,
            }}
          >
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-navy)',
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
              }}
            >
              {topic.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {CHARACTERS.map((char) => {
                const text = topic.content[char.key]
                if (!text) return null
                return (
                  <div key={char.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Image
                      src={char.avatar}
                      alt={char.name}
                      width={28}
                      height={28}
                      style={{ borderRadius: 4, imageRendering: 'pixelated', flexShrink: 0, marginTop: 2 }}
                    />
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: char.color,
                          marginRight: '0.4rem',
                        }}
                      >
                        {char.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                          marginRight: '0.5rem',
                        }}
                      >
                        ({char.role})
                      </span>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--color-text)',
                          lineHeight: 1.65,
                          margin: '0.25rem 0 0',
                        }}
                      >
                        {text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────────────── */

export default function NewsletterPage() {
  const { t } = useI18n()
  const { user, tier: rawTier, loading: authLoading } = useAuth()
  // 'guest' is not a valid API tier — map it to 'free'
  const tier = rawTier === 'guest' ? 'free' : rawTier

  const [topics, setTopics] = useState<TopicInput[]>(DEFAULT_TOPICS)
  const [format, setFormat] = useState<'brief' | 'detailed'>('brief')
  const [generating, setGenerating] = useState(false)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [error, setError] = useState<string | null>(null)

  const newsletterLimit = NEWSLETTER_LIMIT[tier] ?? null
  const canGenerate = newsletterLimit === null || newsletterLimit > 0

  function updateTopic(index: number, updated: TopicInput) {
    setTopics((prev) => prev.map((t, i) => (i === index ? updated : t)))
  }

  async function handleGenerate() {
    if (!user) return
    setGenerating(true)
    setError(null)
    setNewsletter(null)

    try {
      const res = await fetch('/api/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics, format }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`)
        return
      }

      setNewsletter(data.newsletter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  /* ── Loading ── */
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

  /* ── Not logged in ── */
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
        <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>
          <Image
            src="/characters/Ko-bujang.svg"
            alt="코부장"
            width={56}
            height={56}
            style={{ imageRendering: 'pixelated', borderRadius: 8, display: 'inline-block' }}
          />
        </div>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--color-navy)',
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}
        >
          {t.newsletter.signInRequired}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t.newsletter.signInDesc}
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
          {t.newsletter.goHome}
        </a>
      </div>
    )
  }

  /* ── Free tier wall ── */
  if (!canGenerate) {
    return (
      <div
        style={{
          maxWidth: 680,
          margin: '4rem auto',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--color-navy)',
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}
        >
          {t.newsletter.paidFeature}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t.newsletter.upgradeDesc}
        </p>
        <a
          href="/pricing"
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
          {t.newsletter.seePricing}
        </a>
      </div>
    )
  }

  /* ── Main UI ── */
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: 'var(--color-navy)',
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            {t.newsletter.title}
          </h1>
          <TierBadge tier={tier} />
          {newsletterLimit !== null && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginLeft: 'auto',
              }}
            >
              {t.newsletter.remaining(newsletterLimit)}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          {t.newsletter.subtitle}
        </p>
      </div>

      {/* Topic cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {topics.map((topic, i) => (
          <TopicCard
            key={i}
            index={i}
            topic={topic}
            onChange={(updated) => updateTopic(i, updated)}
            disabled={generating}
          />
        ))}
      </div>

      {/* Format selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {t.newsletter.format}
        </span>
        {(['brief', 'detailed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            disabled={generating}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1.5px solid',
              cursor: 'pointer',
              transition: 'all 0.15s',
              borderColor: format === f ? 'var(--color-navy)' : 'var(--color-border)',
              background: format === f ? 'var(--color-navy)' : 'transparent',
              color: format === f ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {f === 'brief' ? t.newsletter.brief : t.newsletter.detailed}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#fff5f5',
            border: '1px solid #ffcccc',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--color-coral-dark)',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating || topics.some((t) => !t.query.trim())}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: generating ? 'var(--color-text-muted)' : 'var(--color-coral)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: generating ? 'default' : 'pointer',
          letterSpacing: '-0.01em',
          transition: 'background 0.15s, transform 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {generating ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }}
            />
            {t.newsletter.generating}
          </>
        ) : (
          t.newsletter.generate
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Result */}
      {newsletter && <NewsletterResult newsletter={newsletter} />}
    </div>
  )
}
