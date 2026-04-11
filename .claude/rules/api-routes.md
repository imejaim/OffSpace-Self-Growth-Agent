---
paths:
  - "intercept/src/app/api/**"
---

# API Route Rules

- Next.js 16 App Router: export named functions (GET, POST, etc.)
- Use `nodejs` runtime for payment/webhook routes: `export const runtime = 'nodejs'`
- Supabase server client: `import { createClient } from '@/lib/supabase/server'`
- Rate limiting: apply `rateLimit(ip)` from `@/lib/rate-limit` on public endpoints
- Auth check: use `getSessionInfo()` from `@/lib/auth-helpers`
- Never trust client-side data alone — always verify server-side
- Structured logging: `console.log(JSON.stringify({ type, userId, tier, timestamp }))`
