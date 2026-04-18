import React from 'react'
import { useI18n } from '@/lib/i18n/context'

interface SidebarMockProps {
  type: 'teatime' | 'my' | 'feed'
  title: string
}

export function SidebarMock({ type, title }: SidebarMockProps) {
  const { t } = useI18n()

  const items =
    type === 'my'
      ? [
          t.carousel.myKeepPeek,
          `${t.carousel.myKeep} 1`,
          `${t.carousel.myKeep} 2`,
          `${t.carousel.myKeep} 3`,
        ]
      : type === 'feed'
        ? [
            t.carousel.snsPeek,
            t.feed.refresh,
            t.feed.tabAll,
            t.feed.tabFollowing,
          ]
        : [
            t.carousel.instantPagePeek,
            t.teatime.chatterButton,
            t.teatime.interceptButton,
          ]

  return (
    <div className="sidebar-mock">
      <h2>{title}</h2>
      <div className="sidebar-mock-group">
        {items.map((item, index) => (
          <div
            key={`${type}-${index}`}
            className={`sidebar-mock-item${index === 0 ? ' active' : ''}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
