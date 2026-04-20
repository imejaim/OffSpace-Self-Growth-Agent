# 2026-04-14 Login Hydration Regression

## Symptom

- After Google login, the header did not reliably show a signed-in state.
- The login pill could remain as a loading circle.
- In some cases the header became effectively non-interactive, so logout could not be reached.

## Impact

- Production users could not trust whether login succeeded.
- Session state existed, but the UI did not consistently reflect it.
- This blocked basic account actions and made the service feel broken.

## Root Cause

This was not a single auth bug. It was a compound rendering problem.

1. Shared-header hydration was fragile.
   - Root pages could trigger React hydration mismatch.
   - When hydration integrity breaks, the header and auth controls may not bind correctly.
2. Route initialization was inconsistent.
   - Client router state could initialize to `teatime` first and only later sync to the actual route.
   - Direct visits to `/my` and `/feed` could first render the wrong view.
3. Date formatting was unstable across server and client.
   - `toLocaleDateString()` without a fixed timezone could render different strings on SSR vs browser.
4. Auth loading behavior had already been fragile.
   - Earlier fixes had addressed profile-loading issues, but the page-level hydration issues still left the header exposed.

## Fix

Production fix deployed on 2026-04-14:

- `RootController.tsx`
  - Use `initialView` as the effective first-render fallback so direct route loads do not render the wrong page before client sync.
- `router-context.tsx`
  - Seed client router state from `window.location.pathname` on first mount.
- `TeatimeView.tsx`
  - Force `timeZone: 'UTC'` for date rendering to keep SSR and browser output aligned.
- Deploy fresh build to Cloudflare.

## Verification

- Production build completed and deployed successfully.
- `https://interceptnews.app/api/teatime/publish` returned `200` after deploy, replacing the earlier `404`.
- Direct visits to `/my` and `/feed` returned server HTML for the correct page instead of the wrong initial view.
- Service owner confirmed login now works.

## Guardrails

- Treat auth regressions as whole-page hydration incidents, not just auth component bugs.
- Any root-page refactor must verify header hydration, not only page content.
- Do not introduce locale-sensitive rendering in server HTML without fixing timezone behavior.
- Keep incident writeups in `docs/wiki/incidents/`, not only in meeting logs.

## Related Pages

- [Auth And Session Model](../architecture/auth-and-session-model.md)
- [LLM Wiki Adoption Plan](../strategy/llm-wiki-adoption-plan.md)
