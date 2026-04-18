import { getCloudflareContext } from '@opennextjs/cloudflare'

const WINDOW_SECONDS = 60 * 60 // 1 hour
const DEFAULT_MAX_REQUESTS = 60 // 기본값 60/h; 탐색용 라우트는 호출부에서 200 등으로 상향

// In-memory fallback for local dev (single-process only)
const localStore = new Map<string, { count: number; resetAt: number }>()

function localCleanup() {
  const now = Date.now()
  for (const [key, entry] of localStore) {
    if (now >= entry.resetAt) {
      localStore.delete(key)
    }
  }
}

function localRateLimit(
  ip: string,
  maxRequests: number
): {
  success: boolean
  remaining: number
  resetAt: number
} {
  localCleanup()
  const now = Date.now()
  const resetAt = now + WINDOW_SECONDS * 1000
  const entry = localStore.get(ip)

  if (!entry || now >= entry.resetAt) {
    localStore.set(ip, { count: 1, resetAt })
    return { success: true, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

async function kvRateLimit(
  kv: KVNamespace,
  ip: string,
  maxRequests: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  // Window key: current hour bucket (UTC)
  const nowSec = Math.floor(Date.now() / 1000)
  const windowStart = nowSec - (nowSec % WINDOW_SECONDS)
  const resetAt = (windowStart + WINDOW_SECONDS) * 1000
  const key = `rate:${ip}:${windowStart}`

  const raw = await kv.get(key)
  const count = raw ? parseInt(raw, 10) : 0

  if (count >= maxRequests) {
    return { success: false, remaining: 0, resetAt }
  }

  const newCount = count + 1
  // TTL: remaining seconds in this window + small buffer
  const ttl = windowStart + WINDOW_SECONDS - nowSec + 10
  await kv.put(key, String(newCount), { expirationTtl: ttl })

  return {
    success: true,
    remaining: maxRequests - newCount,
    resetAt,
  }
}

export async function rateLimit(
  ip: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS
): Promise<{
  success: boolean
  remaining: number
  resetAt: number
}> {
  try {
    const ctx = await getCloudflareContext({ async: true })
    const kv = (ctx.env as CloudflareEnv).RATE_LIMIT
    if (kv) {
      return await kvRateLimit(kv, ip, maxRequests)
    }
  } catch {
    // getCloudflareContext throws outside Cloudflare runtime (local dev)
  }

  // Local dev fallback
  return localRateLimit(ip, maxRequests)
}
