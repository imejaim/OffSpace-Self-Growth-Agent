'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

type CarouselKey = 'my' | 'teatime' | 'feed'

interface TabDef {
  key: CarouselKey
  href: string
  icon: string
}

const TABS: TabDef[] = [
  { key: 'my', href: '/my', icon: '📚' },
  { key: 'teatime', href: '/teatime', icon: '⚡' },
  { key: 'feed', href: '/feed', icon: '💬' },
]

export function getCarouselIndex(pathname: string | null): number {
  if (!pathname) return -1
  if (pathname.startsWith('/my')) return 0
  if (pathname.startsWith('/teatime')) return 1
  if (pathname.startsWith('/feed')) return 2
  return -1
}

export function CarouselNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()
  const activeIdx = getCarouselIndex(pathname)

  if (activeIdx < 0) return null

  const goto = (idx: number) => {
    if (idx < 0 || idx >= TABS.length) return
    router.push(TABS[idx].href)
  }

  const labelFor = (key: CarouselKey) => {
    if (key === 'my') return t.carousel.myKeep
    if (key === 'teatime') return t.carousel.instantPage
    return t.carousel.sns
  }

  return (
    <nav
      aria-label="Carousel navigation"
      className="carousel-nav"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'saturate(140%) blur(6px)',
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0 0.75rem',
          display: 'flex',
          alignItems: 'stretch',
          gap: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => goto(activeIdx - 1)}
          disabled={activeIdx === 0}
          aria-label={t.carousel.prevPage}
          className="carousel-arrow"
          style={{
            flex: '0 0 auto',
            background: 'transparent',
            border: 'none',
            padding: '0 0.5rem',
            fontSize: '1.1rem',
            color: activeIdx === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
            cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          ◀
        </button>
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          {TABS.map((tab, idx) => {
            const active = idx === activeIdx
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => goto(idx)}
                aria-current={active ? 'page' : undefined}
                className={`carousel-tab${active ? ' carousel-tab-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.65rem 0.3rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active
                    ? '2px solid var(--color-coral)'
                    : '2px solid transparent',
                  color: active ? 'var(--color-coral)' : 'var(--color-text-muted)',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.82rem',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontSize: '0.95rem',
                    imageRendering: 'pixelated',
                  }}
                >
                  {tab.icon}
                </span>
                <span className="carousel-tab-label">{labelFor(tab.key)}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => goto(activeIdx + 1)}
          disabled={activeIdx === TABS.length - 1}
          aria-label={t.carousel.nextPage}
          className="carousel-arrow"
          style={{
            flex: '0 0 auto',
            background: 'transparent',
            border: 'none',
            padding: '0 0.5rem',
            fontSize: '1.1rem',
            color:
              activeIdx === TABS.length - 1
                ? 'var(--color-border)'
                : 'var(--color-text-muted)',
            cursor: activeIdx === TABS.length - 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          ▶
        </button>
      </div>
    </nav>
  )
}
