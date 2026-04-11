-- =============================================================================
-- Intercept News Service — Initial Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- =============================================================================
-- TABLES
-- =============================================================================

-- profiles: linked to Supabase Auth users
-- Stores subscription tier, credits, and engagement stats per user
CREATE TABLE profiles (
  id                   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname             TEXT,
  display_name         TEXT,
  avatar_url           TEXT,
  auth_type            TEXT        CHECK (auth_type IN ('google', 'anonymous')),
  tier                 TEXT        DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'pro', 'payperuse')),
  credits              INTEGER     DEFAULT 0,
  subscription_id      TEXT,
  subscription_status  TEXT,
  daily_used           INTEGER     DEFAULT 0,
  daily_limit          INTEGER     DEFAULT 2,
  monthly_used         INTEGER     DEFAULT 0,
  monthly_limit        INTEGER     DEFAULT 60,
  total_intercepts     INTEGER     DEFAULT 0,
  streak_days          INTEGER     DEFAULT 0,
  last_intercept_date  DATE,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- intercepts: user interaction records (questions inserted into a teatime thread)
CREATE TABLE intercepts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES profiles(id),
  session_id    TEXT,
  nickname      TEXT        NOT NULL,
  teatime_id    TEXT        NOT NULL,
  topic_id      TEXT        NOT NULL,
  message_id    TEXT        NOT NULL,
  character_id  TEXT        NOT NULL,
  user_message  TEXT        NOT NULL,
  ai_responses  JSONB       NOT NULL,
  is_public     BOOLEAN     DEFAULT true,
  visibility    TEXT        DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- credit_transactions: immutable audit log of all credit movements
CREATE TABLE credit_transactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES profiles(id),
  type             TEXT        CHECK (type IN ('purchase', 'use', 'refund', 'bonus', 'subscription')),
  amount           INTEGER     NOT NULL,
  balance_after    INTEGER     NOT NULL,
  payment_provider TEXT,
  payment_id       TEXT,
  intercept_id     UUID        REFERENCES intercepts(id),
  metadata         JSONB,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- follows: social graph between profiles
CREATE TABLE follows (
  follower_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  following_id  UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_intercepts_user_id
  ON intercepts (user_id);

CREATE INDEX idx_intercepts_created_at_desc
  ON intercepts (created_at DESC);

CREATE INDEX idx_intercepts_visibility_created_at
  ON intercepts (visibility, created_at DESC);

-- =============================================================================
-- TRIGGER: profiles.updated_at auto-update
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercepts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows             ENABLE ROW LEVEL SECURITY;

-- profiles: anyone can read; only the owner can update their own row
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- intercepts: public rows are readable by everyone; owner can insert
CREATE POLICY "intercepts_public_read"
  ON intercepts FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "intercepts_owner_insert"
  ON intercepts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- credit_transactions: only the owning user may read their own transactions
CREATE POLICY "credit_transactions_owner_read"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- follows: public read; only authenticated users can manage their own follows
CREATE POLICY "follows_public_read"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "follows_owner_insert"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_owner_delete"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================================================
-- RPC: deduct_credit
-- Atomically decrements credits by 1 and records a 'use' transaction.
-- Raises an exception if the user has insufficient credits.
-- Returns the new credit balance.
-- =============================================================================

CREATE OR REPLACE FUNCTION deduct_credit(
  p_user_id      UUID,
  p_intercept_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance     INTEGER;
BEGIN
  -- Lock the row to prevent concurrent over-deduction
  SELECT credits
    INTO v_current_balance
    FROM profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  IF v_current_balance < 1 THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %', v_current_balance;
  END IF;

  v_new_balance := v_current_balance - 1;

  UPDATE profiles
     SET credits = v_new_balance,
         total_intercepts = total_intercepts + 1,
         last_intercept_date = CURRENT_DATE
   WHERE id = p_user_id;

  INSERT INTO credit_transactions (
    user_id, type, amount, balance_after, intercept_id
  ) VALUES (
    p_user_id, 'use', -1, v_new_balance, p_intercept_id
  );

  RETURN v_new_balance;
END;
$$;

-- =============================================================================
-- RPC: add_credits
-- Atomically adds credits to a user and records a 'purchase' transaction.
-- Returns the new credit balance.
-- =============================================================================

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_provider   TEXT,
  p_payment_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive, got: %', p_amount;
  END IF;

  -- Lock the row and compute new balance
  UPDATE profiles
     SET credits = credits + p_amount
   WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  INSERT INTO credit_transactions (
    user_id, type, amount, balance_after, payment_provider, payment_id
  ) VALUES (
    p_user_id, 'purchase', p_amount, v_new_balance, p_provider, p_payment_id
  );

  RETURN v_new_balance;
END;
$$;

-- =============================================================================
-- RPC: refund_credit
-- Atomically refunds 1 credit to a user and records a 'refund' transaction.
-- Returns the new credit balance.
-- =============================================================================

CREATE OR REPLACE FUNCTION refund_credit(
  p_user_id      UUID,
  p_intercept_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance     INTEGER;
BEGIN
  -- Lock the row to prevent concurrent updates
  SELECT credits
    INTO v_current_balance
    FROM profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  v_new_balance := v_current_balance + 1;

  UPDATE profiles
     SET credits = v_new_balance
   WHERE id = p_user_id;

  INSERT INTO credit_transactions (
    user_id, type, amount, balance_after, intercept_id
  ) VALUES (
    p_user_id, 'refund', 1, v_new_balance, p_intercept_id
  );

  RETURN v_new_balance;
END;
$$;
