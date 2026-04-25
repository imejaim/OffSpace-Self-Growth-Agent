'use client'

import Link from 'next/link'
import { I18nProvider, useI18n } from '@/lib/i18n/context'
import { AuthProvider } from '@/components/AuthProvider'
import { LoginButton } from '@/components/LoginButton'
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
        position: 'sticky',
        top: 0,
        zIndex: 1000, // MODIFIED: Ensure header is above floating characters
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
        <Link
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
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/pricing"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-coral)',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {t.nav.pricing}
          </Link>
          <LanguageToggle />
          <LoginButton />
        </div>
      </div>
    </header>
  )
}

function FooterBar() {
  const { t } = useI18n()
  const businessInfo = {
    companyName: '오프스페이스',
    representative: '윤동호',
    registrationNumber: '801-23-01944',
    phone: '070-2876-1006',
    address: '경기도 용인시 기흥구 서천동로43번길 13, 코너',
    email: 'offspace.intercept@gmail.com',
  }

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t.footer.copyright}
          </span>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <div>상호: {businessInfo.companyName}</div>
            <div>대표자명: {businessInfo.representative}</div>
            <div>사업자등록번호: {businessInfo.registrationNumber}</div>
            <div>유선번호: {businessInfo.phone}</div>
            <div>주소: {businessInfo.address}</div>
            <div>이메일: {businessInfo.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem' }}>
          <Link href="/teatime" className="footer-link">
            {t.footer.teatime}
          </Link>
          <Link href="/about" className="footer-link">
            {t.footer.about}
          </Link>
          <Link href="/feedback" className="footer-link">
            {t.footer.feedback}
          </Link>
          <Link href="/terms" className="footer-link">
            이용약관
          </Link>
          <Link href="/privacy" className="footer-link">
            개인정보처리방침
          </Link>
          <Link href="/refund-policy" className="footer-link">
            환불정책
          </Link>
        </div>
      </div>
    </footer>
  )
}

import { AppRouterProvider } from '@/lib/router-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppRouterProvider>
          <HeaderBar />
          <CarouselNav />
          <main className="flex-1">
            {children}
          </main>
          <FooterBar />
        </AppRouterProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

// Re-export hook for convenience
export { useI18n }
