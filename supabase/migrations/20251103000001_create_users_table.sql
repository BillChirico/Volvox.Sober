-- Migration: Create users table
-- Description: Central user account for all platform members (sponsors and sponsees)
-- Created: 2025-11-03

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types for users table
CREATE TYPE user_role AS ENUM ('sponsor', 'sponsee', 'both');
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
CREATE TYPE account_status AS ENUM ('active', 'on_hiatus', 'suspended');

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) NOT NULL UNIQUE,
  email_verified boolean DEFAULT false,
  password_hash varchar(255) NOT NULL,
  role user_role NOT NULL,
  name varchar(100) NOT NULL,
  age integer CHECK (age >= 13),
  gender varchar(50),
  location geography(POINT),
  location_city varchar(100),
  bio text CHECK (LENGTH(bio) <= 1000),
  profile_photo_url text,
  theme_preference theme_preference DEFAULT 'system',
  fcm_token varchar(255),
  account_status account_status DEFAULT 'active',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can view profiles of potential matches (sponsors with capacity)
-- Note: This will reference sponsor_profiles table which will be created in next migration
-- For now, we'll create a simplified version that will be updated later
CREATE POLICY "Users can view matching profiles" ON users
  FOR SELECT USING (
    role IN ('sponsor', 'both') AND
    account_status = 'active'
  );

-- Add comment to table
COMMENT ON TABLE users IS 'Central user account table for all platform members (sponsors and sponsees)';
COMMENT ON COLUMN users.location IS 'Geographic coordinates stored as PostGIS POINT for proximity matching';
COMMENT ON COLUMN users.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN users.password_hash IS 'Managed by Supabase Auth, bcrypt hashed password';
