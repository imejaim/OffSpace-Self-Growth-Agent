'use client'

import { useState } from 'react'
import { SAMPLE_TEATIME, CHARACTERS } from '@/lib/teatime-data'
import type { Message, Topic, Reference } from '@/lib/teatime-data'
import InterceptButton from './InterceptButton'

function starRating(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Render **bold** markdown inline
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function ConversationMessage({ message }: { message: Message }) {
  const character = CHARACTERS[message.characterId]
  const [interceptOpen, setInterceptOpen] = useState(false)

  if (!character) return null

  const context = `${character.name}: ${message.content}`

  return (
    <div className="conversation-line">
      <div className="conversation-msg">
        <span className="char-name" style={{ color: character.color }}>
          {character.name}
        </span>
        <span className="char-role">{character.role}</span>
        <span className="msg-text">
          <InlineMarkdown text={message.content} />
        </span>
        {!interceptOpen && (
          <button
            className="intercept-hint"
            onClick={() => setInterceptOpen(true)}
            aria-label="여기서 끼어들기"
          >
            끼어들기
          </button>
        )}
      </div>

      {interceptOpen && (
        <InterceptButton
          messageId={message.id}
          conversationContext={context}
          characterId={message.characterId}
          onClose={() => setInterceptOpen(false)}
        />
      )}
    </div>
  )
}

function ReferenceList({ references }: { references: Reference[] }) {
  if (references.length === 0) return null
  return (
    <div className="reference-section">
      <p className="reference-heading">참고 링크</p>
      <ul className="reference-list">
        {references.map((r, i) => (
          <li key={i}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="reference-link"
            >
              {r.title}
            </a>
            <span className="reference-meta">
              {r.source} · {r.date} · <span className="reference-stars">{starRating(r.rating)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TopicSection({ topic, index }: { topic: Topic; index: number }) {
  return (
    <section className="topic-section">
      <h2 className="topic-heading">
        {index + 1}. {topic.title}
      </h2>

      <div className="topic-messages">
        {topic.messages.map((msg) => (
          <ConversationMessage key={msg.id} message={msg} />
        ))}
      </div>

      <ReferenceList references={topic.references} />
    </section>
  )
}

export default function TeaTimePage() {
  const teatime = SAMPLE_TEATIME

  const dateObj = new Date(teatime.date)
  const dateLabel = dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="teatime-root">
      <header className="teatime-header">
        <div className="teatime-header-inner">
          <span className="teatime-pub">Offspace 티타임</span>
          <span className="teatime-date">{dateLabel}</span>
        </div>
      </header>

      <main className="teatime-main">
        <div className="teatime-masthead">
          <h1 className="teatime-title">{teatime.title}</h1>
          <p className="teatime-intro">{teatime.intro}</p>
          <div className="teatime-byline">
            {(['kobu', 'oh', 'jem'] as const).map((id) => {
              const c = CHARACTERS[id]
              if (!c) return null
              return (
                <span key={id} className="byline-char" style={{ color: c.color }}>
                  {c.name}
                </span>
              )
            })}
          </div>
          <p className="teatime-intercept-hint">
            어디든 끼어들어 궁금한 것을 더 물어보고 의견 남길 수 있어요
          </p>
        </div>

        <hr className="teatime-rule" />

        {teatime.topics.map((topic, i) => (
          <TopicSection key={topic.id} topic={topic} index={i} />
        ))}

        <footer className="teatime-footer">
          <p>Offspace 티타임 · 매일 아침 AI 동향을 수다로 정리합니다</p>
        </footer>
      </main>
    </div>
  )
}
