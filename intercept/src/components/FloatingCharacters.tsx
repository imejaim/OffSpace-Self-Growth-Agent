'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CHARACTERS, ALL_TEATIMES } from '@/lib/teatime-data'
import { useCharPositions } from './CharacterPositionContext'

/* ── Types ──────────────────────────────────────────────────────────── */

type ActionType = 'idle' | 'walking' | 'whispering' | 'coffee' | 'listening' | 'excited'

interface CharacterState {
  id: string
  x: number
  y: number
  targetX: number
  targetY: number
  action: ActionType
  actionTimer: number
  bubble: string | null
  bubbleVisible: boolean
  flipX: boolean       // face direction
  bobPhase: number     // walking bob animation phase
}

const CHARACTER_IDS = ['kobu', 'oh', 'jem'] as const
const SIZE = 48
const FOLLOW_SPEED = 0.02       // lerp factor toward mouse
const WANDER_SPEED = 0.005      // slow drift when idle
const GATHER_SPEED = 0.04       // faster gather when user is typing
const GATHER_RADIUS = 80        // how close they cluster when gathering
const ACTION_EMOJIS: Record<ActionType, string> = {
  idle: '',
  walking: '',
  whispering: '🤫',
  coffee: '☕',
  listening: '👀',
  excited: '✨',
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function truncate(text: string, max = 60) {
  const plain = text.replace(/\*\*/g, '')
  return plain.length > max ? plain.slice(0, max) + '...' : plain
}

function getAllMessages() {
  const msgs: { characterId: string; content: string }[] = []
  for (const teatime of ALL_TEATIMES) {
    for (const topic of teatime.topics) {
      for (const msg of topic.messages) {
        if (CHARACTER_IDS.includes(msg.characterId as typeof CHARACTER_IDS[number])) {
          msgs.push({ characterId: msg.characterId, content: msg.content })
        }
      }
    }
  }
  return msgs
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function FloatingCharacters() {
  const [visible, setVisible] = useState(true)
  const [chars, setChars] = useState<CharacterState[]>([])
  const rafRef = useRef<number | null>(null)
  const charsRef = useRef<CharacterState[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const typingRef = useRef(false)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const msgIndexRef = useRef(0)
  const allMessages = useRef(getAllMessages())
  const { setPositions } = useCharPositions()
  const mountedRef = useRef(true)

  // Track mount state to guard async callbacks after unmount
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Init positions ──
  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const initial: CharacterState[] = [
      {
        id: 'kobu', x: w * 0.15, y: h * 0.3,
        targetX: w * 0.15, targetY: h * 0.3,
        action: 'idle', actionTimer: 0,
        bubble: null, bubbleVisible: false,
        flipX: false, bobPhase: 0,
      },
      {
        id: 'oh', x: w * 0.5, y: h * 0.15,
        targetX: w * 0.5, targetY: h * 0.15,
        action: 'idle', actionTimer: 0,
        bubble: null, bubbleVisible: false,
        flipX: false, bobPhase: Math.PI * 0.66,
      },
      {
        id: 'jem', x: w * 0.8, y: h * 0.6,
        targetX: w * 0.8, targetY: h * 0.6,
        action: 'idle', actionTimer: 0,
        bubble: null, bubbleVisible: false,
        flipX: true, bobPhase: Math.PI * 1.33,
      },
    ]
    setChars(initial)
    charsRef.current = initial
  }, [])

  // ── Track mouse ──
  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }
    function onLeave() {
      mouseRef.current.active = false
    }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Detect typing in intercept inputs ──
  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement
      if (el?.classList?.contains('intercept-input')) {
        typingRef.current = true
      }
    }
    function onFocusOut(e: FocusEvent) {
      const el = e.target as HTMLElement
      if (el?.classList?.contains('intercept-input')) {
        typingRef.current = false
      }
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // ── Main animation loop ──
  useEffect(() => {
    if (!visible) return

    let lastTime = performance.now()

    function step(now: number) {
      const dt = Math.min((now - lastTime) / 16.67, 3) // normalize to ~60fps, cap
      lastTime = now

      const w = window.innerWidth
      const h = window.innerHeight
      const mouse = mouseRef.current
      const isTyping = typingRef.current

      charsRef.current = charsRef.current.map((c, idx) => {
        if (dragRef.current?.id === c.id) return c

        let { x, y, targetX, targetY, action, actionTimer, flipX, bobPhase } = c

        // ── Determine target position ──
        if (isTyping) {
          // Gather near the focused intercept input
          const input = document.querySelector('.intercept-input:focus') as HTMLElement | null
          if (input) {
            const rect = input.getBoundingClientRect()
            // Position to the LEFT of the input, not on top of it
            const cx = rect.left - 40
            const cy = rect.top + rect.height / 2
            // Stack vertically to the left side
            const yOffsets = [-50, 0, 50]
            targetX = cx - 60 - idx * 20
            targetY = cy + yOffsets[idx]
            action = 'listening'
          }
        } else if (mouse.active) {
          // Stay to the SIDE of the cursor so they don't block clicks
          // Characters hang out ~120-180px away, mostly to the left/right
          const offsets = [
            { ox: -160, oy: -30 },   // 코부장: left side
            { ox: -130, oy: -80 },   // 오과장: upper-left
            { ox: 150, oy: -40 },    // 젬대리: right side
          ]
          const off = offsets[idx]
          targetX = mouse.x + off.ox
          targetY = mouse.y + off.oy
          if (action === 'listening') action = 'idle'
        } else {
          // Gentle wander
          actionTimer += dt
          if (actionTimer > 200) {
            targetX = clamp(x + (Math.random() - 0.5) * 200, 20, w - SIZE - 20)
            targetY = clamp(y + (Math.random() - 0.5) * 150, 20, h - SIZE - 20)
            actionTimer = 0
          }
        }

        // ── Move toward target ──
        const speed = isTyping ? GATHER_SPEED : mouse.active ? FOLLOW_SPEED : WANDER_SPEED
        const newX = lerp(x, clamp(targetX, 0, w - SIZE), speed * dt)
        const newY = lerp(y, clamp(targetY, 0, h - SIZE), speed * dt)

        // ── Determine action & flip ──
        const moving = dist(newX, newY, x, y) > 0.3
        if (moving) {
          flipX = newX < x // face direction of movement
          bobPhase += 0.15 * dt
          if (action !== 'listening') action = 'walking'
        } else {
          if (action === 'walking') action = 'idle'
        }

        // ── If characters are close to each other, whisper ──
        if (action === 'idle') {
          const others = charsRef.current.filter((o) => o.id !== c.id)
          const anyClose = others.some((o) => dist(newX, newY, o.x, o.y) < 70)
          if (anyClose) action = 'whispering'
        }

        return {
          ...c,
          x: newX, y: newY,
          targetX, targetY,
          action, actionTimer,
          flipX, bobPhase,
        }
      })

      setChars([...charsRef.current])

      // Report positions to PretextMessage via context
      setPositions(charsRef.current.map(c => ({
        id: c.id, x: c.x, y: c.y, width: SIZE, height: SIZE,
      })))

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [visible, setPositions])

  // ── Speech bubble sequencer ──
  useEffect(() => {
    if (!visible) return
    const msgs = allMessages.current
    if (msgs.length === 0) return

    let timeoutId: ReturnType<typeof setTimeout>

    function showNext() {
      if (!mountedRef.current) return
      const msg = msgs[msgIndexRef.current % msgs.length]
      msgIndexRef.current++

      charsRef.current = charsRef.current.map((c) =>
        c.id === msg.characterId
          ? { ...c, bubble: truncate(msg.content), bubbleVisible: true }
          : { ...c, bubbleVisible: false }
      )
      setChars([...charsRef.current])

      timeoutId = setTimeout(() => {
        if (!mountedRef.current) return
        charsRef.current = charsRef.current.map((c) => ({ ...c, bubbleVisible: false }))
        setChars([...charsRef.current])
        timeoutId = setTimeout(showNext, 2000)
      }, 4000)
    }

    timeoutId = setTimeout(showNext, 3000)
    return () => clearTimeout(timeoutId)
  }, [visible])

  // ── Click action handler ──
  const handleClick = useCallback((id: string) => {
    charsRef.current = charsRef.current.map((c) => {
      if (c.id !== id) return c
      // Cycle through fun actions
      const actions: ActionType[] = ['whispering', 'coffee', 'excited']
      const currentIdx = actions.indexOf(c.action)
      const nextAction = actions[(currentIdx + 1) % actions.length]

      const bubbles: Record<ActionType, string> = {
        whispering: c.id === 'jem' ? '(쉿, 비밀인데요...)' : c.id === 'oh' ? '(여기 좀 보세요)' : '(이건 비밀이야)',
        coffee: c.id === 'jem' ? '아~ 커피 맛있다!' : c.id === 'oh' ? '역시 아메리카노죠' : '오늘 두 잔째야',
        excited: c.id === 'jem' ? '오오 대박!!' : c.id === 'oh' ? '이거 좋은데요?' : '흥미롭군',
        idle: '', walking: '', listening: '',
      }

      return {
        ...c,
        action: nextAction,
        bubble: bubbles[nextAction] || null,
        bubbleVisible: true,
      }
    })
    setChars([...charsRef.current])

    // Reset after 3s
    setTimeout(() => {
      if (!mountedRef.current) return
      charsRef.current = charsRef.current.map((c) =>
        c.id === id ? { ...c, action: 'idle', bubbleVisible: false } : c
      )
      setChars([...charsRef.current])
    }, 3000)
  }, [])

  // ── Drag handlers ──
  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    const c = charsRef.current.find((ch) => ch.id === id)
    if (!c) return
    dragRef.current = { id, offsetX: e.clientX - c.x, offsetY: e.clientY - c.y }
    e.preventDefault()
  }, [])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current) return
      const { id, offsetX, offsetY } = dragRef.current
      const w = window.innerWidth
      const h = window.innerHeight
      const nx = clamp(e.clientX - offsetX, 0, w - SIZE)
      const ny = clamp(e.clientY - offsetY, 0, h - SIZE)
      charsRef.current = charsRef.current.map((c) =>
        c.id === id ? { ...c, x: nx, y: ny, targetX: nx, targetY: ny } : c
      )
      setChars([...charsRef.current])
    }
    function onMouseUp() {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <>
      {/* Toggle button */}
      <button
        className="floating-toggle"
        onClick={() => setVisible((v) => !v)}
        title={visible ? '캐릭터 숨기기' : '캐릭터 보기'}
      >
        {visible ? '숨기기' : '직원들'}
      </button>

      {/* Overlay */}
      {visible && (
        <div className="floating-overlay" aria-hidden="true">
          {chars.map((c) => {
            const char = CHARACTERS[c.id]
            if (!char) return null

            // Bob animation for walking
            const bobY = c.action === 'walking'
              ? Math.sin(c.bobPhase) * 3
              : c.action === 'listening'
              ? Math.sin(c.bobPhase * 0.5) * 1.5
              : 0

            // Scale pulse for excited
            const scale = c.action === 'excited'
              ? 1 + Math.sin(Date.now() / 150) * 0.08
              : 1

            const actionEmoji = ACTION_EMOJIS[c.action]

            return (
              <div
                key={c.id}
                className="floating-char"
                style={{
                  left: c.x,
                  top: c.y + bobY,
                  transform: `scaleX(${c.flipX ? -scale : scale}) scaleY(${scale})`,
                }}
                onMouseDown={(e) => onMouseDown(e, c.id)}
                onClick={() => handleClick(c.id)}
              >
                {/* Speech bubble */}
                {c.bubbleVisible && c.bubble && (
                  <div
                    className="floating-bubble"
                    style={{
                      borderColor: char.color,
                      transform: c.flipX ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%)',
                    }}
                  >
                    <span className="floating-bubble-name" style={{ color: char.color }}>
                      {char.name}
                    </span>
                    <span className="floating-bubble-text">
                      {c.flipX ? <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>{c.bubble}</span> : c.bubble}
                    </span>
                  </div>
                )}

                {/* Action emoji indicator */}
                {actionEmoji && !c.bubbleVisible && (
                  <div className="floating-action-emoji">
                    {actionEmoji}
                  </div>
                )}

                {/* Avatar */}
                <img
                  src={char.avatar}
                  alt={char.name}
                  width={SIZE}
                  height={SIZE}
                  className="floating-avatar"
                  style={{
                    outline: `2px solid ${char.color}`,
                    filter: c.action === 'coffee' ? 'sepia(0.3) saturate(1.4)' : undefined,
                  }}
                  draggable={false}
                />

                {/* Listening indicator dots */}
                {c.action === 'listening' && (
                  <div className="floating-listening-dots">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
