'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import { NicknameModal } from './NicknameModal'
import { useI18n } from '@/lib/i18n/context'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.6 2.41v2h2.58c1.51-1.39 2.4-3.44 2.4-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 0 1-7.15-2.52H.9v2.06A8 8 0 0 0 8 16z" fill="#34A853"/>
      <path d="M3.57 9.54A4.8 4.8 0 0 1 3.32 8c0-.54.09-1.06.25-1.54V4.4H.9A8 8 0 0 0 0 8c0 1.29.31 2.51.9 3.6l2.67-2.06z" fill="#FBBC05"/>
      <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 0 0 .9 4.4l2.67 2.06A4.77 4.77 0 0 1 8 3.18z" fill="#EA4335"/>
    </svg>
  )
}

export function LoginButton() {
  const { user, loading, signOut, updateNickname } = useAuth()
  const { t } = useI18n()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false)
  const [isSettingNickname, setIsSettingNickname] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const handleNicknameSubmit = async (nickname: string) => {
    if (user && isSettingNickname) {
      await updateNickname(nickname)
      setIsSettingNickname(false)
    }
  }

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    t.auth.defaultUser

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined)

  if (loading) {
    return (
      <div
        className="w-8 h-8 rounded-full animate-pulse"
        style={{ background: 'var(--color-border)', minWidth: 32 }}
        aria-label="Loading..."
      />
    )
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNicknameModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {t.auth.guestOnly}
          </button>
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <GoogleIcon />
            {t.auth.signIn}
          </button>
        </div>

        <NicknameModal
          isOpen={nicknameModalOpen}
          onClose={() => setNicknameModalOpen(false)}
          onSubmit={handleNicknameSubmit}
        />
      </>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-opacity hover:opacity-80"
        style={{
          background: 'var(--color-bg-muted)',
          border: '1px solid var(--color-border)',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover border border-[rgba(0,0,0,0.05)]"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--color-coral)' }}
          >
            {(displayName[0] ?? '?').toUpperCase()}
          </div>
        )}
        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
          {displayName}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ color: 'var(--color-text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 mt-1 w-36 rounded-lg py-1 z-50"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-hover)',
          }}
        >
          <button
            onClick={() => {
              setDropdownOpen(false)
              setIsSettingNickname(true)
              setNicknameModalOpen(true)
            }}
            className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg-muted)]"
            style={{ color: 'var(--color-text)' }}
          >
            {t.auth.changeNickname}
          </button>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
          <button
            onClick={async () => { setDropdownOpen(false); await signOut() }}
            className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg-muted)]"
            style={{ color: 'var(--color-text)' }}
          >
            {t.auth.signOut}
          </button>
        </div>
      )}

      <NicknameModal
        isOpen={nicknameModalOpen}
        onClose={() => {
          setNicknameModalOpen(false)
          setIsSettingNickname(false)
        }}
        onSubmit={handleNicknameSubmit}
      />
    </div>
  )
}
