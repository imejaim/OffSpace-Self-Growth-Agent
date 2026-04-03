'use client'

import { useState } from 'react'

interface MockResponse {
  characterId: string
  name: string
  color: string
  content: string
}

const MOCK_RESPONSES: Record<string, MockResponse[]> = {
  default: [
    {
      characterId: 'kobu',
      name: '코부장',
      color: '#4A90D9',
      content:
        '오 좋은 포인트에서 끼어드셨네요! 저도 처음엔 그 부분이 궁금했어요. 핵심은 결국 "실용화"예요 — 기술이 있어도 실제로 쓸 수 있어야 의미가 있으니까요.',
    },
    {
      characterId: 'je',
      name: '제대리',
      color: '#27AE60',
      content:
        '맞아요! 그리고 요즘 트렌드가 딱 그 방향으로 가고 있거든요. 더 궁금한 거 있으면 언제든 끼어드세요 ㅋㅋ 저희 티타임 항상 열려있어요~',
    },
  ],
  'AI 신약 개발, 여러분은 어떻게 생각하세요?': [
    {
      characterId: 'kobu',
      name: '코부장',
      color: '#4A90D9',
      content:
        '오 끼어드셨네요! AI 신약 개발 — 솔직히 저도 처음엔 반신반의했어요. 근데 실제로 임상 3상까지 간 케이스들이 나오면서 "진짜 되네?"로 바뀌고 있어요. 패러다임 전환이 맞는 것 같아요.',
    },
    {
      characterId: 'dek',
      name: '덱과장',
      color: '#E67E22',
      content:
        '기획 관점에서 보면, AI 신약이 진짜 의미있는 건 **개발 기간 단축**이에요. 기존 10~15년 걸리는 걸 3~5년으로 줄이면 환자 입장에서도, 제약사 입장에서도 게임체인저죠!',
    },
  ],
  '우리 팀도 에이전트 만드는 입장에서 — 어떤 게 제일 중요할까요?': [
    {
      characterId: 'kobu',
      name: '코부장',
      color: '#4A90D9',
      content:
        '끼어들어주셔서 감사해요! 우리 입장에서 제일 중요한 건 **보안 + MCP 표준 준수**예요. 에이전트가 혼자 판단하고 행동하는 만큼, 잘못된 판단이 큰 사고로 이어지거든요.',
    },
    {
      characterId: 'je',
      name: '제대리',
      color: '#27AE60',
      content:
        'MCP 표준 따라가면 나중에 다른 에이전트들이랑 연동도 쉬워요! 지금 우리 OffSpace 에이전트도 그 방향으로 만들고 있잖아요 ㅎㅎ',
    },
  ],
  '온디바이스 AI, 온프레미스 AI — 어떻게 다를까요?': [
    {
      characterId: 'kobu',
      name: '코부장',
      color: '#4A90D9',
      content:
        '좋은 질문이에요! 온디바이스는 **폰·자동차·IoT 같은 개별 기기**에서 AI가 직접 돌아가는 것, 온프레미스는 **회사 서버실에 AI 인프라를 구축**하는 거예요. 우리 블랙웰 서버가 딱 온프레미스죠!',
    },
    {
      characterId: 'dek',
      name: '덱과장',
      color: '#E67E22',
      content:
        '정리하면 온디바이스 ⊂ 엣지 AI, 온프레미스 ⊂ 엣지 AI예요. 스케일 차이! 온디바이스는 3B~30B, 온프레미스는 35B~120B+ 이런 식으로요.',
    },
  ],
}

interface InterceptButtonProps {
  messageId: string
  promptText: string
}

export default function InterceptButton({ messageId, promptText }: InterceptButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [responses, setResponses] = useState<MockResponse[]>([])

  function handleSubmit() {
    if (!inputValue.trim()) return
    const msg = inputValue.trim()
    setUserMessage(msg)

    const key = promptText in MOCK_RESPONSES ? promptText : 'default'
    setResponses(MOCK_RESPONSES[key])
    setSubmitted(true)
  }

  function handleReset() {
    setIsOpen(false)
    setInputValue('')
    setSubmitted(false)
    setUserMessage('')
    setResponses([])
  }

  if (!isOpen) {
    return (
      <div className="flex justify-center my-3">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm transition-all active:scale-95"
          style={{ backgroundColor: '#9B59B6' }}
        >
          <span>💬</span>
          <span>나도 끼기!</span>
        </button>
      </div>
    )
  }

  return (
    <div className="my-3 rounded-2xl border border-purple-200 bg-purple-50 p-4">
      <p className="text-xs font-semibold text-purple-500 mb-3 uppercase tracking-wide">
        💬 끼어들기
      </p>

      {!submitted ? (
        <>
          <p className="text-sm text-gray-600 mb-3 italic">"{promptText}"</p>
          <textarea
            className="w-full rounded-xl border border-purple-200 bg-white p-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
            rows={3}
            maxLength={200}
            placeholder="여기서 끼어들어 보세요! (최대 200자)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{inputValue.length}/200</span>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: '#9B59B6' }}
              >
                끼어들기!
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {/* User message */}
          <div className="flex gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
              style={{ backgroundColor: '#9B59B6' }}
            >
              나
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1" style={{ color: '#9B59B6' }}>
                나
              </p>
              <p className="text-sm text-gray-700 bg-white rounded-xl px-3 py-2 shadow-sm">
                {userMessage}
              </p>
            </div>
          </div>

          {/* AI character responses */}
          {responses.map((res) => (
            <div key={res.characterId} className="flex gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: res.color }}
              >
                {res.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1" style={{ color: res.color }}>
                  {res.name}
                </p>
                <p className="text-sm text-gray-700 bg-white rounded-xl px-3 py-2 shadow-sm">
                  {res.content}
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="text-xs text-purple-400 hover:text-purple-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
