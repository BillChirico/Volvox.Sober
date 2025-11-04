/**
 * Migration: Setup pg_cron for Check-In Notifications
 *
 * Creates a cron job that runs every 5 minutes to:
 * - Send check-in notifications
 * - Track missed check-ins
 * - Alert sponsors
 */

-- ============================================================
-- Enable pg_cron Extension
-- ============================================================

-- pg_cron must be enabled by a superuser (Supabase does this automatically)
-- This migration sets up the cron job after extension is enabled

-- ============================================================
-- Add FCM Token Columns to Users Table
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token_updated_at TIMESTAMPTZ;

-- Create index for FCM token lookups
CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token) WHERE fcm_token IS NOT NULL;

-- ============================================================
-- Create Function to Invoke Edge Function
-- ============================================================

CREATE OR REPLACE FUNCTION invoke_send_check_ins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
  response TEXT;
BEGIN
  -- Get Supabase project URL and service role key from environment
  -- These should be set in Supabase dashboard or via CLI
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-check-ins';
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  -- Invoke Edge Function via HTTP
  SELECT content::TEXT INTO response
  FROM http((
    'POST',
    function_url,
    ARRAY[
      http_header('Authorization', 'Bearer ' || service_role_key),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{}'
  )::http_request);

  -- Log response
  RAISE NOTICE 'send-check-ins function response: %', response;
END;
$$;

-- ============================================================
-- Schedule Cron Job (Every 5 Minutes)
-- ============================================================

-- Remove existing job if it exists
SELECT cron.unschedule('send-check-ins-job') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-check-ins-job'
);

-- Schedule new job: Run every 5 minutes
SELECT cron.schedule(
  'send-check-ins-job',           -- Job name
  '*/5 * * * *',                  -- Cron expression: every 5 minutes
  $$ SELECT invoke_send_check_ins(); $$
);

-- ============================================================
-- Grant Permissions
-- ============================================================

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION invoke_send_check_ins() TO postgres;

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON FUNCTION invoke_send_check_ins() IS
'Invokes the send-check-ins Edge Function to process check-in notifications, track missed check-ins, and alert sponsors';

COMMENT ON COLUMN users.fcm_token IS
'Firebase Cloud Messaging token for push notifications';

COMMENT ON COLUMN users.fcm_token_updated_at IS
'Timestamp when FCM token was last updated';

-- ============================================================
-- Manual Execution (for Testing)
-- ============================================================

-- To manually trigger the cron job for testing:
-- SELECT invoke_send_check_ins();

-- To check cron job status:
-- SELECT * FROM cron.job WHERE jobname = 'send-check-ins-job';

-- To view cron job history:
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-check-ins-job')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- ============================================================
-- Alternative: Simplified Cron Setup (if http extension unavailable)
-- ============================================================

-- If the http extension is not available in your Supabase project,
-- you can use Supabase's built-in cron functionality or invoke via pg_net:
--
-- SELECT cron.schedule(
--   'send-check-ins-job',
--   '*/5 * * * *',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-check-ins',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
