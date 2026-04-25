import type { Metadata } from 'next'
import Link from 'next/link'
import ShareCard from '@/components/ShareCard'

type Props = {
  params: Promise<{ id: string }>
}

// Mock data — replace with DB fetch when backend is ready
interface InterceptData {
  id: string
  character: string
  characterMsg: string
  userQuestion: string
  aiAnswer: string
  date: string
  topic: string
}

async function getIntercept(id: string): Promise<InterceptData> {
  // MVP: return mock data keyed by id
  const mockData: Record<string, InterceptData> = {
    demo: {
      id: 'demo',
      character: '코부장',
      characterMsg:
        'OpenAI가 GPT-5를 출시하면서 AI 업계에 또 한번 큰 파장이 일고 있습니다. 추론 능력이 획기적으로 향상됐다고 하는데요.',
      userQuestion: '그럼 우리 같은 스타트업은 이걸 어떻게 활용해야 하나요?',
      aiAnswer:
        'GPT-5의 향상된 추론 능력은 스타트업에게 특히 유리합니다. 코드 생성, 고객 지원 자동화, 데이터 분석 등에서 인력 대비 10배 이상의 생산성을 기대할 수 있어요. 핵심은 자사 도메인 데이터와 결합한 파인튜닝이나 RAG 파이프라인 구축입니다.',
      date: '2026-04-03',
      topic: 'GPT-5 출시',
    },
  }

  return (
    mockData[id] ?? {
      id,
      character: '코부장',
      characterMsg: '오늘의 AI 뉴스를 분석해 드립니다.',
      userQuestion: '흥미로운 질문입니다!',
      aiAnswer: '이 인터셉트 내용을 찾을 수 없습니다.',
      date: '2026-04-03',
      topic: 'AI 뉴스',
    }
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const intercept = await getIntercept(id)

  const ogParams = new URLSearchParams({
    character: intercept.character,
    characterMsg: intercept.characterMsg.slice(0, 120),
    userQuestion: intercept.userQuestion.slice(0, 120),
    aiAnswer: intercept.aiAnswer.slice(0, 150),
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const ogImageUrl = `${baseUrl}/api/og?${ogParams}`

  return {
    title: `"${intercept.userQuestion.slice(0, 50)}…" — INTERCEPT`,
    description: `${intercept.character}의 AI 뉴스 대화에서 인터셉트한 나의 질문: ${intercept.userQuestion.slice(0, 100)}`,
    openGraph: {
      title: `INTERCEPT — AI 대화를 인터셉트하다`,
      description: intercept.userQuestion.slice(0, 120),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'INTERCEPT 공유 카드',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `INTERCEPT — AI 대화를 인터셉트하다`, // MODIFIED: Rebranding '끼어들기' to '인터셉트'
      description: intercept.userQuestion.slice(0, 120),
      images: [ogImageUrl],
    },
  }
}

const CHARACTER_COLORS: Record<string, string> = {
  코부장: '#4A90D9',
  오과장: '#E67E22',
  젬대리: '#27AE60',
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const intercept = await getIntercept(id)
  const charColor = CHARACTER_COLORS[intercept.character] ?? '#4A90D9'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-xl) var(--space-lg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '640px' }}>
        {/* Topic label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <span
            style={{
              background: 'var(--color-bg-muted)',
              color: 'var(--color-coral)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {intercept.topic}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {intercept.date}
          </span>
        </div>

        {/* Main intercept card */}
        <div
          className="card"
          style={{
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', paddingBottom: 'var(--space-md)' }}>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--color-coral)',
              }}
            >
              INTERCEPT
            </span>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                margin: '4px 0 0',
              }}
            >
              AI 대화 인터셉트 공유 {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
            </p>
          </div>

          {/* Character message */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: charColor,
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '4px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                {intercept.character}
              </span>
              <span
                style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
              >
                의 뉴스 분석
              </span>
            </div>
            <div
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                lineHeight: 1.65,
                borderLeft: `3px solid ${charColor}`,
              }}
            >
              {intercept.characterMsg}
            </div>
          </div>

          {/* User question */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'var(--color-ceo)',
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '4px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                나의 인터셉트 {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
              </span>
            </div>
            <div
              style={{
                background: '#F5ECF9',
                border: '1px solid #D9A8F0',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                lineHeight: 1.65,
                fontWeight: 600,
                borderLeft: '3px solid var(--color-ceo)',
              }}
            >
              {intercept.userQuestion}
            </div>
          </div>

          {/* AI answer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'var(--color-coral)',
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '4px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                AI 답변
              </span>
            </div>
            <div
              style={{
                background: 'var(--color-bg-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                lineHeight: 1.75,
                borderLeft: '3px solid var(--color-coral)',
              }}
            >
              {intercept.aiAnswer}
            </div>
          </div>
        </div>

        {/* Share component */}
        <ShareCard
          interceptId={intercept.id}
          character={intercept.character}
          characterMsg={intercept.characterMsg}
          userQuestion={intercept.userQuestion}
          aiAnswer={intercept.aiAnswer}
        />

        {/* CTA */}
        <div
          style={{
            marginTop: 'var(--space-xl)',
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
            }}
          >
            AI 대화, 그냥 보기만 하세요?
          </p>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-lg)',
              lineHeight: 1.6,
            }}
          >
            코부장, 오과장, 젬대리의 티타임 대화를 인터셉트해 보세요. {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
          </p>
          <Link href="/teatime" className="btn-primary">
            나도 인터셉트해 보기 → {/* MODIFIED: Rebranding '끼어들기' to '인터셉트' */}
          </Link>
        </div>
      </div>
    </div>
  )
}
