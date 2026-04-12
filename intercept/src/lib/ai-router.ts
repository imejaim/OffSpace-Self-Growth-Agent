/**
 * AI Router — routes intercept generation to Workers AI (Cloudflare) or Gemini fallback.
 *
 * On Cloudflare Pages runtime: uses Workers AI binding
 *   Primary:  @cf/qwen/qwen2.5-coder-32b-instruct  (strong Korean, good JSON following)
 *   Fallback: @cf/meta/llama-3.3-70b-instruct-fp8-fast  (70B, decent Korean)
 *   Last-ditch: @cf/google/gemma-3-12b-it  (legacy)
 * On local dev (no CF binding): uses Gemini 2.5-flash REST API
 *
 * Llama 3.1 8B was removed from the fallback chain — it produces Korean token
 * repetition loops (slashes, garbled hangul, mid-sentence cuts).
 */

/** Workers AI models tried in order */
const WORKERS_AI_MODELS = [
  '@cf/qwen/qwen2.5-coder-32b-instruct',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/google/gemma-3-12b-it',
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
 * Scrub common small-model failure modes from raw AI output:
 * - Slash / punctuation repetition loops (e.g. "서/////////////")
 * - Private Use Area garbage glyphs from bad tokenizer output
 * - Any single character repeated 9+ times in a row
 * Leading / trailing whitespace is trimmed.
 */
export function sanitizeAiResponse(text: string): string {
  if (!text) return ''
  return text
    .replace(/\/{3,}/g, '')
    .replace(/[\uE000-\uF8FF]/g, '')
    .replace(/(.)\1{8,}/g, '$1$1$1')
    .trim()
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
    return sanitizeAiResponse(workersResult)
  }

  // Fall back to Gemini 2.5-flash (local dev only; Korea may be geo-blocked on prod)
  const geminiResult = await generateViaGemini(systemPrompt, userPrompt)
  return sanitizeAiResponse(geminiResult)
}
