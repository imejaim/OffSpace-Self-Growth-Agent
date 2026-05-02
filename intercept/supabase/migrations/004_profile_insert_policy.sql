-- =============================================================================
-- Intercept News Service — Profile Owner-Insert RLS Policy
-- Migration: 004_profile_insert_policy.sql
-- =============================================================================
-- Fix: 2026-04-25 follow-up to 003_profile_self_heal.sql.
--
-- Verifier review of the 003 patch flagged a Major defect: `profiles` had RLS
-- enabled in 001_initial_schema.sql but only SELECT (`profiles_public_read`)
-- and UPDATE (`profiles_owner_update`) policies were defined. PostgreSQL RLS
-- defaults to deny when no matching policy exists, so any client-context
-- INSERT into `public.profiles` was silently rejected.
--
-- Effect on the 003 "belt-and-suspenders" plan:
--   - DB trigger `handle_new_auth_user` (003)  → bypasses RLS via
--     `SECURITY DEFINER`, so it kept working. This was the only layer that
--     was actually defending users in production.
--   - Server-side upsert in `auth/callback/route.ts` (003) → blocked by RLS.
--   - `ensureProfile` in `src/lib/credits.ts` (003) → blocked by RLS.
--
-- Adding this policy restores those two app-layer safety nets so that the
-- "three-layer defense" claimed in the incident doc is actually three layers.
-- The DB trigger is still the primary mechanism; the app-layer upserts now
-- function as the documented fallback for environments where the trigger has
-- not yet been deployed or for users who predate it.
--
-- Scope is intentionally narrow: an authenticated user may only INSERT a row
-- whose `id` matches their own `auth.uid()`. This mirrors `intercepts_owner_insert`
-- and `follows_owner_insert` from 001 and gives the same guarantee — clients
-- cannot manufacture a profile row for a different user.
-- =============================================================================

-- Make the migration safely re-runnable (Supabase CLI replays on reset).
DROP POLICY IF EXISTS "profiles_owner_insert" ON profiles;

CREATE POLICY "profiles_owner_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
