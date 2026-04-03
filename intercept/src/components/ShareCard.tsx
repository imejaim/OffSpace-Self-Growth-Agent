'use client'

import { useState } from 'react'

interface ShareCardProps {
  interceptId: string
  character: string
  characterMsg: string
  userQuestion: string
  aiAnswer: string
}

const CHARACTER_COLORS: Record<string, string> = {
  코부장: 'var(--color-ko)',
  오과장: 'var(--color-oh)',
  젬대리: 'var(--color-jem)',
}

export default function ShareCard({
  interceptId,
  character,
  characterMsg,
  userQuestion,
  aiAnswer,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/${interceptId}`
      : `/share/${interceptId}`

  const ogParams = new URLSearchParams({
    character,
    characterMsg: characterMsg.slice(0, 120),
    userQuestion: userQuestion.slice(0, 120),
    aiAnswer: aiAnswer.slice(0, 150),
  })
  const ogImageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/og?${ogParams}`
      : `/api/og?${ogParams}`

  const twitterText = encodeURIComponent(
    `AI 대화에 끼어들었어요! "${userQuestion.slice(0, 60)}…" #INTERCEPT`
  )
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`

  const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=KAKAO_APP_KEY&link_ver=4.0&template_id=YOUR_TEMPLATE_ID`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const charColor = CHARACTER_COLORS[character] ?? 'var(--color-ko)'

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
      }}
    >
      <h3
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        공유하기
      </h3>

      {/* Mini preview card */}
      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
          fontSize: '0.8125rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}
      >
        {/* Character line */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span
            style={{
              background: charColor,
              color: '#fff',
              borderRadius: '9999px',
              padding: '2px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
              lineHeight: '1.6',
            }}
          >
            {character}
          </span>
          <span
            style={{
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            {characterMsg.length > 60 ? characterMsg.slice(0, 60) + '…' : characterMsg}
          </span>
        </div>

        {/* User question */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span
            style={{
              background: 'var(--color-ceo)',
              color: '#fff',
              borderRadius: '9999px',
              padding: '2px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
              lineHeight: '1.6',
            }}
          >
            나
          </span>
          <span style={{ color: 'var(--color-text)', lineHeight: 1.5 }}>
            {userQuestion.length > 60 ? userQuestion.slice(0, 60) + '…' : userQuestion}
          </span>
        </div>

        {/* OG image preview hint */}
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            paddingTop: '4px',
            borderTop: '1px dashed var(--color-border)',
          }}
        >
          SNS 공유 시 위와 같은 카드 이미지가 표시됩니다
        </div>
      </div>

      {/* Share buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Copy URL */}
        <button
          onClick={handleCopy}
          className="btn-primary"
          style={{ justifyContent: 'center', fontSize: '0.9375rem' }}
        >
          {copied ? '✓ 복사됨!' : '🔗 링크 복사'}
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Twitter/X share */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#000',
              color: '#fff',
              fontWeight: 700,
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.8')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
          >
            𝕏 트위터
          </a>

          {/* KakaoTalk share */}
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#FEE500',
              color: '#3A1D1D',
              fontWeight: 700,
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.8')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
          >
            💬 카카오
          </a>
        </div>
      </div>

      {/* Share URL display */}
      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          wordBreak: 'break-all',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {shareUrl}
      </div>

      {/* Hidden OG image preload hint */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ogImageUrl} alt="" style={{ display: 'none' }} aria-hidden="true" />
    </div>
  )
}
