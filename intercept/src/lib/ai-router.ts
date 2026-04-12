/**
 * AI Router — routes intercept generation to Workers AI (Cloudflare) or Gemini fallback.
 *
 * On Cloudflare Pages runtime: uses Workers AI binding
 *   Primary:  @cf/google/gemma-4-26b-a4b-it
 *   Fallback: @cf/meta/llama-3.1-8b-instruct-fp8
 * On local dev (no CF binding): uses Gemini 2.5-flash REST API
 */

/** Workers AI models tried in order */
const WORKERS_AI_MODELS = [
  '@cf/google/gemma-4-26b-a4b-it',
  '@cf/meta/llama-3.1-8b-instruct-fp8',
]

interface WorkersAiTextResult {
  response: string
}

async function generateViaWorkersAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ai: any
  try {
    // Dynamic import keeps @opennextjs/cloudflare out of the static dependency graph,
    // which is required for the nodejs-runtime route chunk to load correctly on CF.
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    ai = env.AI
  } catch {
    // Not in Cloudflare runtime (local dev)
    return null
  }

  if (!ai) {
    console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'binding-not-found' }))
    return null
  }

  for (const modelId of WORKERS_AI_MODELS) {
    try {
      const result: WorkersAiTextResult = await ai.run(modelId, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      })

      const text = result.response ?? null
      if (text) {
        console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'ok', model_id: modelId }))
        return text
      }
    } catch (err) {
      console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'error', model_id: modelId, error: String(err) }))
      // Try next model in list
    }
  }

  return null
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
  // Try Workers AI first (Cloudflare runtime only) — tries multiple models in order
  const workersResult = await generateViaWorkersAI(systemPrompt, userPrompt)
  if (workersResult !== null) {
    return workersResult
  }

  // Fall back to Gemini 2.5-flash (local dev only; Korea may be geo-blocked on prod)
  return generateViaGemini(systemPrompt, userPrompt)
}
