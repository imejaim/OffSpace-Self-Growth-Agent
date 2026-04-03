import { SAMPLE_TEATIME, CHARACTERS } from '@/lib/teatime-data'
import type { Message, Topic, Reference } from '@/lib/teatime-data'
import InterceptButton from './InterceptButton'

function starRating(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

function MessageBubble({ message }: { message: Message }) {
  const character = CHARACTERS[message.characterId]
  if (!character) return null

  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
        style={{ backgroundColor: character.color }}
      >
        {character.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-1" style={{ color: character.color }}>
          {character.name}
          <span className="text-gray-400 font-normal ml-1">· {character.role}</span>
        </p>
        <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm border border-gray-100">
          {message.content}
        </p>
      </div>
    </div>
  )
}

function ReferenceCard({ reference: r }: { reference: Reference }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
        {r.title}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-xs text-gray-400">{r.source}</span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400">{r.date}</span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-yellow-500">{starRating(r.rating)}</span>
      </div>
    </a>
  )
}

function TopicSection({ topic }: { topic: Topic }) {
  return (
    <details className="group" open>
      <summary className="flex items-center gap-2 cursor-pointer list-none select-none py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors">
        <span className="text-xl">{topic.icon}</span>
        <span className="font-semibold text-gray-800 flex-1">{topic.title}</span>
        <span className="text-gray-400 text-sm group-open:rotate-180 transition-transform duration-200 inline-block">
          ▾
        </span>
      </summary>

      <div className="mt-3 space-y-3 pl-2">
        {topic.messages.map((msg) =>
          msg.type === 'intercept-point' ? (
            <div key={msg.id}>
              <div className="flex items-center gap-2 my-2 px-2">
                <div className="flex-1 h-px bg-purple-100" />
                <span className="text-xs text-purple-400 font-medium px-2">끼어들 수 있어요</span>
                <div className="flex-1 h-px bg-purple-100" />
              </div>
              <InterceptButton messageId={msg.id} promptText={msg.content} />
            </div>
          ) : (
            <MessageBubble key={msg.id} message={msg} />
          )
        )}

        {topic.references.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-1">📎 참고 링크</p>
            <div className="space-y-2">
              {topic.references.map((r, i) => (
                <ReferenceCard key={i} reference={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  )
}

export default function TeaTimePage() {
  const teatime = SAMPLE_TEATIME

  const dateObj = new Date(teatime.date)
  const dateLabel = dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">Offspace 티타임</h1>
            <p className="text-xs text-gray-400">코부장 · 덱과장 · 제대리의 AI 수다</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date banner */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">
                {teatime.title}
              </p>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                오늘의 AI 동향 브리핑
              </h2>
              <p className="text-sm text-gray-500 mt-1">{dateLabel}</p>
            </div>
            <div className="text-4xl">🗞️</div>
          </div>
          <p className="mt-3 text-sm text-gray-500 italic border-t border-gray-100 pt-3">
            {teatime.intro}
          </p>

          {/* Character avatars */}
          <div className="flex gap-3 mt-4">
            {(['kobu', 'dek', 'je'] as const).map((id) => {
              const c = CHARACTERS[id]
              return (
                <div key={id} className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name[0]}
                  </div>
                  <span className="text-xs text-gray-600">{c.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          {teatime.topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-3xl shadow-sm border border-amber-100 p-4"
            >
              <TopicSection topic={topic} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Offspace 티타임 · 매일 아침 AI 동향을 수다로 정리합니다 ☕
          </p>
        </div>
      </main>
    </div>
  )
}
