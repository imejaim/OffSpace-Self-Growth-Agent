'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCarouselIndex } from './CarouselNav'

const ROUTES = ['/my', '/teatime', '/feed'] as const

const SWIPE_THRESHOLD = 50 // px
const SWIPE_MAX_OFF_AXIS = 60 // px vertical tolerance
const SWIPE_MAX_DURATION = 600 // ms
const DESKTOP_BREAKPOINT = 768

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const activeIdx = getCarouselIndex(pathname)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [transitionKey, setTransitionKey] = useState<string>(pathname ?? '')
  const [slideFrom, setSlideFrom] = useState<'left' | 'right' | null>(null)
  const prevIdxRef = useRef<number>(activeIdx)

  // Track slide direction on pathname change
  useEffect(() => {
    const prev = prevIdxRef.current
    if (activeIdx >= 0 && prev >= 0 && activeIdx !== prev) {
      setSlideFrom(activeIdx > prev ? 'right' : 'left')
    } else {
      setSlideFrom(null)
    }
    prevIdxRef.current = activeIdx
    setTransitionKey(pathname ?? '')
  }, [pathname, activeIdx])

  // Touch handlers
  useEffect(() => {
    if (activeIdx < 0) return
    const el = wrapperRef.current
    if (!el) return

    let startX = 0
    let startY = 0
    let startT = 0
    let tracking = false

    const onStart = (e: TouchEvent) => {
      if (window.innerWidth > DESKTOP_BREAKPOINT) return
      if (e.touches.length !== 1) return
      tracking = true
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startT = Date.now()
    }

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const touch = e.changedTouches[0]
      if (!touch) return
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const dt = Date.now() - startT
      if (Math.abs(dy) > SWIPE_MAX_OFF_AXIS) return
      if (dt > SWIPE_MAX_DURATION) return
      if (Math.abs(dx) < SWIPE_THRESHOLD) return

      if (dx < 0 && activeIdx < ROUTES.length - 1) {
        // swipe left -> next
        router.push(ROUTES[activeIdx + 1])
      } else if (dx > 0 && activeIdx > 0) {
        // swipe right -> prev
        router.push(ROUTES[activeIdx - 1])
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchend', onEnd)
    }
  }, [activeIdx, router])

  // If not on a carousel page, pass children through unwrapped
  if (activeIdx < 0) {
    return <>{children}</>
  }

  const animClass =
    slideFrom === 'right'
      ? 'carousel-page-enter-from-right'
      : slideFrom === 'left'
        ? 'carousel-page-enter-from-left'
        : ''

  return (
    <div
      ref={wrapperRef}
      style={{ touchAction: 'pan-y', overflowX: 'hidden' }}
    >
      <div key={transitionKey} className={animClass}>
        {children}
      </div>
    </div>
  )
}
