'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCarouselIndex } from './CarouselNav'
import { useI18n } from '@/lib/i18n/context'

const ROUTES = ['/my', '/teatime', '/feed'] as const

const DRAG_THRESHOLD = 100 // px — past this, snap to next/prev page
const DRAG_MAX_OFF_AXIS = 60 // px vertical tolerance for touch
const MOUSE_DRAG_MIN = 6 // px — avoid accidental drags on click
const DESKTOP_BREAKPOINT = 768

/**
 * Returns true if the event target (or any ancestor) is interactive
 * and should NOT trigger a drag. Prevents drag-navigation from stealing
 * clicks on buttons, links, inputs, etc.
 */
function isInteractiveTarget(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null
  while (el && el !== document.body) {
    const tag = el.tagName
    if (
      tag === 'BUTTON' ||
      tag === 'A' ||
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      tag === 'LABEL' ||
      el.isContentEditable ||
      el.getAttribute('role') === 'button' ||
      el.dataset.noDrag === 'true'
    ) {
      return true
    }
    el = el.parentElement
  }
  return false
}

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()
  const activeIdx = getCarouselIndex(pathname)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [transitionKey, setTransitionKey] = useState<string>(pathname ?? '')
  const [slideFrom, setSlideFrom] = useState<'left' | 'right' | null>(null)
  const prevIdxRef = useRef<number>(activeIdx)

  // Drag state — dragOffset is the live pixel offset; null=not dragging
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; axis: 'none' | 'x' | 'y' } | null>(null)
  const navigatingRef = useRef(false)

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
    // Reset drag state on navigation
    setDragOffset(0)
    setIsDragging(false)
    dragStartRef.current = null
    navigatingRef.current = false
  }, [pathname, activeIdx])

  const commitDrag = useCallback(
    (dx: number) => {
      if (navigatingRef.current) return
      if (Math.abs(dx) >= DRAG_THRESHOLD) {
        if (dx < 0 && activeIdx < ROUTES.length - 1) {
          navigatingRef.current = true
          router.push(ROUTES[activeIdx + 1])
          return
        }
        if (dx > 0 && activeIdx > 0) {
          navigatingRef.current = true
          router.push(ROUTES[activeIdx - 1])
          return
        }
      }
      // Spring back
      setDragOffset(0)
      setIsDragging(false)
      dragStartRef.current = null
    },
    [activeIdx, router],
  )

  // Touch handlers (mobile)
  useEffect(() => {
    if (activeIdx < 0) return
    const el = wrapperRef.current
    if (!el) return

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      if (isInteractiveTarget(e.target)) return
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        axis: 'none',
      }
    }

    const onMove = (e: TouchEvent) => {
      const start = dragStartRef.current
      if (!start) return
      const touch = e.touches[0]
      if (!touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (start.axis === 'none') {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          start.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        } else {
          return
        }
      }
      if (start.axis !== 'x') return
      if (Math.abs(dy) > DRAG_MAX_OFF_AXIS * 2) {
        // gave up on horizontal drag
        setDragOffset(0)
        setIsDragging(false)
        dragStartRef.current = null
        return
      }
      // Resist at edges
      let resisted = dx
      if ((dx > 0 && activeIdx === 0) || (dx < 0 && activeIdx === ROUTES.length - 1)) {
        resisted = dx * 0.3
      }
      setIsDragging(true)
      setDragOffset(resisted)
    }

    const onEnd = () => {
      const start = dragStartRef.current
      if (!start || start.axis !== 'x') {
        setDragOffset(0)
        setIsDragging(false)
        dragStartRef.current = null
        return
      }
      commitDrag(dragOffset)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [activeIdx, commitDrag, dragOffset])

  // Mouse drag handlers (desktop)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeIdx < 0) return
    if (e.button !== 0) return
    if (isInteractiveTarget(e.target)) return
    dragStartRef.current = { x: e.clientX, y: e.clientY, axis: 'none' }
  }, [activeIdx])

  useEffect(() => {
    if (activeIdx < 0) return

    const onMouseMove = (e: MouseEvent) => {
      const start = dragStartRef.current
      if (!start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (start.axis === 'none') {
        if (Math.abs(dx) < MOUSE_DRAG_MIN && Math.abs(dy) < MOUSE_DRAG_MIN) return
        if (Math.abs(dx) < Math.abs(dy)) {
          // mostly vertical — abort, let scroll happen
          dragStartRef.current = null
          return
        }
        start.axis = 'x'
        setIsDragging(true)
      }
      if (start.axis !== 'x') return
      e.preventDefault()
      let resisted = dx
      if ((dx > 0 && activeIdx === 0) || (dx < 0 && activeIdx === ROUTES.length - 1)) {
        resisted = dx * 0.3
      }
      setDragOffset(resisted)
    }

    const onMouseUp = () => {
      const start = dragStartRef.current
      if (!start || start.axis !== 'x') {
        dragStartRef.current = null
        return
      }
      commitDrag(dragOffset)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [activeIdx, commitDrag, dragOffset])

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

  const wrapperTransform = isDragging
    ? `translateX(${dragOffset}px)`
    : 'translateX(0)'
  const wrapperTransition = isDragging
    ? 'none'
    : 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)'

  // Peek panels slide in from the opposite direction
  // Dragging right (dx>0) reveals LEFT peek more; dragging left reveals RIGHT peek more
  const leftPeekAmount = Math.max(0, dragOffset) // positive when dragging right
  const rightPeekAmount = Math.max(0, -dragOffset) // positive when dragging left

  const hasPrev = activeIdx > 0
  const hasNext = activeIdx < ROUTES.length - 1

  // Map the neighbor index → peek label/snippet
  const peekFor = (idx: number) => {
    if (idx === 0) return { title: t.carousel.myKeep, hint: t.carousel.myKeepPeek }
    if (idx === 1) return { title: t.carousel.instantPage, hint: t.carousel.instantPagePeek }
    return { title: t.carousel.sns, hint: t.carousel.snsPeek }
  }

  const leftPeek = hasPrev ? peekFor(activeIdx - 1) : null
  const rightPeek = hasNext ? peekFor(activeIdx + 1) : null

  return (
    <div
      ref={wrapperRef}
      className={`carousel-drag-root${isDragging ? ' is-dragging' : ''}`}
      style={{ touchAction: 'pan-y', overflowX: 'hidden', position: 'relative' }}
      onMouseDown={onMouseDown}
    >
      {/* Left peek panel */}
      {leftPeek && (
        <aside
          aria-hidden
          className="carousel-peek carousel-peek-left"
          style={{
            transform: `translateX(${-100 + Math.min(100, leftPeekAmount * 0.6)}%)`,
            transition: wrapperTransition,
          }}
        >
          <div className="carousel-peek-card">
            <div className="carousel-peek-title">{leftPeek.title}</div>
            <div className="carousel-peek-hint">{leftPeek.hint}</div>
          </div>
        </aside>
      )}

      {/* Right peek panel */}
      {rightPeek && (
        <aside
          aria-hidden
          className="carousel-peek carousel-peek-right"
          style={{
            transform: `translateX(${100 - Math.min(100, rightPeekAmount * 0.6)}%)`,
            transition: wrapperTransition,
          }}
        >
          <div className="carousel-peek-card">
            <div className="carousel-peek-title">{rightPeek.title}</div>
            <div className="carousel-peek-hint">{rightPeek.hint}</div>
          </div>
        </aside>
      )}

      <div
        className="carousel-drag-wrapper"
        style={{
          transform: wrapperTransform,
          transition: wrapperTransition,
        }}
      >
        <div key={transitionKey} className={animClass}>
          {children}
        </div>
      </div>
    </div>
  )
}
