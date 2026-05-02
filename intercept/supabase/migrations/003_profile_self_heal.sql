-- =============================================================================
-- Intercept News Service — Profile Self-Heal + auth.users Trigger
-- Migration: 003_profile_self_heal.sql
-- =============================================================================
-- Fix: 2026-04-25 PayPal Sandbox showed "Profile not found" when capturing an
-- order for a user whose auth.users row existed but whose public.profiles row
-- had not yet been written by the client-side AuthProvider upsert.
--
-- Two-layer defense:
--   1. handle_new_auth_user(): trigger on auth.users insert -> auto-create
--      a public.profiles row. Removes the client-side race entirely for any
--      future signup.
--   2. add_credits(): if the profile is missing, create it inline before
--      crediting. Final safety net for any pre-existing auth.users row that
--      the trigger never saw (e.g. users created before this migration).
-- =============================================================================

-- 1) Auto-create profile on auth.users insert ---------------------------------
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    auth_type,
    tier,
    credits,
    daily_limit,
    monthly_limit,
    display_name,
    nickname
  ) VALUES (
    NEW.id,
    CASE
      WHEN NEW.is_anonymous THEN 'anonymous'
      ELSE 'google'
    END,
    'free',
    0,
    2,
    60,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'user'
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'user'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();

-- 2) Self-heal add_credits ----------------------------------------------------
-- Replaces the 001_initial_schema.sql version. If the profile row is missing
-- (e.g. a user predates the trigger above) we create a default row inline so
-- the credit purchase can never fail with "Profile not found".
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_provider   TEXT,
  p_payment_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_exists      BOOLEAN;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive, got: %', p_amount;
  END IF;

  -- Verify auth.users row exists (this is the real identity check).
  -- The client passes user.id from supabase.auth.getUser() so this should
  -- always be true; we still guard against arbitrary UUIDs.
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id)
    INTO v_exists;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'Auth user not found: %', p_user_id;
  END IF;

  -- Ensure a profile row exists; create a default one if it does not.
  INSERT INTO public.profiles (id, tier, credits, daily_limit, monthly_limit)
  VALUES (p_user_id, 'free', 0, 2, 60)
  ON CONFLICT (id) DO NOTHING;

  -- Credit increment + return new balance
  UPDATE public.profiles
     SET credits = credits + p_amount
   WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  INSERT INTO public.credit_transactions (
    user_id, type, amount, balance_after, payment_provider, payment_id
  ) VALUES (
    p_user_id, 'purchase', p_amount, v_new_balance, p_provider, p_payment_id
  );

  RETURN v_new_balance;
END;
$$;
