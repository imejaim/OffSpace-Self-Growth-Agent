'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'

const CHARACTER_AVATARS: Record<string, string> = {
  kobu: '/characters/Ko-bujang.svg',
  oh: '/characters/Oh-gwajang.svg',
  jem: '/characters/Jem-daeri.svg',
}

const CHARACTER_COLORS: Record<string, string> = {
  kobu: '#4A90D9',
  oh: '#E67E22',
  jem: '#27AE60',
}

const USER_COLOR = '#9B59B6'

interface InterceptResponse {
  characterId: string
  name: string
  color: string
  content: string
}

interface ChatMessage {
  type: 'user' | 'character'
  content: string
  characterId?: string
  name?: string
  color?: string
}

const MOCK_RESPONSES: InterceptResponse[] = [
  {
    characterId: 'kobu',
    name: '코부장',
    color: '#4A90D9',
    content:
      '오 좋은 포인트에서 끼어드셨네요! 저도 처음엔 그 부분이 궁금했어요. 핵심은 결국 "실용화"예요 — 기술이 있어도 실제로 쓸 수 있어야 의미가 있으니까요.',
  },
  {
    characterId: 'jem',
    name: '젬대리',
    color: '#27AE60',
    content:
      '맞아요! 그리고 요즘 트렌드가 딱 그 방향으로 가고 있거든요. 더 궁금한 거 있으면 언제든 끼어드세요 ㅋㅋ',
  },
]

interface InterceptButtonProps {
  messageId: string
  conversationContext: string
  characterId: string
  onClose: () => void
}

export default function InterceptButton({
  messageId,
  conversationContext,
  characterId,
  onClose,
}: InterceptButtonProps) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mounted, setMounted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mounted])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  async function handleSubmit() {
    const msg = inputValue.trim()
    if (!msg || isLoading) return

    const userMsg: ChatMessage = { type: 'user', content: msg }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    // Build full context including prior turns
    const historyContext = messages
      .map((m) =>
        m.type === 'user' ? `사용자: ${m.content}` : `${m.name}: ${m.content}`
      )
      .join('\n')
    const fullContext = historyContext
      ? `${conversationContext}\n\n[이전 대화]\n${historyContext}`
      : conversationContext

    try {
      const res = await fetch('/api/intercept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationContext: fullContext,
          userMessage: msg,
          characterId,
        }),
      })
      const data = await res.json()
      if (data.responses && Array.isArray(data.responses)) {
        const charMsgs: ChatMessage[] = data.responses.map(
          (r: { characterId: string; name: string; content: string }) => ({
            type: 'character' as const,
            content: r.content,
            characterId: r.characterId,
            name: r.name,
            color: CHARACTER_COLORS[r.characterId] ?? '#4A90D9',
          })
        )
        setMessages((prev) => [...prev, ...charMsgs])
      } else {
        const fallback: ChatMessage[] = MOCK_RESPONSES.map((r) => ({
          type: 'character' as const,
          content: r.content,
          characterId: r.characterId,
          name: r.name,
          color: r.color,
        }))
        setMessages((prev) => [...prev, ...fallback])
      }
    } catch {
      const fallback: ChatMessage[] = MOCK_RESPONSES.map((r) => ({
        type: 'character' as const,
        content: r.content,
        characterId: r.characterId,
        name: r.name,
        color: r.color,
      }))
      setMessages((prev) => [...prev, ...fallback])
    }
    setIsLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!mounted) return null

  const panel = (
    <>
      {/* Backdrop */}
      <div
        className="chat-panel-backdrop"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="chat-panel"
        role="dialog"
        aria-label="끼어들기 채팅"
        aria-modal="true"
      >
        {/* Header */}
        <div className="chat-panel-header">
          <div className="chat-panel-title">
            <span className="chat-panel-icon">💬</span>
            <span>끼어들기</span>
          </div>
          <button
            className="chat-panel-close"
            onClick={handleClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* Context quote */}
        <div className="chat-panel-context">
          <span className="chat-panel-context-label">원문</span>
          <span className="chat-panel-context-text">{conversationContext}</span>
        </div>

        {/* Messages */}
        <div className="chat-panel-messages" role="log" aria-live="polite">
          {messages.length === 0 && (
            <p className="chat-panel-empty">궁금한 것을 물어보세요!</p>
          )}

          {messages.map((msg, i) =>
            msg.type === 'user' ? (
              <div key={i} className="chat-bubble-row chat-bubble-row--user">
                <div className="chat-bubble chat-bubble--user">
                  {msg.content}
                </div>
                <div
                  className="chat-bubble-avatar chat-bubble-avatar--user"
                  aria-label="나"
                >
                  나
                </div>
              </div>
            ) : (
              <div key={i} className="chat-bubble-row chat-bubble-row--char">
                <div className="chat-bubble-avatar chat-bubble-avatar--char">
                  {CHARACTER_AVATARS[msg.characterId!] ? (
                    <Image
                      src={CHARACTER_AVATARS[msg.characterId!]}
                      alt={msg.name ?? ''}
                      width={28}
                      height={28}
                      style={{ imageRendering: 'pixelated', borderRadius: '4px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: msg.color }}>
                      {msg.name?.[0]}
                    </span>
                  )}
                </div>
                <div className="chat-bubble-body">
                  <span
                    className="chat-bubble-name"
                    style={{ color: msg.color }}
                  >
                    {msg.name}
                  </span>
                  <div
                    className="chat-bubble chat-bubble--char"
                    style={{ borderColor: `${msg.color}33` }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          )}

          {isLoading && (
            <div className="chat-bubble-row chat-bubble-row--char">
              <div className="chat-bubble-avatar chat-bubble-avatar--char chat-bubble-avatar--loading" />
              <div className="chat-loading-dots">
                <span className="dot dot-1" />
                <span className="dot dot-2" />
                <span className="dot dot-3" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-panel-input-row">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력..."
            maxLength={300}
            className="chat-panel-input"
            aria-label="메시지 입력"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            className="chat-panel-send"
            aria-label="전송"
          >
            전송
          </button>
        </div>
      </div>
    </>
  )

  return createPortal(panel, document.body)
}
