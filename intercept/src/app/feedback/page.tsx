'use client'

import { useState } from 'react'

const FEEDBACK_TYPES = ['기능 제안', '버그 신고', '기타'] as const

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [type, setType] = useState<string>(FEEDBACK_TYPES[0])
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-xl) var(--space-lg)',
        }}
      >
        <div
          className="card"
          style={{
            padding: 'var(--space-2xl)',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>☕</div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            소중한 피드백 감사합니다!
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-xl)',
            }}
          >
            보내주신 의견은 INTERCEPT를 더 좋게 만드는 데 소중히 사용하겠습니다.
          </p>
          <a href="/teatime" className="btn-primary">
            티타임 바로가기 →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-3xl) var(--space-lg)',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--color-navy)',
              margin: '0 0 6px',
              letterSpacing: '-0.03em',
            }}
          >
            피드백 보내기
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0 }}>
            INTERCEPT를 더 좋게 만들 아이디어가 있다면 알려주세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="card"
            style={{
              padding: 'var(--space-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-lg)',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
                이름 <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>(선택)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="익명도 괜찮아요"
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9375rem', color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
                피드백 유형
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9375rem', color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', cursor: 'pointer' }}
              >
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
                내용 <span style={{ color: 'var(--color-coral)' }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="어떤 점이 좋았나요? 어떤 기능이 있으면 좋겠나요?"
                rows={5}
                required
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9375rem', color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: content.length >= 450 ? 'var(--color-coral)' : 'var(--color-text-muted)', marginTop: '4px' }}>
                {content.length}/500
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!content.trim()}
              style={{ justifyContent: 'center', fontSize: '1rem', opacity: content.trim() ? 1 : 0.5, cursor: content.trim() ? 'pointer' : 'not-allowed' }}
            >
              피드백 보내기
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <a href="/teatime" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-coral)' }}>
            티타임 바로가기 →
          </a>
        </div>
      </div>
    </div>
  )
}
