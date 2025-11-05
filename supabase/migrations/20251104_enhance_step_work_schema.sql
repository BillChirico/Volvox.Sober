-- Migration: Enhance step_work schema for WP07
-- Description: Update status enum and add fields for submission/review workflow
-- Created: 2025-11-04

-- Drop old enum and create new one with all required statuses
ALTER TABLE step_work ALTER COLUMN status DROP DEFAULT;
DROP TYPE IF EXISTS step_status CASCADE;
CREATE TYPE step_status AS ENUM ('not_started', 'in_progress', 'submitted', 'reviewed');
ALTER TABLE step_work ALTER COLUMN status TYPE step_status USING status::text::step_status;
ALTER TABLE step_work ALTER COLUMN status SET DEFAULT 'not_started';

-- Add submission and review tracking fields
ALTER TABLE step_work ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE step_work ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE step_work ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES users(id);

-- Add index for reviewer queries
CREATE INDEX IF NOT EXISTS idx_step_work_reviewer ON step_work(reviewer_id, status);

-- Update RLS policy for reviewer comments
DROP POLICY IF EXISTS "Sponsors update connected step work" ON step_work;
CREATE POLICY "Sponsors update connected step work" ON step_work
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.sponsor_id = auth.uid()
      AND connections.sponsee_id = step_work.sponsee_id
      AND connections.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.sponsor_id = auth.uid()
      AND connections.sponsee_id = step_work.sponsee_id
      AND connections.status = 'active'
    )
  );

-- Add comments
COMMENT ON COLUMN step_work.submitted_at IS 'Timestamp when sponsee submitted work for review';
COMMENT ON COLUMN step_work.reviewed_at IS 'Timestamp when sponsor marked work as reviewed';
COMMENT ON COLUMN step_work.reviewer_id IS 'Sponsor who reviewed the step work';
