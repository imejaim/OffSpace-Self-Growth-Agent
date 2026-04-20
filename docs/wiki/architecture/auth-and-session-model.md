# Auth And Session Model

## Scope

This page describes how authentication state should move through the Intercept web app.

## Current Stack

- Auth provider: Supabase
- Login method: Google OAuth plus anonymous guest flows
- SSR cookie refresh: Next.js middleware/proxy boundary
- Client state owner: `AuthProvider`
- Header surface: `LoginButton`

## Required State Flow

1. User starts Google OAuth from the client.
2. Supabase redirects back to `/auth/callback`.
3. Server exchanges the code for a session and writes cookies.
4. Middleware/proxy refresh keeps cookies alive on subsequent requests.
5. `AuthProvider` reads the authenticated user on the client.
6. `LoginButton` renders one of three states:
   - loading placeholder
   - signed-out actions
   - signed-in pill with dropdown

## Non-Negotiable Rules

- Header auth UI must remain interactive even if profile loading fails.
- `loading` in `AuthProvider` must be cleared before or independently from profile enrichment.
- Server-rendered route state and client route state must match on first paint.
- Pages that share the header must not trigger hydration mismatches from unrelated content.
- Date rendering used in shared pages must be stable across server and client.

## Known Fragile Areas

- Any hydration mismatch on root pages can prevent the header from hydrating correctly.
- Client-only router context must be seeded from the actual path on first mount.
- Locale-sensitive date formatting can diverge between SSR and browser if timezone is not fixed.
- Profile enrichment must not block the basic signed-in UI.

## Operational Checks

After changing auth, routing, or home/teatime rendering, verify:

- Google login returns to the app successfully.
- Header pill replaces the loading circle.
- Pill click opens the dropdown.
- Sign out works.
- Direct visits to `/`, `/teatime`, `/my`, and `/feed` render the correct initial view.
- No hydration error appears in browser console on those pages.
