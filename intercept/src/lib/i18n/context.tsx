'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Locale, Translations } from './types'
import { en } from './en'
import { ko } from './ko'

const STORAGE_KEY = 'intercept-locale'

const DICTIONARIES: Record<Locale, Translations> = { en, ko }

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: en,
})

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ko') return stored
  } catch {
    // ignore
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : ''
  if (nav && nav.startsWith('ko')) return 'ko'
  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe initial value: always 'en' to match server, then hydrate from storage.
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const initial = detectInitialLocale()
    if (initial !== 'en') setLocaleState(initial)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next
    }
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: DICTIONARIES[locale] }),
    [locale, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
