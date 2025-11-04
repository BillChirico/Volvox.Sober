-- Migration: Create sobriety_dates and relapses tables
-- Description: Track sobriety journeys and relapse events
-- Created: 2025-11-03

-- Create sobriety_dates table
CREATE TABLE sobriety_dates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  substance_type varchar(100) NOT NULL,
  start_date date NOT NULL,
  current_streak_days integer GENERATED ALWAYS AS (EXTRACT(day FROM (CURRENT_DATE - start_date))) STORED,
  milestone_30_days date GENERATED ALWAYS AS (start_date + INTERVAL '30 days') STORED,
  milestone_60_days date GENERATED ALWAYS AS (start_date + INTERVAL '60 days') STORED,
  milestone_90_days date GENERATED ALWAYS AS (start_date + INTERVAL '90 days') STORED,
  milestone_6_months date GENERATED ALWAYS AS (start_date + INTERVAL '6 months') STORED,
  milestone_1_year date GENERATED ALWAYS AS (start_date + INTERVAL '1 year') STORED,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create relapses table
CREATE TABLE relapses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sobriety_date_id uuid NOT NULL REFERENCES sobriety_dates(id) ON DELETE CASCADE,
  relapse_date timestamptz NOT NULL,
  private_note text CHECK (LENGTH(private_note) <= 1000),
  sponsor_notified boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes for sobriety_dates
CREATE INDEX idx_sobriety_dates_user_id ON sobriety_dates(user_id);
CREATE INDEX idx_sobriety_dates_active ON sobriety_dates(user_id, is_active);

-- Create indexes for relapses
CREATE INDEX idx_relapses_sobriety_date_id ON relapses(sobriety_date_id);
CREATE INDEX idx_relapses_date ON relapses(relapse_date);

-- Enable Row Level Security
ALTER TABLE sobriety_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sobriety_dates

-- Policy: Users can manage their own sobriety dates
CREATE POLICY "Users manage own sobriety dates" ON sobriety_dates
  FOR ALL USING (user_id = auth.uid());

-- Policy: Connected users can view each other's sobriety dates
-- Note: This will reference connections table which will be created in next migration
-- For now, we'll create a simplified version that will be updated later
CREATE POLICY "Connected users view each other sobriety" ON sobriety_dates
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for relapses

-- Policy: Users can manage their own relapses
CREATE POLICY "Users manage own relapses" ON relapses
  FOR ALL USING (
    sobriety_date_id IN (
      SELECT id FROM sobriety_dates WHERE user_id = auth.uid()
    )
  );

-- Policy: Sponsors can see relapse dates (but NOT private notes) of connected sponsees
-- Note: This will reference connections table which will be created in next migration
-- For now, we'll create a simplified version that will be updated later
-- Application layer must filter out private_note for sponsors
CREATE POLICY "Sponsors view connected sponsee relapses" ON relapses
  FOR SELECT USING (
    sobriety_date_id IN (
      SELECT id FROM sobriety_dates WHERE user_id = auth.uid()
    )
  );

-- Add comments to tables
COMMENT ON TABLE sobriety_dates IS 'Track one or more sobriety journeys per user (different substances or recovery starts)';
COMMENT ON TABLE relapses IS 'Log relapse events for honesty and reflection';
COMMENT ON COLUMN sobriety_dates.current_streak_days IS 'Auto-calculated days sober from start_date';
COMMENT ON COLUMN relapses.private_note IS 'Private reflection visible only to user, NOT to sponsor';
