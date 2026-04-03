'use client'

import { useState, useRef, useEffect } from 'react'

interface InterceptResponse {
  characterId: string
  name: string
  color: string
  content: string
}

const MOCK_RESPONSES: Record<string, InterceptResponse[]> = {
  default: [
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
        '맞아요! 그리고 요즘 트렌드가 딱 그 방향으로 가고 있거든요. 더 궁금한 거 있으면 언제든 끼어드세요 ㅋㅋ 저희 티타임 항상 열려있어요~',
    },
  ],
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
  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [responses, setResponses] = useState<InterceptResponse[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  async function handleSubmit() {
    const msg = inputValue.trim()
    if (!msg) return

    setUserMessage(msg)
    setIsLoading(true)
    setSubmitted(true)

    try {
      const res = await fetch('/api/intercept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationContext,
          userMessage: msg,
          characterId,
        }),
      })
      const data = await res.json()
      if (data.responses) {
        const CHARACTER_COLORS: Record<string, string> = {
          kobu: '#4A90D9',
          oh: '#E67E22',
          jem: '#27AE60',
        }
        setResponses(
          data.responses.map((r: { characterId: string; name: string; content: string }) => ({
            ...r,
            color: CHARACTER_COLORS[r.characterId] ?? '#4A90D9',
          }))
        )
      } else {
        setResponses(MOCK_RESPONSES['default'])
      }
    } catch {
      setResponses(MOCK_RESPONSES['default'])
    }
    setIsLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      handleReset()
    }
  }

  function handleReset() {
    setInputValue('')
    setSubmitted(false)
    setUserMessage('')
    setResponses([])
    setIsLoading(false)
    onClose()
  }

  return (
    <div className="intercept-panel" role="region" aria-label="끼어들기 입력">
      {!submitted ? (
        <div className="intercept-input-row">
          <span className="intercept-label">나:</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="궁금한 것을 물어보세요..."
            maxLength={200}
            className="intercept-input"
            aria-label="끼어들기 메시지 입력"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="intercept-submit"
            aria-label="전송"
          >
            전송
          </button>
          <button
            onClick={handleReset}
            className="intercept-cancel"
            aria-label="취소"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="intercept-thread">
          <div className="intercept-user-msg">
            <span className="intercept-name-user">나</span>
            <span className="intercept-msg-text">{userMessage}</span>
          </div>

          {isLoading && (
            <div className="intercept-loading">
              <span>...</span>
            </div>
          )}

          {responses.map((res) => (
            <div key={res.characterId} className="intercept-char-msg">
              <span
                className="intercept-char-name"
                style={{ color: res.color }}
              >
                {res.name}
              </span>
              <span className="intercept-msg-text">{res.content}</span>
            </div>
          ))}

          {!isLoading && responses.length > 0 && (
            <button onClick={handleReset} className="intercept-close">
              닫기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
