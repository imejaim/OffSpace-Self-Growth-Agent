-- =============================================================================
-- Intercept News Service — Reset Usage Functions
-- Migration: 002_reset_usage_functions.sql
-- =============================================================================
-- These SECURITY DEFINER functions bypass RLS so the cron API route can reset
-- usage counters without needing the service_role key.
-- Call via supabase.rpc('reset_daily_usage') / supabase.rpc('reset_monthly_usage')
-- =============================================================================

-- RPC: reset_daily_usage
-- Sets daily_used = 0 for ALL profiles.
-- Called daily at 00:00 KST (15:00 UTC) by the /api/cron/reset-usage?type=daily route.
-- Returns the number of rows updated.
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE profiles
     SET daily_used = 0,
         updated_at = now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RPC: reset_monthly_usage
-- Sets monthly_used = 0 for ALL profiles.
-- Called on the 1st of each month at 00:00 KST (15:00 UTC) by
-- the /api/cron/reset-usage?type=monthly route.
-- Returns the number of rows updated.
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE profiles
     SET monthly_used = 0,
         updated_at = now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
