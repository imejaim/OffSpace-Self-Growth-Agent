'use client'

import { I18nProvider, useI18n } from '@/lib/i18n/context'
import { AuthProvider } from '@/components/AuthProvider'
import { LoginButton } from '@/components/LoginButton'
import { NavMenu } from '@/components/NavMenu'
import { LanguageToggle } from '@/components/LanguageToggle'
import { CarouselNav } from '@/components/CarouselNav'
import { SwipeNavigator } from '@/components/SwipeNavigator'

function HeaderBar() {
  const { t } = useI18n()
  return (
    <header
      style={{
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a
          href="/"
          style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', textDecoration: 'none' }}
        >
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'var(--color-coral)',
            }}
          >
            INTERCEPT
          </span>
          <span
            className="header-subtitle-mobile-hide"
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.01em',
            }}
          >
            {t.header.subtitle}
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LanguageToggle />
          <NavMenu />
        </div>
      </div>
    </header>
  )
}

function FooterBar() {
  const { t } = useI18n()
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {t.footer.copyright}
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/teatime" className="footer-link">
            {t.footer.teatime}
          </a>
          <a href="/about" className="footer-link">
            {t.footer.about}
          </a>
          <a href="/feedback" className="footer-link">
            {t.footer.feedback}
          </a>
        </div>
      </div>
    </footer>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <HeaderBar />
        <CarouselNav />
        <main className="flex-1">
          <SwipeNavigator>{children}</SwipeNavigator>
        </main>
        <FooterBar />
      </AuthProvider>
    </I18nProvider>
  )
}

// Re-export hook for convenience
export { useI18n }
