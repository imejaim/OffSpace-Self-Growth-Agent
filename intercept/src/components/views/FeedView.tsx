'use client'

import { useI18n } from '@/lib/i18n/context'

export default function FeedView() {
  // useI18n retained for future i18n wiring; strings are hardcoded Korean for MVP.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useI18n()

  return (
    <div
      className="view-coming-soon"
      style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1.5rem' }}
    >
      <div
        className="view-coming-soon-inner"
        style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}
      >
        <div className="view-coming-soon-badge">FEED</div>
        <h1 className="view-coming-soon-title">피드는 준비 중이에요</h1>
        <p className="view-coming-soon-lede">
          공개된 끼어들기를 모아볼 수 있는 커뮤니티 피드는 곧 열립니다.
          우선 티타임부터 제대로 세팅 중이에요.
        </p>
        <ul className="view-coming-soon-list">
          <li>공개 끼어들기 타임라인</li>
          <li>캐릭터 반응 하이라이트</li>
          <li>주제별 필터와 저장</li>
        </ul>
        <p className="view-coming-soon-foot">Coming Soon · 2026 Q2</p>
      </div>
    </div>
  )
}
