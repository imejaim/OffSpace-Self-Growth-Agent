/**
 * AI Router — routes intercept generation to Workers AI (Cloudflare) or Gemini fallback.
 *
 * On Cloudflare Pages runtime: uses Workers AI binding (AI = @cf/google/gemma-4-12b-it)
 * On local dev / fallback: uses Gemini 2.5-flash REST API
 */

interface WorkersAiResult {
  response: string
}

async function generateViaWorkersAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    // async: true required when called inside a request handler
    const { env } = await getCloudflareContext({ async: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ai = (env as any).AI
    if (!ai) {
      console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'binding-not-found' }))
      return null
    }

    const result: WorkersAiResult = await ai.run('@cf/google/gemma-4-12b-it', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    })

    console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'ok' }))
    return result.response ?? null
  } catch (err) {
    console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'error', error: String(err) }))
    return null
  }
}

async function generateViaGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  console.log(JSON.stringify({ type: 'ai-router', model: 'gemini-2.5-flash', status: 'ok' }))
  return text
}

/**
 * Generate an intercept AI response using the best available model.
 * Returns the raw text output (JSON array string) from the model.
 */
export async function generateInterceptResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // Try Workers AI first (Cloudflare Pages runtime only)
  const workersResult = await generateViaWorkersAI(systemPrompt, userPrompt)
  if (workersResult !== null) {
    return workersResult
  }

  // Fall back to Gemini 2.5-flash
  return generateViaGemini(systemPrompt, userPrompt)
}
