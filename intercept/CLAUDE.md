@AGENTS.md

# Intercept Web App

Next.js 16.2.2 + React 19 + Tailwind 4 interactive AI news platform.

## Commands

```bash
npm run dev    # Dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
```

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
