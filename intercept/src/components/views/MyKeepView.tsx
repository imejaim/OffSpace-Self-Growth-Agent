'use client'

import { useI18n } from '@/lib/i18n/context'

export default function MyKeepView() {
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
        <div className="view-coming-soon-badge">MY KEEP</div>
        <h1 className="view-coming-soon-title">내 보관함은 준비 중이에요</h1>
        <p className="view-coming-soon-lede">
          저장한 끼어들기를 다시 꺼내 볼 수 있는 보관함은 곧 열립니다.
          먼저 티타임 경험을 다듬고 있어요.
        </p>
        <ul className="view-coming-soon-list">
          <li>저장한 끼어들기 아카이브</li>
          <li>주간 하이라이트 리포트</li>
          <li>개인 노트 &amp; 태그</li>
        </ul>
        <p className="view-coming-soon-foot">Coming Soon · 2026 Q2</p>
      </div>
    </div>
  )
}
