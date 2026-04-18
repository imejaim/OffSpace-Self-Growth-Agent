@AGENTS.md

# Intercept Web App

Next.js 16.2.2 + React 19 + Tailwind 4 personal news platform — users pick topics, an AI character team (Ko, Oh, Jem) turns them into a daily conversational brief. Formerly an "AI news" service; pivoted 2026-04-12 to "당신만의 뉴스 / Your news, your way".

## Commands

```bash
npm run dev    # Dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
npm run deploy # Build + deploy to Cloudflare Workers (run ONLY after local verification)
```

## Development Workflow — Local-First (Non-Negotiable)

`http://localhost:3000` is the primary development surface. Do not iterate
against the deployed site (`https://interceptnews.app`) — every hit there
burns the Cloudflare Workers daily request quota even with zero real users.

Protocol:

1. `npm run dev`, exercise the change in the browser, verify login, intercept,
   feed, and the feature you're editing
2. Deploy only when the change is confirmed to work locally
3. Smoke-test the deployed URL once, then stop

Full rule, environment variables, and failure modes:
`../docs/wiki/architecture/local-first-development.md`

Historical context (why this matters):
`../docs/wiki/log.md` → 2026-04-14 entry on the Cloudflare daily-limit incident.

## Key Directories

```
src/
├── app/              # App Router pages and API routes
│   ├── api/          # REST endpoints (intercept, payment, credits, auth)
│   ├── teatime/      # Main content page
│   ├── pricing/      # Subscription plans
│   └── auth/         # OAuth callback
├── components/       # React components (AuthProvider, FloatingCharacters, etc.)
├── lib/              # Utilities (supabase, paypal, credits, rate-limit, auth-helpers)
└── proxy.ts          # Session refresh (replaces middleware.ts in Next.js 16)
```

## Environment Variables

Required in `.env.local`:
- `GEMINI_API_KEY` — Gemini 2.5-flash for AI responses
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` + `PAYPAL_MODE`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

## Architecture Notes

- **proxy.ts**: Next.js 16 renamed middleware.ts → proxy.ts. Export `proxy()` function, not `middleware()`.
- **Supabase**: `PUBLISHABLE_KEY` (new format, replaces `ANON_KEY`). SSR via `@supabase/ssr`.
- **Characters**: SVG pixel art in `public/characters/`. 3 characters with distinct personalities.
- **Pretext**: `@chenglou/pretext` for text displacement effects near characters.
