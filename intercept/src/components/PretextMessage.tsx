'use client'

import { useEffect, useRef } from 'react'
import { useCharPositions } from './CharacterPositionContext'

/*
 * PretextMessage — wraps a chat message so that nearby floating
 * characters push its text aside in real-time via @chenglou/pretext.
 *
 * Uses direct DOM manipulation inside a rAF loop (no React state per
 * frame) to keep it fast. Falls back to normal children when no
 * character overlaps.
 */

type Interval = { left: number; right: number }
type Rect = { x: number; y: number; width: number; height: number }

function getRectIntervalsForBand(
  rects: Rect[], bandTop: number, bandBottom: number,
  hPad: number, vPad: number,
): Interval[] {
  const out: Interval[] = []
  for (const r of rects) {
    if (bandBottom <= r.y - vPad || bandTop >= r.y + r.height + vPad) continue
    out.push({ left: r.x - hPad, right: r.x + r.width + hPad })
  }
  return out
}

function carveSlots(base: Interval, blocked: Interval[]): Interval[] {
  let slots = [base]
  for (const b of blocked) {
    const next: Interval[] = []
    for (const s of slots) {
      if (b.right <= s.left || b.left >= s.right) { next.push(s); continue }
      if (b.left > s.left) next.push({ left: s.left, right: b.left })
      if (b.right < s.right) next.push({ left: b.right, right: s.right })
    }
    slots = next
  }
  return slots.filter(s => s.right - s.left >= 20)
}

// Absolute px font for canvas measurement — must NOT contain rem/em units;
// Canvas measureText() ignores relative units and falls back to a default size.
const FONT = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
// Guard: strip any rem/em units if someone accidentally changes FONT above.
if (typeof FONT === 'string' && /\d+(rem|em)\b/.test(FONT)) {
  console.warn('[PretextMessage] FONT contains rem/em units — Canvas measureText will be unreliable. Use px instead.')
}
const LINE_HEIGHT = 25
const H_PAD = 14
const V_PAD = 8
const OVERLAP_MARGIN = 80

// Module-level lazy load
let _pretext: typeof import('@chenglou/pretext') | null = null
let _pretextLoadFailed = false
const _preparedCache = new Map<string, import('@chenglou/pretext').PreparedTextWithSegments>()

interface Props {
  text: string
  children: React.ReactNode
}

export default function PretextMessage({ text, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)   // pretext lines go here
  const normalRef = useRef<HTMLDivElement>(null)    // normal React children
  const { getPositions } = useCharPositions()
  const activeRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const spanPoolRef = useRef<HTMLSpanElement[]>([])

  const plainText = text.replace(/\*\*/g, '')

  useEffect(() => {
    let cancelled = false

    // Lazy-load pretext + prepare text once
    if (!_pretextLoadFailed) {
      import('@chenglou/pretext').then(mod => {
        if (cancelled) return
        _pretext = mod
        const key = plainText
        if (!_preparedCache.has(key)) {
          _preparedCache.set(key, mod.prepareWithSegments(plainText, FONT))
        }
      }).catch(err => {
        console.error('[PretextMessage] Failed to load @chenglou/pretext — falling back to normal rendering.', err)
        _pretextLoadFailed = true
        // _pretext stays null → rAF loop will keep normal rendering visible
      })
    }

    // rAF loop — direct DOM, no setState
    function tick() {
      if (cancelled) return
      const wrapper = wrapperRef.current
      const canvas = canvasRef.current
      const normal = normalRef.current
      if (!wrapper || !canvas || !normal || !_pretext) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const prepared = _preparedCache.get(plainText)
      if (!prepared) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // Measure container position (use normal child's rect for stable size)
      const wrapRect = wrapper.getBoundingClientRect()
      // Declare containerWidth here so it's available for textObstacles filter below
      const containerWidth = wrapRect.width
      const chars = getPositions()

      // Find overlapping characters
      const obstacles: Rect[] = []
      for (const ch of chars) {
        if (
          ch.x + ch.width + OVERLAP_MARGIN > wrapRect.left &&
          ch.x - OVERLAP_MARGIN < wrapRect.right &&
          ch.y + ch.height + OVERLAP_MARGIN > wrapRect.top &&
          ch.y - OVERLAP_MARGIN < wrapRect.bottom
        ) {
          obstacles.push({
            x: ch.x - wrapRect.left,
            y: ch.y - wrapRect.top,
            width: ch.width,
            height: ch.height,
          })
        }
      }

      // Only count obstacles that actually overlap the text column width
      const textObstacles = obstacles.filter(o =>
        o.x + o.width + H_PAD > 0 && o.x - H_PAD < containerWidth
      )

      if (textObstacles.length === 0) {
        // No characters actually overlap text — use normal rendering
        if (activeRef.current) {
          activeRef.current = false
          normal.style.opacity = '1'
          normal.style.pointerEvents = ''
          canvas.style.display = 'none'
        }
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // Characters actually overlap text — activate pretext layout
      if (!activeRef.current) {
        activeRef.current = true
        normal.style.opacity = '0'
        normal.style.pointerEvents = 'none'
        canvas.style.display = 'block'
      }

      // Compute lines using pretext
      type Line = { x: number; y: number; text: string }
      const lines: Line[] = []
      let cursor: import('@chenglou/pretext').LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
      let lineTop = 0

      for (let i = 0; i < 40; i++) {
        const bandTop = lineTop
        const bandBottom = lineTop + LINE_HEIGHT
        const blocked = getRectIntervalsForBand(obstacles, bandTop, bandBottom, H_PAD, V_PAD)
        const slots = carveSlots({ left: 0, right: containerWidth }, blocked)

        if (slots.length === 0) {
          lineTop += LINE_HEIGHT
          continue
        }

        // Pick widest slot
        let best = slots[0]!
        for (let s = 1; s < slots.length; s++) {
          if (slots[s]!.right - slots[s]!.left > best.right - best.left) best = slots[s]!
        }

        const line = _pretext.layoutNextLine(prepared, cursor, best.right - best.left)
        if (!line) break

        lines.push({ x: Math.round(best.left), y: Math.round(lineTop), text: line.text })
        cursor = line.end
        lineTop += LINE_HEIGHT
      }

      // Project lines to DOM — reuse/grow span pool
      const pool = spanPoolRef.current
      while (pool.length < lines.length) {
        const span = document.createElement('span')
        span.className = 'pretext-line'
        span.style.position = 'absolute'
        span.style.whiteSpace = 'pre'
        span.style.font = FONT
        span.style.lineHeight = `${LINE_HEIGHT}px`
        span.style.color = '#222'
        canvas.appendChild(span)
        pool.push(span)
      }
      // Hide excess spans
      for (let i = lines.length; i < pool.length; i++) {
        pool[i]!.style.display = 'none'
      }
      // Update visible spans
      for (let i = 0; i < lines.length; i++) {
        const span = pool[i]!
        const line = lines[i]!
        span.style.display = ''
        span.style.left = `${line.x}px`
        span.style.top = `${line.y}px`
        span.textContent = line.text
      }
      // Set canvas height
      if (lines.length > 0) {
        canvas.style.height = `${lines[lines.length - 1]!.y + LINE_HEIGHT}px`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [plainText, getPositions])

  return (
    <div ref={wrapperRef} className="pretext-message-wrapper">
      {/* Normal rendering — always in flow for stable sizing */}
      <div ref={normalRef} style={{ transition: 'opacity 0.15s' }}>
        {children}
      </div>
      {/* Pretext canvas — overlaid on top */}
      <div
        ref={canvasRef}
        className="pretext-canvas"
        style={{ display: 'none', position: 'absolute', top: 0, left: 0, right: 0 }}
      />
    </div>
  )
}
