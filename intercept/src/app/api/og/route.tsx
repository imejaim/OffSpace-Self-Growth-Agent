import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const character = searchParams.get('character') || '코부장'
  const characterMsg = searchParams.get('characterMsg') || 'AI가 최신 뉴스를 분석합니다'
  const userQuestion = searchParams.get('userQuestion') || '잠깐, 저도 한마디 해도 될까요?'
  const aiAnswer = searchParams.get('aiAnswer') || 'AI의 시각에서 바라본 통찰력 있는 답변입니다.'

  const characterColors: Record<string, string> = {
    코부장: '#4A90D9',
    오과장: '#E67E22',
    젬대리: '#27AE60',
  }
  const charColor = characterColors[character] ?? '#4A90D9'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#FFF9F5',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          padding: '0',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E8E 50%, #F7DC6F 100%)',
            display: 'flex',
          }}
        />

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 64px 40px',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '36px',
            }}
          >
            <span
              style={{
                fontSize: '32px',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#FF6B6B',
              }}
            >
              INTERCEPT
            </span>
            <span
              style={{
                fontSize: '16px',
                color: '#636E72',
                fontWeight: 500,
              }}
            >
              AI 대화를 인터셉트하다
            </span>
          </div>

          {/* Character message */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: charColor,
                color: '#fff',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {character}
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #F0E6DE',
                borderRadius: '12px',
                padding: '14px 20px',
                fontSize: '17px',
                color: '#2D3436',
                flex: 1,
                lineHeight: 1.5,
              }}
            >
              {characterMsg.length > 80 ? characterMsg.slice(0, 80) + '…' : characterMsg}
            </div>
          </div>

          {/* User intercept */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: '#9B59B6',
                color: '#fff',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              나의 인터셉트
            </div>
            <div
              style={{
                background: '#F5ECF9',
                border: '1px solid #D9A8F0',
                borderRadius: '12px',
                padding: '14px 20px',
                fontSize: '17px',
                color: '#2D3436',
                flex: 1,
                lineHeight: 1.5,
              }}
            >
              {userQuestion.length > 80 ? userQuestion.slice(0, 80) + '…' : userQuestion}
            </div>
          </div>

          {/* AI answer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: '#FF6B6B',
                color: '#fff',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              AI 답변
            </div>
            <div
              style={{
                background: '#FFF0E8',
                border: '1px solid #F0E6DE',
                borderRadius: '12px',
                padding: '14px 20px',
                fontSize: '17px',
                color: '#2D3436',
                flex: 1,
                lineHeight: 1.5,
              }}
            >
              {aiAnswer.length > 100 ? aiAnswer.slice(0, 100) + '…' : aiAnswer}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 64px',
            borderTop: '1px solid #F0E6DE',
            background: '#FFFFFF',
          }}
        >
          <span style={{ fontSize: '14px', color: '#636E72', fontWeight: 500 }}>
            intercept.offspace.kr — 나도 AI 대화를 인터셉트해 보세요
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
