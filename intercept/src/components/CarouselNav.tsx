'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

type CarouselKey = 'my' | 'teatime' | 'feed'

interface TabDef {
  key: CarouselKey
  href: string
}

const TABS: TabDef[] = [
  { key: 'my', href: '/my' },
  { key: 'teatime', href: '/teatime' },
  { key: 'feed', href: '/feed' },
]

import { useAppRouter, ViewType } from '@/lib/router-context'

export function getCarouselIndex(pathname: string | ViewType): number {
  if (pathname === 'my' || pathname === '/my') return 0
  if (pathname === 'teatime' || pathname === '/teatime' || pathname === '/') return 1
  if (pathname === 'feed' || pathname === '/feed') return 2
  return -1
}

export function CarouselNav() {
  const { activeView, navigate } = useAppRouter()
  const { t } = useI18n()
  const activeIdx = getCarouselIndex(activeView)

  if (activeIdx < 0) return null

  const goto = (idx: number) => {
    if (idx < 0 || idx >= TABS.length) return
    const target = TABS[idx].key
    const direction = idx > activeIdx ? 'right' : 'left'
    navigate(target, direction)
  }

  const labelFor = (key: CarouselKey) => {
    if (key === 'my') return t.carousel.myKeep
    if (key === 'teatime') return t.carousel.instantPage
    return t.carousel.sns
  }

  return (
    <nav
      aria-label="Carousel navigation"
      className="carousel-nav premium-glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
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
                    ? '3px solid var(--color-coral)'
                    : '3px solid transparent',
                  color: active ? 'var(--color-navy)' : 'var(--color-text-muted)',
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
