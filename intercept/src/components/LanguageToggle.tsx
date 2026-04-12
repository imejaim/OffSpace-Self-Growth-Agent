'use client'

import { useI18n } from '@/lib/i18n/context'
import type { Locale } from '@/lib/i18n/types'

const OPTIONS: Array<{ code: Locale; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한국어' },
]

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-bg-card)',
        padding: '2px',
      }}
    >
      {OPTIONS.map(({ code, label }) => {
        const active = locale === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--color-coral)' : 'transparent',
              color: active ? '#fff' : 'var(--color-text-muted)',
              transition: 'background 0.15s, color 0.15s',
              lineHeight: 1.2,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
