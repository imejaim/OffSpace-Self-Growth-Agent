'use client'

import { useState, useRef, useEffect } from 'react'
import { LoginButton } from './LoginButton'

const NAV_LINKS = [
  { href: '/teatime', label: '티타임' },
  { href: '/feed', label: '피드' },
  { href: '/my', label: '내 기록' },
  { href: '/pricing', label: '가격' },
]

export function NavMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      {/* Desktop nav links */}
      <nav
        style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}
        className="desktop-nav"
      >
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="nav-link">
            {link.label}
          </a>
        ))}
      </nav>

      {/* Login button always visible */}
      <LoginButton />

      {/* Hamburger — mobile only */}
      <div ref={menuRef} className="hamburger-wrapper" style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴 열기"
          aria-expanded={open}
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '0.3rem 0.45rem',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
          }}
          className="hamburger-btn"
        >
          {open ? (
            // X icon
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            // Hamburger icon
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hover)',
              minWidth: 160,
              padding: '0.5rem 0',
              zIndex: 100,
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.55rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
