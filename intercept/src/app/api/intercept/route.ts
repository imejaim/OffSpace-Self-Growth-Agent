import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `당신은 INTERCEPT라는 AI 뉴스 토론 플랫폼의 세 캐릭터입니다. 사용자가 AI 캐릭터들의 대화에 끼어들었을 때, 해당 캐릭터들이 자연스럽게 반응해야 합니다.

세 캐릭터:

1. 코부장 (코드명: kobu) — 개발부장. 10년 이상 경력의 베테랑 개발자. 큰 그림을 보고, 권위 있지만 친근하다. 말투: 차분하고 통찰력 있음. "~군요", "~네요" 등 격식 있는 반말 사용.

2. 오과장 (코드명: oh) — 기획과장. 전략과 데이터를 중시하는 비즈니스 마인드. 숫자와 근거를 좋아함. 말투: 논리적이고 분석적. "~입니다", "~죠" 등 정중한 표현 사용.

3. 젬대리 (코드명: jem) — 개발대리. 열정 넘치는 신입 개발자. 최신 트렌드에 밝고 캐주얼함. 말투: 신나고 활기참. "ㅋㅋ", "ㅎㅎ", "~요!" 등 캐주얼한 표현 사용.

규칙:
- 항상 정확히 2명의 캐릭터가 응답합니다
- 각 응답은 1~3문장으로 간결하게
- 사용자가 방금 대화에 끼어든 것처럼 자연스럽게 반응 (당황하거나 반기거나 논쟁하거나)
- 한국어로만 응답
- 마크다운 없이 순수 텍스트만 사용
- 반드시 아래 JSON 배열 형식만 반환하고 다른 텍스트는 절대 포함하지 마세요:
[
  {"characterId": "kobu", "name": "코부장", "content": "..."},
  {"characterId": "oh", "name": "오과장", "content": "..."}
]`

interface InterceptRequest {
  conversationContext: string
  userMessage: string
  characterId?: string
}

interface CharacterResponse {
  characterId: string
  name: string
  content: string
}

const CHARACTER_NAMES: Record<string, string> = {
  kobu: '코부장',
  oh: '오과장',
  jem: '젬대리',
}

function buildUserPrompt(
  conversationContext: string,
  userMessage: string,
  characterId?: string
): string {
  let prompt = `[현재 대화 맥락]\n${conversationContext}\n\n[사용자의 끼어들기]\n${userMessage}`

  if (characterId && CHARACTER_NAMES[characterId]) {
    prompt += `\n\n위 메시지는 ${CHARACTER_NAMES[characterId]}의 발언에 대한 반응입니다. ${CHARACTER_NAMES[characterId]}는 반드시 응답에 포함해야 합니다.`
  }

  prompt +=
    '\n\n이 상황에 가장 적합한 2명의 캐릭터를 선택해 자연스럽게 반응해 주세요. JSON 배열만 반환하세요.'

  return prompt
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API 키가 설정되지 않았습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }

  let body: InterceptRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: '요청 형식이 올바르지 않습니다.' },
      { status: 400 }
    )
  }

  const { conversationContext, userMessage, characterId } = body

  if (!conversationContext || !userMessage) {
    return NextResponse.json(
      { error: '대화 맥락과 메시지를 모두 입력해 주세요.' },
      { status: 400 }
    )
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: buildUserPrompt(conversationContext, userMessage, characterId) },
              ],
            },
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('[Gemini API Error]', geminiRes.status, errText)
      return NextResponse.json(
        { error: 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 502 }
      )
    }

    const geminiData = await geminiRes.json()
    const rawText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Strip possible markdown code fences
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let responses: CharacterResponse[]
    try {
      responses = JSON.parse(cleaned)
    } catch {
      console.error('[Gemini Parse Error] raw:', rawText)
      return NextResponse.json(
        { error: 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ responses })
  } catch (err) {
    console.error('[Intercept Route Error]', err)
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }
}
