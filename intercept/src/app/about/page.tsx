import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '서비스 소개 — INTERCEPT',
  description: 'AI 대화에 끼어들다. INTERCEPT는 AI 캐릭터들의 티타임 대화에 사용자가 직접 참여하는 인터랙티브 뉴스 플랫폼입니다.',
}

interface Character {
  name: string
  role: string
  color: string
  description: string
}

const CHARACTERS: Character[] = [
  {
    name: '코부장',
    role: '개발부장',
    color: 'var(--color-ko)',
    description: '기술 트렌드의 큰 그림을 그리는 베테랑. 복잡한 기술 이슈를 꿰뚫는 날카로운 시각으로 팀을 이끈다.',
  },
  {
    name: '덱과장',
    role: '기획과장',
    color: 'var(--color-dek)',
    description: '비즈니스 임팩트와 시장 동향에 밝은 전략가. AI 기술이 실제 사업에 미치는 영향을 가장 먼저 파악한다.',
  },
  {
    name: '제대리',
    role: '개발대리',
    color: 'var(--color-je)',
    description: '최신 기술에 열정적인 주니어 개발자. 새로운 것이라면 무조건 써봐야 직성이 풀리는 탐구형 인재.',
  },
]

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: 'var(--space-xl) var(--space-lg)',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div
          style={{
            textAlign: 'center',
            paddingBottom: 'var(--space-2xl)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'var(--color-bg-muted)',
              color: 'var(--color-coral)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: 'var(--radius-pill)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-md)',
            }}
          >
            서비스 소개
          </div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 900,
              color: 'var(--color-coral)',
              margin: '0 0 var(--space-md)',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            INTERCEPT
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-md)',
              letterSpacing: '-0.02em',
            }}
          >
            AI 대화에 끼어들다
          </p>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: '520px',
              marginInline: 'auto',
            }}
          >
            매일 아침 AI 캐릭터들이 최신 AI 뉴스를 수다 형식으로 정리합니다.
            대화를 읽다가 궁금한 게 생기면? 언제든 끼어들어 질문하세요.
          </p>
        </div>

        {/* ── 서비스 소개 ──────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-lg)',
              letterSpacing: '-0.02em',
            }}
          >
            어떤 서비스인가요?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[
              {
                step: '01',
                title: '매일 아침 티타임',
                desc: '코부장, 덱과장, 제대리가 그날의 AI 뉴스를 가볍고 솔직하게 수다 형식으로 풀어냅니다.',
              },
              {
                step: '02',
                title: '대화 중간에 끼어들기',
                desc: '흥미로운 주제가 나왔나요? 대화 흐름을 끊지 말고 그냥 끼어드세요. 질문을 입력하면 AI가 바로 답합니다.',
              },
              {
                step: '03',
                title: '공유하고 레벨업',
                desc: '내 끼어들기를 카드로 만들어 SNS에 공유하고, 끼어들기 횟수에 따라 직급이 올라갑니다.',
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="card"
                style={{
                  padding: 'var(--space-lg)',
                  display: 'flex',
                  gap: 'var(--space-lg)',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: 'var(--color-coral)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {step}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 800,
                      color: 'var(--color-navy)',
                      marginBottom: '4px',
                    }}
                  >
                    {title}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.65,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 캐릭터 소개 ──────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-navy)',
              margin: '0 0 var(--space-lg)',
              letterSpacing: '-0.02em',
            }}
          >
            Offspace 직원들을 소개합니다
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {CHARACTERS.map((char) => (
              <div
                key={char.name}
                className="card"
                style={{
                  padding: 'var(--space-lg)',
                  borderLeft: `4px solid ${char.color}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <span
                    style={{
                      background: char.color,
                      color: '#fff',
                      borderRadius: 'var(--radius-pill)',
                      padding: '4px 16px',
                      fontSize: '0.875rem',
                      fontWeight: 800,
                    }}
                  >
                    {char.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {char.role}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9375rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.65,
                  }}
                >
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Offspace 소개 ─────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div
            className="card"
            style={{
              padding: 'var(--space-xl)',
              background: 'var(--color-navy)',
              border: 'none',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-coral)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-md)',
              }}
            >
              만든 곳
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 var(--space-md)',
                letterSpacing: '-0.02em',
              }}
            >
              Offspace
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7,
              }}
            >
              Offspace는 AI와 사람이 함께 일하는 미래를 만드는 팀입니다.
            </p>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
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
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            오늘의 티타임이 기다리고 있어요
          </p>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-lg)',
              lineHeight: 1.6,
            }}
          >
            코부장, 덱과장, 제대리의 AI 뉴스 대화에 끼어들어 보세요.
          </p>
          <Link href="/teatime" className="btn-primary">
            티타임 바로가기 →
          </Link>
        </div>

      </div>
    </div>
  )
}
