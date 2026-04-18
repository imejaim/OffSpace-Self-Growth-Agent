'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/context'
import { useAuth } from '@/components/AuthProvider'

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

interface ChatMessage {
  type: 'user' | 'character'
  content: string
  characterId?: string
  name?: string
  color?: string
}

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
  const { t } = useI18n()
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [interceptError, setInterceptError] = useState<string | null>(null)
  const [userLabel, setUserLabel] = useState<string>(t.common.you)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const authName =
      (user?.user_metadata?.full_name as string | undefined) ??
      user?.email?.split('@')[0]
    if (authName) {
      setUserLabel(authName)
      return
    }
    try {
      const stored = localStorage.getItem('intercept-nickname')
      if (stored && stored.trim()) {
        setUserLabel(stored)
        return
      }
    } catch {
      // Ignore storage failures.
    }
    setUserLabel(t.common.you)
  }, [user, t.common.you])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    return () => {
      document.body.classList.remove('intercept-loading')
    }
  }, [])

  async function handleSubmit() {
    const msg = inputValue.trim()
    if (!msg || isLoading) return

    const userMsg: ChatMessage = { type: 'user', content: msg }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setInterceptError(null)
    setIsLoading(true)
    document.body.classList.add('intercept-loading')

    const historyContext = messages
      .map((m) => (m.type === 'user' ? `${userLabel}: ${m.content}` : `${m.name}: ${m.content}`))
      .join('\n')
    const fullContext = historyContext
      ? `${conversationContext}\n\n[Previous conversation]\n${historyContext}`
      : conversationContext

    try {
      const res = await fetch('/api/intercept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationContext: fullContext,
          userMessage: msg,
          characterId,
          messageId,
          nickname: localStorage.getItem('intercept-nickname'),
          sessionId: localStorage.getItem('intercept-session-id'),
        }),
      })
      const data = await res.json()
      if (data.responses && Array.isArray(data.responses)) {
        const charMsgs: ChatMessage[] = data.responses.map(
          (r: { characterId: string; name: string; content: string }) => ({
            type: 'character',
            content: r.content,
            characterId: r.characterId,
            name: r.name,
            color: CHARACTER_COLORS[r.characterId] ?? '#4A90D9',
          })
        )
        setMessages((prev) => [...prev, ...charMsgs])
      } else {
        setInterceptError(t.teatime.interceptNetworkError)
      }
    } catch {
      setInterceptError(t.teatime.interceptNetworkError)
    } finally {
      setIsLoading(false)
      document.body.classList.remove('intercept-loading')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="intercept-inline">
      <div className="intercept-inline-header">
        <span className="intercept-inline-label">{t.teatime.interceptPanelTitle}</span>
        <button
          className="intercept-inline-close"
          onClick={onClose}
          aria-label={t.teatime.interceptClose}
        >
          ×
        </button>
      </div>

      {messages.length > 0 && (
        <div className="intercept-inline-messages" role="log" aria-live="polite">
          {messages.map((msg, i) =>
            msg.type === 'user' ? (
              <div key={i} className="chat-bubble-row chat-bubble-row--user">
                <div
                  className="chat-bubble-body chat-bubble-body--user"
                  style={{ alignItems: 'flex-end' }}
                >
                  <span
                    className="chat-bubble-name"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {userLabel}
                  </span>
                  <div className="chat-bubble chat-bubble--user">{msg.content}</div>
                </div>
                <div
                  className="chat-bubble-avatar chat-bubble-avatar--user"
                  aria-label={userLabel}
                >
                  {userLabel.slice(0, 2)}
                </div>
              </div>
            ) : (
              <div key={i} className="chat-bubble-row chat-bubble-row--char">
                <div className="chat-bubble-avatar chat-bubble-avatar--char">
                  {msg.characterId && CHARACTER_AVATARS[msg.characterId] ? (
                    <Image
                      src={CHARACTER_AVATARS[msg.characterId]}
                      alt={msg.name ?? ''}
                      width={28}
                      height={28}
                      style={{ imageRendering: 'pixelated', borderRadius: '4px' }}
                    />
                  ) : (
                    <span
                      style={{ fontSize: '0.65rem', fontWeight: 700, color: msg.color }}
                    >
                      {msg.name?.[0]}
                    </span>
                  )}
                </div>
                <div className="chat-bubble-body">
                  <span className="chat-bubble-name" style={{ color: msg.color }}>
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
      )}

      {interceptError && (
        <div className="intercept-inline-error" role="alert">
          {interceptError}
        </div>
      )}

      <div className="intercept-inline-input-row">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.teatime.interceptPlaceholder}
          maxLength={300}
          className="intercept-input chat-panel-input"
          aria-label={t.teatime.interceptInputAria}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isLoading}
          className="chat-panel-send"
          aria-label={t.teatime.interceptSend}
        >
          {t.teatime.interceptSend}
        </button>
      </div>
    </div>
  )
}
