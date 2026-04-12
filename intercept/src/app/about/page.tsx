'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'
// SplineCharacter temporarily disabled — scene geo-restricted, causes runtime crash
// import SplineCharacter from '@/components/SplineCharacter'

export default function AboutPage() {
  const { t } = useI18n()

  const characters = [
    {
      key: 'ko' as const,
      name: t.characters.ko.name,
      role: t.characters.ko.role,
      description: t.characters.ko.description,
      color: 'var(--color-ko)',
      avatar: '/characters/Ko-bujang.svg',
    },
    {
      key: 'oh' as const,
      name: t.characters.oh.name,
      role: t.characters.oh.role,
      description: t.characters.oh.description,
      color: 'var(--color-oh)',
      avatar: '/characters/Oh-gwajang.svg',
    },
    {
      key: 'jem' as const,
      name: t.characters.jem.name,
      role: t.characters.jem.role,
      description: t.characters.jem.description,
      color: 'var(--color-jem)',
      avatar: '/characters/Jem-daeri.svg',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-xl) var(--space-lg)',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div
          style={{
            textAlign: 'center',
            paddingBottom: 'var(--space-2xl)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'var(--color-bg-muted)',
              color: 'var(--color-coral)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: 'var(--radius-pill)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-md)',
            }}
          >
            {t.about.badge}
          </div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              color: 'var(--color-coral)',
              margin: '0 0 var(--space-md)',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            {t.about.title}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-md)',
              letterSpacing: '-0.02em',
            }}
          >
            {t.about.tagline}
          </p>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: '520px',
              marginInline: 'auto',
            }}
          >
            {t.about.intro}
          </p>
        </div>

        {/* ── What is it ───────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-lg)',
              letterSpacing: '-0.02em',
            }}
          >
            {t.about.whatIsItTitle}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {t.about.steps.map((stepItem, i) => {
              const step = String(i + 1).padStart(2, '0')
              return (
                <div
                  key={step}
                  className="card"
                  style={{
                    padding: 'var(--space-lg)',
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      color: 'var(--color-coral)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {step}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 800,
                        color: 'var(--color-navy)',
                        marginBottom: '4px',
                      }}
                    >
                      {stepItem.title}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.65,
                      }}
                    >
                      {stepItem.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Team ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-lg)',
              letterSpacing: '-0.02em',
            }}
          >
            {t.about.teamTitle}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {characters.map((char) => (
              <div
                key={char.key}
                className="card"
                style={{
                  padding: 'var(--space-lg)',
                  borderLeft: `4px solid ${char.color}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <Image
                    src={char.avatar}
                    alt={char.name}
                    width={48}
                    height={48}
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      imageRendering: 'pixelated',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: char.color,
                      }}
                    >
                      {char.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600,
                        marginLeft: '8px',
                      }}
                    >
                      {char.role}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9375rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.65,
                  }}
                >
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Showcase ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-md)',
              letterSpacing: '-0.02em',
            }}
          >
            {t.about.showcaseTitle}
          </h2>
          <div
            className="card"
            style={{
              padding: 'var(--space-xl)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-xl)',
            }}
          >
            {characters.map((char) => (
              <div key={char.key} style={{ textAlign: 'center' }}>
                <Image
                  src={char.avatar}
                  alt={char.name}
                  width={80}
                  height={80}
                  style={{ imageRendering: 'pixelated', borderRadius: 8 }}
                />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: char.color, marginTop: 6 }}>
                  {char.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Offspace ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div
            className="card"
            style={{
              padding: 'var(--space-xl)',
              background: 'var(--color-navy)',
              border: 'none',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-coral)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-md)',
              }}
            >
              {t.about.madeBy}
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 var(--space-md)',
                letterSpacing: '-0.02em',
              }}
            >
              {t.about.offspaceName}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7,
              }}
            >
              {t.about.offspaceDesc}
            </p>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-xl)',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            {t.about.ctaTitle}
          </p>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-lg)',
              lineHeight: 1.6,
            }}
          >
            {t.about.ctaDesc}
          </p>
          <Link href="/teatime" className="btn-primary">
            {t.about.ctaButton}
          </Link>
        </div>

      </div>
    </div>
  )
}
