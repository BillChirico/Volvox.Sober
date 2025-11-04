-- Migration: Enhance sobriety tracking for WP06
-- Description: Add milestones array, trigger context, and update RLS policies
-- WP06: Sobriety Tracking & Milestones

-- Add trigger_context enum to relapses table
ALTER TABLE relapses ADD COLUMN IF NOT EXISTS trigger_context TEXT
  CHECK (trigger_context IN ('stress', 'social_pressure', 'emotional', 'physical_pain', 'other'));

-- Add milestones_achieved generated column to sobriety_dates
-- This replaces individual milestone columns with a flexible array
ALTER TABLE sobriety_dates ADD COLUMN IF NOT EXISTS milestones_achieved TEXT[]
  GENERATED ALWAYS AS (
    CASE
      WHEN current_streak_days >= 365 THEN ARRAY['30_days', '60_days', '90_days', '180_days', '1_year']
      WHEN current_streak_days >= 180 THEN ARRAY['30_days', '60_days', '90_days', '180_days']
      WHEN current_streak_days >= 90 THEN ARRAY['30_days', '60_days', '90_days']
      WHEN current_streak_days >= 60 THEN ARRAY['30_days', '60_days']
      WHEN current_streak_days >= 30 THEN ARRAY['30_days']
      ELSE ARRAY[]::TEXT[]
    END
  ) STORED;

-- Add next_milestone_days generated column for progress tracking
ALTER TABLE sobriety_dates ADD COLUMN IF NOT EXISTS next_milestone_days INTEGER
  GENERATED ALWAYS AS (
    CASE
      WHEN current_streak_days < 30 THEN 30
      WHEN current_streak_days < 60 THEN 60
      WHEN current_streak_days < 90 THEN 90
      WHEN current_streak_days < 180 THEN 180
      WHEN current_streak_days < 365 THEN 365
      ELSE NULL -- All milestones achieved
    END
  ) STORED;

-- Drop the old simplified RLS policies
DROP POLICY IF EXISTS "Connected users view each other sobriety" ON sobriety_dates;
DROP POLICY IF EXISTS "Sponsors view connected sponsee relapses" ON relapses;

-- Create updated RLS policy for sobriety_dates: connected users can view
CREATE POLICY "Connected users view sobriety stats" ON sobriety_dates
  FOR SELECT USING (
    user_id = auth.uid() OR -- Own data
    user_id IN ( -- Connected users
      SELECT sponsor_id FROM connections
      WHERE sponsee_id = auth.uid() AND status = 'active'
      UNION
      SELECT sponsee_id FROM connections
      WHERE sponsor_id = auth.uid() AND status = 'active'
    )
  );

-- Create updated RLS policy for relapses: sponsors see dates but NOT private notes
-- Application layer MUST filter private_note when user_id != auth.uid()
CREATE POLICY "Connected users view relapses" ON relapses
  FOR SELECT USING (
    sobriety_date_id IN (
      SELECT sd.id FROM sobriety_dates sd
      WHERE sd.user_id = auth.uid() OR -- Own relapses
      sd.user_id IN ( -- Connected users' relapses
        SELECT sponsor_id FROM connections
        WHERE sponsee_id = auth.uid() AND status = 'active'
        UNION
        SELECT sponsee_id FROM connections
        WHERE sponsor_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Function to handle relapse entry and sobriety date update
CREATE OR REPLACE FUNCTION handle_relapse_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user_id from the associated sobriety_date
  SELECT user_id INTO v_user_id
  FROM sobriety_dates
  WHERE id = NEW.sobriety_date_id;

  -- Update the sobriety start date to day after relapse
  UPDATE sobriety_dates
  SET
    start_date = (NEW.relapse_date::date + INTERVAL '1 day')::date,
    updated_at = NOW()
  WHERE id = NEW.sobriety_date_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update sobriety date on relapse entry
CREATE TRIGGER trigger_handle_relapse
  AFTER INSERT ON relapses
  FOR EACH ROW
  EXECUTE FUNCTION handle_relapse_entry();

-- Function to get milestone display text
CREATE OR REPLACE FUNCTION get_milestone_text(days INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN days = 30 THEN '30 Days - One Month Sober! 🎉'
    WHEN days = 60 THEN '60 Days - Two Months Strong! 💪'
    WHEN days = 90 THEN '90 Days - Three Month Milestone! ⭐'
    WHEN days = 180 THEN '180 Days - Half a Year! 🎊'
    WHEN days = 365 THEN '1 Year - Anniversary! 🏆'
    ELSE days || ' Days'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create view for easy sobriety stats access
CREATE OR REPLACE VIEW sobriety_stats_view AS
SELECT
  sd.id,
  sd.user_id,
  sd.substance_type,
  sd.start_date,
  sd.current_streak_days,
  sd.milestones_achieved,
  sd.next_milestone_days,
  sd.next_milestone_days - sd.current_streak_days as days_until_next_milestone,
  sd.is_active,
  COALESCE(r.relapse_count, 0) as total_relapses,
  r.last_relapse_date
FROM sobriety_dates sd
LEFT JOIN (
  SELECT
    sobriety_date_id,
    COUNT(*) as relapse_count,
    MAX(relapse_date) as last_relapse_date
  FROM relapses
  GROUP BY sobriety_date_id
) r ON r.sobriety_date_id = sd.id
WHERE sd.is_active = true;

-- Grant permissions
GRANT SELECT ON sobriety_stats_view TO authenticated;

-- Update comments
COMMENT ON COLUMN sobriety_dates.milestones_achieved IS 'Array of achieved milestones: 30_days, 60_days, 90_days, 180_days, 1_year';
COMMENT ON COLUMN sobriety_dates.next_milestone_days IS 'Number of days until next milestone (NULL if all achieved)';
COMMENT ON COLUMN relapses.trigger_context IS 'Categorization of relapse trigger for pattern recognition';
COMMENT ON FUNCTION handle_relapse_entry() IS 'Automatically updates sobriety start_date when relapse is logged';
COMMENT ON VIEW sobriety_stats_view IS 'Convenient view combining sobriety data with relapse statistics';
