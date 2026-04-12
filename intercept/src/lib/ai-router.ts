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

/** Workers AI models tried in order.
 * Note: qwen2.5-coder is tuned for code — it handles news chatter but can drift
 * into code-ish framing. Llama 3.3 70B instruct is the better general-news model
 * and is tried first; coder is kept as a fallback since Workers AI availability
 * varies by region.
 */
const WORKERS_AI_MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/qwen/qwen2.5-coder-32b-instruct',
  '@cf/google/gemma-3-12b-it',
]

interface WorkersAiTextResult {
  response?: string
}

/**
 * Resolve a secret / env var from the Cloudflare runtime context if available,
 * falling back to `process.env` (nodejs runtime / local dev).
 *
 * Important: on Cloudflare Workers with nodejs_compat, secrets declared via
 * `wrangler secret put` are surfaced through `getCloudflareContext().env`, NOT
 * through `process.env`. Using `process.env` alone silently returns undefined
 * in production, which is exactly how the Gemini fallback has been failing.
 */
async function resolveEnv(key: string): Promise<string | undefined> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (env as any)?.[key]
    if (typeof val === 'string' && val.length > 0) return val
  } catch {
    // Not in Cloudflare runtime
  }
  const fromProcess = process.env?.[key]
  if (typeof fromProcess === 'string' && fromProcess.length > 0) return fromProcess
  return undefined
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
  } catch (ctxErr) {
    console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'no-cf-context', error: String(ctxErr) }))
    return null
  }

  if (!ai) {
    console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'binding-not-found' }))
    return null
  }

  for (const modelId of WORKERS_AI_MODELS) {
    try {
      const result = (await ai.run(modelId, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      })) as WorkersAiTextResult

      const text = (result?.response ?? '').trim()
      if (text) {
        console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'ok', model_id: modelId, len: text.length }))
        return text
      }
      console.log(JSON.stringify({ type: 'ai-router', model: 'workers-ai', status: 'empty-response', model_id: modelId }))
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
  const apiKey = await resolveEnv('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  // AbortController-based timeout — Cloudflare's global fetch can hang without one.
  const controller = new AbortController()
  const timeoutMs = 30_000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(
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
        signal: controller.signal,
      }
    )
  } catch (fetchErr) {
    clearTimeout(timeoutId)
    console.log(JSON.stringify({ type: 'ai-router', model: 'gemini-2.5-flash', status: 'fetch-error', error: String(fetchErr) }))
    throw fetchErr
  }
  clearTimeout(timeoutId)

  if (!res.ok) {
    const errText = await res.text()
    console.log(JSON.stringify({ type: 'ai-router', model: 'gemini-2.5-flash', status: 'http-error', http: res.status, body: errText.slice(0, 300) }))
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  console.log(JSON.stringify({ type: 'ai-router', model: 'gemini-2.5-flash', status: 'ok', len: text.length }))
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
