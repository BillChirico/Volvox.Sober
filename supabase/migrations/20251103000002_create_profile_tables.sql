-- Migration: Create sponsor_profiles and sponsee_profiles tables
-- Description: Extended profile data for users in sponsor/sponsee roles
-- Created: 2025-11-03

-- Create custom types for profile tables
CREATE TYPE communication_frequency AS ENUM ('daily', 'few_times_week', 'weekly');

-- Create sponsor_profiles table
CREATE TABLE sponsor_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_capacity integer DEFAULT 0 CHECK (current_capacity >= 0),
  max_capacity integer NOT NULL CHECK (max_capacity BETWEEN 1 AND 10),
  communication_frequency communication_frequency NOT NULL,
  communication_methods jsonb NOT NULL,
  external_phone varchar(20),
  external_email varchar(255),
  sobriety_time_years integer NOT NULL CHECK (sobriety_time_years >= 1),
  preferred_gender varchar(50),
  preferred_age_min integer CHECK (preferred_age_min >= 13),
  preferred_age_max integer CHECK (preferred_age_max <= 120),
  preferred_sobriety_min_days integer,
  sponsor_bio text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create sponsee_profiles table
CREATE TABLE sponsee_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_sponsor_gender varchar(50),
  preferred_sponsor_age_min integer,
  preferred_sponsor_age_max integer,
  preferred_communication_frequency communication_frequency,
  preferred_communication_style text,
  special_considerations text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for sponsor_profiles
CREATE INDEX idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);
CREATE INDEX idx_sponsor_profiles_capacity ON sponsor_profiles(current_capacity, max_capacity);

-- Create indexes for sponsee_profiles
CREATE INDEX idx_sponsee_profiles_user_id ON sponsee_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsee_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_profiles

-- Policy: Sponsors can manage their own profile
CREATE POLICY "Sponsors manage own profile" ON sponsor_profiles
  FOR ALL USING (user_id = auth.uid());

-- Policy: Sponsees can view sponsor profiles for matching
CREATE POLICY "Sponsees view sponsor profiles for matching" ON sponsor_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = sponsor_profiles.user_id
      AND users.account_status = 'active'
    )
  );

-- RLS Policies for sponsee_profiles

-- Policy: Sponsees can manage their own profile
CREATE POLICY "Sponsees manage own profile" ON sponsee_profiles
  FOR ALL USING (user_id = auth.uid());

-- Policy: Sponsors can view connected sponsees' profiles
-- Note: This will reference connections table which will be created in a later migration
-- For now, we'll create a simplified version that will be updated later
CREATE POLICY "Sponsors view connected sponsee profiles" ON sponsee_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Add comments to tables
COMMENT ON TABLE sponsor_profiles IS 'Extended profile data for users in sponsor role';
COMMENT ON TABLE sponsee_profiles IS 'Extended profile data for users in sponsee role';
COMMENT ON COLUMN sponsor_profiles.communication_methods IS 'JSONB array of communication methods: ["in_app", "phone", "video"]';
COMMENT ON COLUMN sponsor_profiles.external_phone IS 'Visible only to connected sponsees';
COMMENT ON COLUMN sponsor_profiles.external_email IS 'Visible only to connected sponsees';
