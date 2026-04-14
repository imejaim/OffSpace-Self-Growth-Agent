'use client'

import React, { useCallback } from 'react'
import { useAppRouter, ViewType } from '@/lib/router-context'
import { useI18n } from '@/lib/i18n/context'
import TeatimeView from '@/components/views/TeatimeView'
import MyKeepView from '@/components/views/MyKeepView'
import FeedView from '@/components/views/FeedView'

// Fixed order matches CarouselNav TABS: MyKeep(0), Teatime(1), Feed(2)
const VIEWS: { id: ViewType; component: React.ReactNode }[] = [
  { id: 'my', component: <MyKeepView /> },
  { id: 'teatime', component: <TeatimeView /> },
  { id: 'feed', component: <FeedView /> },
]

type CardPosition = 'center' | 'left' | 'right' | 'hidden'

function getPosition(cardIndex: number, activeIndex: number): CardPosition {
  const diff = cardIndex - activeIndex
  if (diff === 0) return 'center'
  if (diff === -1) return 'left'
  if (diff === 1) return 'right'
  return 'hidden'
}

function activeIndexOf(view: ViewType): number {
  return VIEWS.findIndex((v) => v.id === view)
}

export default function CarouselStage() {
  const { activeView, navigate } = useAppRouter()
  const { t } = useI18n()
  const activeIndex = activeIndexOf(activeView)

  const captions: Record<ViewType, string> = {
    my: t.carousel.myKeep,
    teatime: t.carousel.instantPage,
    feed: t.carousel.sns,
  }

  const handleCardClick = useCallback(
    (viewId: ViewType, position: CardPosition) => {
      if (position === 'center') return
      const direction: 'left' | 'right' = position === 'left' ? 'left' : 'right'
      navigate(viewId, direction)
    },
    [navigate]
  )

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, viewId: ViewType, position: CardPosition) => {
      if (position === 'center') return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const direction: 'left' | 'right' = position === 'left' ? 'left' : 'right'
        navigate(viewId, direction)
      }
    },
    [navigate]
  )

  return (
    <div className="carousel-stage">
      {VIEWS.map((view, idx) => {
        const position = getPosition(idx, activeIndex)
        const isCenter = position === 'center'
        const isHidden = position === 'hidden'

        return (
          <div
            key={view.id}
            className={`carousel-card carousel-card--${position}`}
            role={isCenter ? undefined : 'button'}
            tabIndex={isCenter ? -1 : 0}
            aria-hidden={isHidden ? true : undefined}
            onClick={() => handleCardClick(view.id, position)}
            onKeyDown={(e) => handleCardKeyDown(e, view.id, position)}
          >
            <div
              className="carousel-card-body"
              style={isCenter ? undefined : { pointerEvents: 'none' }}
            >
              {view.component}
            </div>
            {!isCenter && (
              <div className="carousel-card-caption">{captions[view.id]}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
