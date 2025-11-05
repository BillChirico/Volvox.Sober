-- Migration: Create steps and step_work tables
-- Description: 12-step program reference data and sponsee progress tracking
-- Created: 2025-11-03

-- Create custom type for step work status
CREATE TYPE step_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create steps table (reference data)
CREATE TABLE steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_number integer NOT NULL CHECK (step_number BETWEEN 1 AND 12) UNIQUE,
  step_title varchar(200) NOT NULL,
  step_description text NOT NULL,
  default_questions jsonb NOT NULL
);

-- Create step_work table
CREATE TABLE step_work (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  step_id uuid NOT NULL REFERENCES steps(id),
  status step_status DEFAULT 'not_started',
  responses jsonb,
  sponsor_comments jsonb,
  custom_questions jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  last_updated_at timestamptz DEFAULT NOW(),
  CONSTRAINT unique_sponsee_step UNIQUE (sponsee_id, step_id)
);

-- Create indexes for step_work
CREATE INDEX idx_step_work_sponsee_id ON step_work(sponsee_id, step_id);
CREATE INDEX idx_step_work_sponsor_id ON step_work(sponsor_id, status);

-- Enable Row Level Security
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_work ENABLE ROW LEVEL SECURITY;

-- RLS Policies for steps

-- Policy: All authenticated users can read steps (read-only reference data)
CREATE POLICY "Users view steps" ON steps
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for step_work

-- Policy: Sponsees can manage their own step work
CREATE POLICY "Sponsees manage own step work" ON step_work
  FOR ALL USING (sponsee_id = auth.uid());

-- Policy: Sponsors can view connected sponsees' step work
CREATE POLICY "Sponsors view connected step work" ON step_work
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.sponsor_id = auth.uid()
      AND connections.sponsee_id = step_work.sponsee_id
      AND connections.status = 'active'
    )
  );

-- Policy: Sponsors can update (add comments, mark complete) connected sponsees' step work
CREATE POLICY "Sponsors update connected step work" ON step_work
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.sponsor_id = auth.uid()
      AND connections.sponsee_id = step_work.sponsee_id
      AND connections.status = 'active'
    )
  );

-- Add comments to tables
COMMENT ON TABLE steps IS 'Reference data for AA 12 steps with standard questions (pre-seeded)';
COMMENT ON TABLE step_work IS 'Sponsee work on each of the 12 steps';
COMMENT ON COLUMN step_work.responses IS 'JSONB array of {question_id, question_text, answer_text}';
COMMENT ON COLUMN step_work.sponsor_comments IS 'JSONB array of {question_id, comment_text, commented_at}';
COMMENT ON COLUMN step_work.custom_questions IS 'Sponsor-added questions for this sponsee';
