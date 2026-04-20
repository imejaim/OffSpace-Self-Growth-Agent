'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CHARACTERS, ALL_TEATIMES, pickText } from '@/lib/teatime-data'
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
  pinned: boolean      // pinned in place after drag
}

const CHARACTER_IDS = ['kobu', 'oh', 'jem'] as const
const SIZE_DESKTOP = 48
const SIZE_MOBILE = 32
const NARROW_BREAKPOINT = 900   // below this, content fills most of viewport → shrink chars and corner them
const MARGIN_MIN = 90           // min side-margin width required to let a char roam there
const FOLLOW_SPEED = 0.02       // lerp factor toward mouse
const WANDER_SPEED = 0.005      // slow drift when idle
const GATHER_SPEED = 0.04       // faster gather when user is typing
const GATHER_RADIUS = 80        // how close they cluster when gathering

/* ── Content column detection ────────────────────────────────────────
 * The main reading column (teatime article, home hero) is centered
 * with a max-width. Characters must stay OUT of that column so they
 * don't cover text. We probe the DOM for known centered containers
 * and return the viewport-relative [left, right] of the content area.
 */
function getContentBounds(): { left: number; right: number } {
  if (typeof document === 'undefined') return { left: 0, right: 0 }
  // Priority order: teatime article > home hero section > fallback to 720px centered
  const selectors = ['.teatime-main', 'main section > div', 'main']
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.width < window.innerWidth) {
      return { left: r.left, right: r.right }
    }
  }
  // Fallback — assume 720px centered column
  const w = window.innerWidth
  const col = Math.min(720, w)
  return { left: (w - col) / 2, right: (w + col) / 2 }
}
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
          // Content may be bilingual — resolve to Korean for floating-char bubbles.
          msgs.push({ characterId: msg.characterId, content: pickText(msg.content, 'ko') })
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

/* ── Responsive size ──
 * Below NARROW_BREAKPOINT the content column fills the viewport,
 * leaving no margin for characters → shrink them so they corner nicely.
 */
function getCharSize(): number {
  if (typeof window === 'undefined') return SIZE_DESKTOP
  return window.innerWidth < NARROW_BREAKPOINT ? SIZE_MOBILE : SIZE_DESKTOP
}

/* ── Clamp a target x to the nearest available margin zone ──
 * Given a proposed x, if it would place the character inside the
 * centered content column, push it to whichever side (left-margin
 * or right-margin) is closest. On narrow viewports with no usable
 * margins, corner characters at left or right edge.
 */
function clampToMargin(
  targetX: number,
  size: number,
  bounds: { left: number; right: number },
  viewportW: number,
  preferSide: 'left' | 'right' | 'auto' = 'auto',
): number {
  const leftMarginWidth = Math.max(0, bounds.left)
  const rightMarginWidth = Math.max(0, viewportW - bounds.right)
  const leftUsable = leftMarginWidth >= MARGIN_MIN
  const rightUsable = rightMarginWidth >= MARGIN_MIN

  // Narrow viewport — corner mode
  if (!leftUsable && !rightUsable) {
    if (preferSide === 'right' || (preferSide === 'auto' && targetX > viewportW / 2)) {
      return viewportW - size - 12 // MODIFIED: More breathing room
    }
    return 12 // MODIFIED: More breathing room
  }

  // Already outside? Just keep them there but clamped to viewport padding
  const padding = 12
  if (targetX + size <= bounds.left || targetX >= bounds.right) {
    return clamp(targetX, padding, viewportW - size - padding)
  }

  // Inside content column — push to nearest or preferred usable margin
  const pushLeft = leftUsable ? Math.max(padding, bounds.left - size - 16) : viewportW + 1000
  const pushRight = rightUsable ? Math.min(viewportW - size - padding, bounds.right + 16) : viewportW + 1000

  if (preferSide === 'left' && leftUsable) return pushLeft
  if (preferSide === 'right' && rightUsable) return pushRight

  const distLeft = Math.abs((targetX + size / 2) - bounds.left)
  const distRight = Math.abs(bounds.right - (targetX + size / 2))

  if (leftUsable && (!rightUsable || distLeft <= distRight)) return pushLeft
  if (rightUsable) return pushRight
  
  return padding // Absolute fallback
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
  const { setPositions, anchorId, anchorRect } = useCharPositions()
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
    const size = getCharSize()
    const bounds = getContentBounds()
    const leftMargin = bounds.left
    const rightMargin = w - bounds.right
    const narrow = leftMargin < MARGIN_MIN && rightMargin < MARGIN_MIN

    // Place chars in the centers of available margins (or corners on narrow screens)
    const padding = 16
    const leftX = narrow ? padding : Math.max(padding, leftMargin / 2 - size / 2)
    const rightX = narrow ? w - size - padding : Math.min(w - size - padding, bounds.right + rightMargin / 2 - size / 2)

    const initial: CharacterState[] = [
      {
        id: 'kobu', x: leftX, y: h * 0.25,
        targetX: leftX, targetY: h * 0.25,
        action: 'idle', actionTimer: 0,
        bubble: null, bubbleVisible: false,
        flipX: false, bobPhase: 0, pinned: false,
      },
      {
        id: 'oh', x: rightX, y: Math.max(80, h * 0.15), // MODIFIED: Prevent hiding behind header
        targetX: rightX, targetY: Math.max(80, h * 0.15),
        action: 'idle', actionTimer: 0,
        bubble: null, bubbleVisible: false,
        flipX: true, bobPhase: Math.PI * 0.66, pinned: false,
      },
      {
        id: 'jem', x: rightX, y: h * 0.55,
        targetX: rightX, targetY: h * 0.55,
        action: 'idle', actionTimer: 0,
        bubble: null, bubbleVisible: false,
        flipX: true, bobPhase: Math.PI * 1.33, pinned: false,
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
    const listeningBubbles: Record<string, string[]> = {
      kobu: ['뭐지? 누구지?', '흠, 궁금한 게 있나?', '쉿! 귀 쫑긋'],
      oh:   ['뭔가 궁금한 게 있나?', '오? 끼어드시나요?', '어디 한번 봅시다'],
      jem:  ['쉿! 귀 쫑긋', '오오 뭐라고 쓰는 거예요?', '두근두근...!'],
    }

    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement
      if (el?.classList?.contains('intercept-input')) {
        typingRef.current = true
        // Show listening bubbles
        charsRef.current = charsRef.current.map((c) => {
          const bubbles = listeningBubbles[c.id] ?? ['...']
          const bubble = bubbles[Math.floor(Math.random() * bubbles.length)]
          return { ...c, bubble, bubbleVisible: true }
        })
        setChars([...charsRef.current])
      }
    }
    function onFocusOut(e: FocusEvent) {
      const el = e.target as HTMLElement
      if (el?.classList?.contains('intercept-input')) {
        typingRef.current = false
        // Hide listening bubbles
        charsRef.current = charsRef.current.map((c) => ({ ...c, bubbleVisible: false }))
        setChars([...charsRef.current])
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
      const size = getCharSize()
      const bounds = getContentBounds()
      const mouse = mouseRef.current
      const isTyping = typingRef.current
      // idx → preferred margin side (kobu=left, oh=right, jem=right)
      const preferredSides: Array<'left' | 'right'> = ['left', 'right', 'right']

      charsRef.current = charsRef.current.map((c, idx) => {
        if (dragRef.current?.id === c.id) return c
        if (c.pinned) return c  // pinned characters don't move

        let { x, y, targetX, targetY, action, actionTimer, flipX, bobPhase } = c

        // ── Determine target position ──
        const isLoading = document.body.classList.contains('intercept-loading')

        if (isLoading) {
          // Gather near the intercept-inline area
          const inlineEl = document.querySelector('.intercept-inline') as HTMLElement | null
          if (inlineEl) {
            const rect = inlineEl.getBoundingClientRect()
            const triangleOffsets = [
              { ox: -70, oy: -50 },   // 코부장: above-left
              { ox: rect.width + 20, oy: -40 },  // 오과장: above-right
              { ox: rect.width / 2 - size / 2, oy: rect.height + 10 },  // 젬대리: below-center
            ]
            const off = triangleOffsets[idx]!
            const sway = Math.sin(now / 1500 + idx * 2) * 8
            targetX = clamp(rect.left + off.ox + sway, 10, w - size - 10)
            targetY = clamp(rect.top + off.oy, 10, h - size - 10)
            action = 'walking'
            if (!c.bubbleVisible) {
              const loadingBubbles = [
                ['흠...', '좋은 질문이야', '잠깐만...'],
                ['분석 중이에요!', '자료 확인 중...', '오? 이거 재밌는데'],
                ['찾고 있어요!', '잠깐만요~', '어디 보자...'],
              ]
              const bubbles = loadingBubbles[idx] ?? ['...']
              return {
                ...c, targetX, targetY, action, flipX, bobPhase,
                bubble: bubbles[Math.floor(Math.random() * bubbles.length)]!,
                bubbleVisible: true,
              }
            }
          }
        } else if (isTyping) {
          // Gather left of the input
          const input = document.querySelector('.intercept-input:focus') as HTMLElement | null
          if (input) {
            const rect = input.getBoundingClientRect()
            const cx = rect.left - 120
            const cy = rect.top + rect.height / 2
            const triangleOffsets = [
              { ox: 20, oy: -70 },    // 코부장: upper-right
              { ox: -50, oy: -10 },   // 오과장: far-left center
              { ox: 20, oy: 60 },     // 젬대리: lower-right
            ]
            const off = triangleOffsets[idx]!
            targetX = clamp(cx + off.ox, 10, rect.left - 90)
            targetY = clamp(cy + off.oy, 10, h - size - 10)
            action = 'listening'
          }
        } else if (anchorId && anchorRect) {
          // ADDED: Anchor Gathering
          // Move characters to the margins of the anchored section
          const side = preferredSides[idx]!
          const stagger = idx * 60 - 60 // staggered vertically
          targetX = clampToMargin(anchorRect.left, size, bounds, w, side)
          targetY = clamp(anchorRect.top + anchorRect.height / 2 + stagger, 80, h - size - 80)
          
          if (action === 'listening') action = 'idle'
          
          // Face the content
          flipX = side === 'right'

        } else if (mouse.active) {
          // Follow cursor
          const mouseInLeftMargin = mouse.x < bounds.left
          const mouseInRightMargin = mouse.x > bounds.right
          const preferred = preferredSides[idx]!
          const side: 'left' | 'right' =
            mouseInLeftMargin ? 'left'
            : mouseInRightMargin ? 'right'
            : preferred
          const stagger = [-50, 0, 50][idx] ?? 0
          targetX = clampToMargin(mouse.x - size / 2, size, bounds, w, side)
          targetY = clamp(mouse.y + stagger - size / 2, 80, h - size - 60) // MODIFIED: safe Y zone
          if (action === 'listening') action = 'idle'
          flipX = targetX < mouse.x 
        } else {
          // Gentle wander
          actionTimer += dt
          if (actionTimer > 200) {
            const side = preferredSides[idx]!
            const driftX = x + (Math.random() - 0.5) * 120
            targetX = clampToMargin(driftX, size, bounds, w, side)
            targetY = clamp(y + (Math.random() - 0.5) * 150, 20, h - size - 20)
            actionTimer = 0
          }
        }

        // ── Move toward target ──
        const speed = (isTyping || anchorId) ? GATHER_SPEED : mouse.active ? FOLLOW_SPEED : WANDER_SPEED
        const newX = lerp(x, clamp(targetX, 0, w - size), speed * dt)
        const newY = lerp(y, clamp(targetY, 0, h - size), speed * dt)

        // ── Determine action & flip ──
        const moving = dist(newX, newY, x, y) > 0.3
        if (moving) {
          if (!anchorId) flipX = newX < x
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
        id: c.id, x: c.x, y: c.y, width: size, height: size,
      })))

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [visible, setPositions, anchorId, anchorRect]) // ADDED dependencies

  // ── Speech bubble sequencer (Context-Aware) ──
  useEffect(() => {
    if (!visible) return
    const msgs = allMessages.current
    if (msgs.length === 0) return

    let timeoutId: ReturnType<typeof setTimeout>

    function showNext() {
      if (!mountedRef.current) return
      if (typingRef.current) {
        timeoutId = setTimeout(showNext, 2000)
        return
      }

      // ADDED: Context-aware reactions
      let nextBubble = ''
      let targetId = ''

      if (anchorId) {
        const reactions: Record<string, string[]> = {
          kobu: ['음, 이 이슈는 중요해 보이네.', '코부장 생각도 비슷해.', '오과장, 자네 의견은 어떤가?', '흥미로운 주제군.'],
          oh: ['아, 이거 저번에 봤던 그 뉴스네요.', '젬대리님, 이거 체크해보셨나요?', '기술적으로는 이런 접근도 가능하겠어요.', '허허, 세상 참 빠릅니다.'],
          jem: ['와! 이거 진짜 대박인데요?', '저도 이거 궁금했어요!', '오과장님, 설명 좀 해주세요 ᄒᄒ', '메모 메모...!'],
        }
        const ids = ['kobu', 'oh', 'jem']
        targetId = ids[Math.floor(Math.random() * ids.length)]!
        const pool = reactions[targetId] || ['...']
        nextBubble = pool[Math.floor(Math.random() * pool.length)]!
      } else {
        const msg = msgs[msgIndexRef.current % msgs.length]
        msgIndexRef.current++
        targetId = msg.characterId
        nextBubble = truncate(msg.content)
      }

      charsRef.current = charsRef.current.map((c) =>
        c.id === targetId
          ? { ...c, bubble: nextBubble, bubbleVisible: true }
          : { ...c, bubbleVisible: false }
      )
      setChars([...charsRef.current])

      timeoutId = setTimeout(() => {
        if (!mountedRef.current) return
        if (!typingRef.current) {
          charsRef.current = charsRef.current.map((c) => ({ ...c, bubbleVisible: false }))
          setChars([...charsRef.current])
        }
        timeoutId = setTimeout(showNext, anchorId ? 5000 : 3000)
      }, 4000)
    }

    timeoutId = setTimeout(showNext, 3000)
    return () => clearTimeout(timeoutId)
  }, [visible, anchorId]) // ADDED dependency

  // ── Click action handler ──
  const handleClick = useCallback((id: string) => {
    charsRef.current = charsRef.current.map((c) => {
      if (c.id !== id) return c

      // If pinned, unpin and return to following mode
      if (c.pinned) {
        return { ...c, pinned: false, action: 'excited', bubbleVisible: true, bubble: '다시 합류!' }
      }

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
      const size = getCharSize()
      const nx = clamp(e.clientX - offsetX, 0, w - size)
      const ny = clamp(e.clientY - offsetY, 0, h - size)
      charsRef.current = charsRef.current.map((c) =>
        c.id === id ? { ...c, x: nx, y: ny, targetX: nx, targetY: ny } : c
      )
      setChars([...charsRef.current])
    }
    function onMouseUp() {
      if (dragRef.current) {
        // Pin the character at its dropped position
        const id = dragRef.current.id
        charsRef.current = charsRef.current.map((c) =>
          c.id === id ? { ...c, pinned: true } : c
        )
        setChars([...charsRef.current])
        dragRef.current = null
      }
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
        <div 
          className="floating-overlay" 
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none', // MODIFIED: Container doesn't block clicks
            zIndex: 100, // MODIFIED: Below header (1000)
          }}
        >
          {chars.map((c) => {
            const char = CHARACTERS[c.id]
            if (!char) return null

            const size = getCharSize()
            const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
            const vh = typeof window !== 'undefined' ? window.innerHeight : 768

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

            // Bubble goes AWAY from content center (outward)
            // Left-side chars → bubble goes further left; right-side → further right
            const screenMidX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500
            const charOnLeft = c.x < screenMidX
            const bubbleStyle: React.CSSProperties = charOnLeft
              ? { // Character on LEFT → bubble goes LEFT (away from content)
                  borderColor: char.color,
                  right: size / 2,
                  left: 'auto',
                  bottom: size + 8,
                }
              : { // Character on RIGHT → bubble goes RIGHT (away from content)
                  borderColor: char.color,
                  left: size / 2,
                  right: 'auto',
                  bottom: size + 8,
                }

            return (
              <div
                key={c.id}
                className="floating-char"
                style={{
                  position: 'absolute',
                  // Clamp at render time so characters stay in viewport
                  // regardless of state (prevents top: -1309px after scroll)
                  left: clamp(c.x, 0, Math.max(0, vw - size)),
                  top: clamp(c.y + bobY, 0, Math.max(0, vh - size)),
                  transform: `scale(${scale})`,
                  pointerEvents: 'auto', // MODIFIED: Individual characters are clickable
                  cursor: 'grab',
                }}
                onMouseDown={(e) => onMouseDown(e, c.id)}
                onClick={() => handleClick(c.id)}
              >
                {/* Speech bubble — positioned based on screen location */}
                {c.bubbleVisible && c.bubble && (
                  <div
                    className="floating-bubble"
                    style={bubbleStyle}
                  >
                    <span className="floating-bubble-name" style={{ color: char.color }}>
                      {char.name}
                    </span>
                    <span className="floating-bubble-text">
                      {c.bubble}
                    </span>
                  </div>
                )}

                {/* Action emoji indicator */}
                {actionEmoji && !c.bubbleVisible && (
                  <div className="floating-action-emoji">
                    {actionEmoji}
                  </div>
                )}

                {/* Avatar — only the image flips */}
                <img
                  src={char.avatar}
                  alt={char.name}
                  width={size}
                  height={size}
                  className="floating-avatar char-breathing"
                  style={{
                    width: size,
                    height: size,
                    outline: `2px solid ${char.color}`,
                    filter: c.action === 'coffee' ? 'sepia(0.3) saturate(1.4)' : undefined,
                    transform: c.flipX ? 'scaleX(-1)' : undefined,
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
