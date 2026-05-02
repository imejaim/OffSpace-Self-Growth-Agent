# 2026-04-25 PayPal Profile-Not-Found + Sign-out No-op

## Summary

PayPal Sandbox checkout for credits succeeded at the PayPal side but failed
inside `/api/payment/paypal/capture-order` with the error
`addCredits failed: Profile not found: <user_id>`. The user was authenticated
in `auth.users` but had no row in `public.profiles`, so the `add_credits` RPC
raised. Separately, the user-menu "Sign out" button cleared local React state
but left server-rendered UI in a signed-in state because the App Router cache
was never invalidated.

## Symptom

- Credits page error after PayPal redirect:
  - `PayPal checkout failed`
  - `addCredits failed: Profile not found: d8bff0b8-898f-4624-ac5b-230161544dbb`
- Top-right user menu → Sign out: dropdown closed but user stayed logged in
  on every server-rendered surface (header avatar, /pricing, /my).

## Impact

- Real money / sandbox transaction completed at PayPal but credits were never
  granted in our DB. In production this would be a refund-or-manual-credit
  incident per checkout failure.
- Sign-out left a stale logged-in surface and could leak account state on a
  shared device.

## Root Causes

1. **Profile creation lived only on the client.**
   - `auth/callback/route.ts` ran `exchangeCodeForSession` and immediately
     redirected without creating a `profiles` row.
   - `AuthProvider.fetchOrCreateProfile` did the upsert, but only after the
     client had hydrated, fetched the user, and re-rendered.
   - Any flow that depends on the profile row (PayPal capture, server-side
     `getSessionInfo`) could race the client and observe a missing row.
   - Supabase had no `auth.users` insert trigger to fall back on, so a missed
     client upsert produced a permanently broken state until the user ran
     something that triggered the upsert again.

2. **`add_credits` RPC was strict on profile existence.**
   - `001_initial_schema.sql` raised `Profile not found` when `UPDATE … RETURNING`
     hit zero rows. This was correct as a defensive check but had no
     self-heal path, so it amplified the race above into a payment-blocking
     hard error.

3. **Sign-out only cleared client state.**
   - `AuthProvider.signOut` called `supabase.auth.signOut()` and `setUser(null)`
     etc., but never invalidated the App Router server cache.
   - Next.js 16 server components keep their last render until told otherwise,
     so SSR-rendered chunks (header, pages reading auth cookies) continued to
     show the previous user.

## Fix

Three-layer defense for profile creation (only fully active after the 004
RLS policy migration — see "Honesty note" below), plus a proper sign-out
flow.

1. **DB-level trigger + self-heal RPC** —
   `intercept/supabase/migrations/003_profile_self_heal.sql`
   - New `handle_new_auth_user()` trigger on `auth.users` insert auto-creates
     a default `profiles` row. Removes the race for any future signup.
   - `add_credits()` rewritten to verify the `auth.users` row, then upsert
     a default `profiles` row on conflict-do-nothing before incrementing.
     Final safety net for users that predate the trigger.
   - Both run as `SECURITY DEFINER` and therefore bypass RLS. This is the
     layer that was actually protecting users between the 003 deploy and the
     004 follow-up.

2. **Server-side ensure on auth callback** —
   `intercept/src/app/auth/callback/route.ts`
   - After `exchangeCodeForSession` succeeds, fetch the user and `upsert`
     a default `profiles` row with `ignoreDuplicates: true`. Belt-and-suspenders
     in case the DB trigger has not yet been deployed.

3. **App-level ensure before crediting** —
   `intercept/src/lib/credits.ts`
   - `addCredits` now calls a private `ensureProfile` helper that idempotently
     upserts the row before invoking the RPC. Same protection extends to
     PortOne flows that share `addCredits`.

4. **RLS owner-insert policy on `profiles`** —
   `intercept/supabase/migrations/004_profile_insert_policy.sql`
   - Adds `profiles_owner_insert` (`WITH CHECK (auth.uid() = id)`) so that
     the server-side upsert (#2) and `ensureProfile` (#3) are not silently
     rejected by RLS. Without this, layers 2 and 3 looked correct in code
     but did nothing at the database level. See "Honesty note" below.

5. **Sign-out forces App Router refresh** —
   `intercept/src/components/AuthProvider.tsx`
   - `signOut` now (a) clears local state first, (b) calls
     `supabase.auth.signOut({ scope: 'local' })` to wipe browser cookies,
     and (c) calls `router.refresh()` so every server component re-renders
     against the now-cookieless request.

## Honesty note — why "three-layer defense" needed a follow-up

The original 003 patch shipped with the language "three-layer defense", but
an independent verifier pass found that two of the three layers did not
actually run in production:

- `profiles` had RLS enabled in `001_initial_schema.sql` with only SELECT
  and UPDATE policies. There was no INSERT policy.
- PostgreSQL RLS denies by default when no matching policy is present.
- Therefore the `auth/callback` server upsert and the `ensureProfile`
  helper — both running in an authenticated *client* context, not as
  `SECURITY DEFINER` — were silently rejected before they could write a row.
- The DB trigger from 003 still worked because it runs as `SECURITY DEFINER`
  and bypasses RLS, so most new users were unaffected. But the documented
  fallback for "trigger not deployed yet" / "user predates trigger" was
  effectively a no-op until the 004 migration landed.

After 004 is applied, all three profile-creation layers are real and
independent: trigger (DB), server callback upsert (auth), `ensureProfile`
before crediting (capture flow).

## Verification

- `npx tsc --noEmit -p tsconfig.json` → exit 0.
- `npx eslint` on changed files → 0 errors (1 pre-existing warning untouched).
- `curl /auth/callback` → HTTP 307 (redirect path intact).
- `curl /api/payment/paypal/capture-order` (unauthenticated) → HTTP 401.
- Dev server hot-reloaded the changes without compilation error.

## Follow-ups

- [x] **Add `profiles_owner_insert` RLS policy** —
      `intercept/supabase/migrations/004_profile_insert_policy.sql` shipped
      so the app-layer fallbacks actually run. Closes the verifier-flagged
      Major defect on the 003 patch.
- [ ] Apply `003_profile_self_heal.sql` **and** `004_profile_insert_policy.sql`
      to the Supabase project (us-east-1). Both are required: 003 installs
      the trigger and self-healing RPC, 004 enables the app-layer fallbacks.
      Apply 003 first, then 004 — order does not strictly matter for
      correctness, but matches the migration numbering.
- [ ] Backfill: for any user whose `auth.users` row exists without a
      `profiles` row today, run the same default-row insert one-shot.
      Trigger only catches *new* inserts.
- [ ] Consider adding an integration test that simulates capture-order with
      a freshly-created auth user (no profile) and asserts crediting
      succeeds. (Vitest is not yet configured in `intercept/`; deferred.)

## Files Touched

- `intercept/supabase/migrations/003_profile_self_heal.sql` (new)
- `intercept/supabase/migrations/004_profile_insert_policy.sql` (new — verifier follow-up)
- `intercept/src/app/auth/callback/route.ts`
- `intercept/src/lib/credits.ts`
- `intercept/src/components/AuthProvider.tsx`
