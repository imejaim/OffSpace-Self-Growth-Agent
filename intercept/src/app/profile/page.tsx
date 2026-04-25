import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '나의 인터셉트 히스토리 — INTERCEPT', // MODIFIED: Rebranding '끼어들기' to '인터셉트'
  description: '내가 AI 대화에서 인터셉트한 기록과 레벨을 확인하세요.', // MODIFIED: Rebranding '끼어들기' to '인터셉트'
}

// Level system
interface Level {
  name: string
  minCount: number
  maxCount: number
  color: string
  label: string
}

const LEVELS: Level[] = [
  { name: '신입', minCount: 0, maxCount: 5, color: '#95A5A6', label: '신입' },
  { name: '인턴', minCount: 6, maxCount: 20, color: '#3498DB', label: '인턴' },
  { name: '사원', minCount: 21, maxCount: 50, color: '#27AE60', label: '사원' },
  { name: '대리', minCount: 51, maxCount: 100, color: '#E67E22', label: '대리' },
  { name: '과장', minCount: 101, maxCount: Infinity, color: '#9B59B6', label: '과장' },
]

function getLevel(count: number): Level {
  return LEVELS.find((l) => count >= l.minCount && count <= l.maxCount) ?? LEVELS[0]
}

function getNextLevel(count: number): Level | null {
  const currentIdx = LEVELS.findIndex((l) => count >= l.minCount && count <= l.maxCount)
  return currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null
}

// Mock intercept history — replace with real data fetch
interface InterceptRecord {
  id: string
  date: string
  topic: string
  character: string
  myQuestion: string
  aiAnswer: string
}

const MOCK_HISTORY: InterceptRecord[] = [
  {
    id: 'demo',
    date: '2026-04-03',
    topic: 'GPT-5 출시',
    character: '코부장',
    myQuestion: '그럼 우리 같은 스타트업은 이걸 어떻게 활용해야 하나요?',
    aiAnswer:
      'GPT-5의 향상된 추론 능력은 스타트업에게 특히 유리합니다. 코드 생성, 고객 지원 자동화, 데이터 분석 등에서 인력 대비 10배 이상의 생산성을 기대할 수 있어요.',
  },
  {
    id: 'demo2',
    date: '2026-04-02',
    topic: 'AI 에이전트 트렌드',
    character: '오과장',
    myQuestion: '에이전트가 실제 비즈니스에 쓰이려면 얼마나 더 걸릴까요?',
    aiAnswer:
      '이미 일부 기업에서는 반복적인 데이터 처리나 이메일 분류에 에이전트를 활용하고 있습니다. 2026년 하반기면 SMB 시장에도 본격 진입할 것으로 보입니다.',
  },
  {
    id: 'demo3',
    date: '2026-04-01',
    topic: '오픈소스 LLM 동향',
    character: '젬대리',
    myQuestion: 'Llama 4가 나왔는데 이게 정말 GPT-4 급인가요?',
    aiAnswer:
      '벤치마크 기준으로는 특정 태스크에서 GPT-4o와 유사한 성능을 보이고 있습니다. 특히 코드 생성과 수학 추론에서 강점을 보이고, 로컬 실행이 가능하다는 점이 핵심 차별점입니다.',
  },
]

const CHARACTER_COLORS: Record<string, string> = {
  코부장: '#4A90D9',
  오과장: '#E67E22',
  젬대리: '#27AE60',
}

// Mock stats
const TOTAL_COUNT = MOCK_HISTORY.length
const STREAK_DAYS = 3

export default function ProfilePage() {
  const level = getLevel(TOTAL_COUNT)
  const nextLevel = getNextLevel(TOTAL_COUNT)
  const progressToNext = nextLevel
    ? Math.round(((TOTAL_COUNT - level.minCount) / (nextLevel.minCount - level.minCount)) * 100)
    : 100

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-xl) var(--space-lg)',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Page title */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: 'var(--color-navy)',
              margin: '0 0 6px',
              letterSpacing: '-0.03em',
            }}
          >
            나의 인터셉트 히스토리 {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0 }}>
            AI 대화를 얼마나 인터셉트했는지 확인해 보세요 {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          {/* Total count */}
          <div
            className="card"
            style={{
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--color-coral)',
                lineHeight: 1,
                marginBottom: '6px',
              }}
            >
              {TOTAL_COUNT}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              총 인터셉트 {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
            </div>
          </div>

          {/* Streak */}
          <div
            className="card"
            style={{
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#E67E22',
                lineHeight: 1,
                marginBottom: '6px',
              }}
            >
              {STREAK_DAYS}일
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              연속 참여
            </div>
          </div>

          {/* Level badge */}
          <div
            className="card"
            style={{
              padding: 'var(--space-lg)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.75rem',
                lineHeight: 1,
                marginBottom: '6px',
                fontWeight: 900,
                color: level.color,
              }}
            >
              {level.label}
            </div>
            <div
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
              }}
            >
              {level.name}
            </div>
          </div>
        </div>

        {/* Level progress card */}
        <div
          className="card"
          style={{
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: level.color,
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '4px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                }}
              >
                {level.label}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {TOTAL_COUNT}회 달성
              </span>
            </div>
            {nextLevel && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                다음: {nextLevel.label} ({nextLevel.minCount}회~)
              </span>
            )}
          </div>

          {/* Progress bar */}
          {nextLevel && (
            <div>
              <div
                style={{
                  height: '8px',
                  background: 'var(--color-border)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressToNext}%`,
                    background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})`,
                    borderRadius: '9999px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>{level.minCount}회</span>
                <span>{progressToNext}% 달성</span>
                <span>{nextLevel.minCount}회</span>
              </div>
            </div>
          )}

          {/* Level guide */}
          <div
            style={{
              marginTop: 'var(--space-md)',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {LEVELS.map((l) => (
              <span
                key={l.name}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: TOTAL_COUNT >= l.minCount ? l.color : 'var(--color-border)',
                  color: TOTAL_COUNT >= l.minCount ? '#fff' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* History list */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-md)',
              letterSpacing: '-0.02em',
            }}
          >
            인터셉트 기록 {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {MOCK_HISTORY.map((record) => {
              const charColor = CHARACTER_COLORS[record.character] ?? '#4A90D9'
              return (
                <div
                  key={record.id}
                  className="card"
                  style={{ padding: 'var(--space-lg)' }}
                >
                  {/* Record header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-md)',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: 'var(--color-bg-muted)',
                          color: 'var(--color-coral)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        {record.topic}
                      </span>
                      <span
                        style={{
                          background: charColor,
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        {record.character}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {record.date}
                    </span>
                  </div>

                  {/* My question */}
                  <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-ceo)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      나의 질문
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        lineHeight: 1.5,
                      }}
                    >
                      {record.myQuestion}
                    </p>
                  </div>

                  {/* AI answer (truncated) */}
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-coral)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      AI 답변
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.65,
                      }}
                    >
                      {record.aiAnswer.length > 100
                        ? record.aiAnswer.slice(0, 100) + '…'
                        : record.aiAnswer}
                    </p>
                  </div>

                  {/* View full link */}
                  <div style={{ marginTop: 'var(--space-md)', textAlign: 'right' }}>
                    <Link
                      href={`/share/${record.id}`}
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--color-coral)',
                        textDecoration: 'none',
                      }}
                    >
                      전체 보기 →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-xl)',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              margin: '0 0 8px',
            }}
          >
            오늘의 뉴스가 기다리고 있어요!
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-lg)',
            }}
          >
            당신만의 뉴스 대화를 인터셉트하여 레벨을 올려보세요. {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
          </p>
          <Link href="/teatime" className="btn-primary">
            티타임 바로가기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
