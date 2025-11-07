-- ============================================================
-- Initial Database Schema for Volvox.Sober
-- ============================================================
-- Description: Complete database schema for the sobriety support platform
-- Feature: 002-app-screens
-- Date: 2025-11-05
-- Tables: profiles, onboarding_progress, sobriety_records, matches, connections, messages, notification_preferences
-- ============================================================

BEGIN;

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE 1: profiles
-- ============================================================
-- Purpose: Extended user profile information beyond auth
-- ============================================================

CREATE TABLE public.profiles (
  -- Primary Key
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,

  -- Role & Recovery
  role VARCHAR(20) NOT NULL CHECK (role IN ('sponsor', 'sponsee', 'both')),
  recovery_program VARCHAR(50) NOT NULL,
  sobriety_start_date DATE,

  -- Location (city/state level for privacy)
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'United States',

  -- Availability
  availability JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Preferences (for matching)
  preferences JSONB DEFAULT '{}'::JSONB,

  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_recovery_program ON public.profiles(recovery_program) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_location ON public.profiles(city, state) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_sobriety_date ON public.profiles(sobriety_start_date) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Trigger
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE 2: onboarding_progress
-- ============================================================
-- Purpose: Track user's onboarding completion status
-- ============================================================

CREATE TABLE public.onboarding_progress (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Progress Tracking
  welcome_completed BOOLEAN DEFAULT FALSE,
  role_selected BOOLEAN DEFAULT FALSE,
  profile_form_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Last Step
  last_step VARCHAR(50),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_onboarding_user_id ON public.onboarding_progress(user_id);
CREATE INDEX idx_onboarding_completed ON public.onboarding_progress(onboarding_completed);

-- RLS Policies
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own onboarding progress"
ON public.onboarding_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress"
ON public.onboarding_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
ON public.onboarding_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_onboarding_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_completed = TRUE AND OLD.onboarding_completed = FALSE THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_completed_timestamp
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION set_onboarding_completed_at();

-- ============================================================
-- TABLE 3: sobriety_records
-- ============================================================
-- Purpose: Track user's sobriety journey with milestones and reflections
-- ============================================================

CREATE TABLE public.sobriety_records (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sobriety Tracking
  current_sobriety_start_date DATE NOT NULL,

  -- Relapse History
  previous_sobriety_dates JSONB DEFAULT '[]'::JSONB,

  -- Milestones
  milestones JSONB DEFAULT '[]'::JSONB,

  -- Daily Reflections
  reflections JSONB DEFAULT '[]'::JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sobriety_user_id ON public.sobriety_records(user_id);
CREATE INDEX idx_sobriety_start_date ON public.sobriety_records(current_sobriety_start_date);

-- RLS Policies
ALTER TABLE public.sobriety_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sobriety record"
ON public.sobriety_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sobriety record"
ON public.sobriety_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sobriety record"
ON public.sobriety_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_sobriety_records_updated_at
BEFORE UPDATE ON public.sobriety_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE 4: matches
-- ============================================================
-- Purpose: Store potential sponsor/sponsee matches with compatibility scores
-- ============================================================

CREATE TABLE public.matches (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Match Relationship
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Matching
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
  status VARCHAR(20) NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'requested', 'declined', 'connected')),

  -- Timestamps
  last_shown_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, candidate_id)
);

-- Indexes
CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_candidate_id ON public.matches(candidate_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_compatibility_score ON public.matches(compatibility_score DESC);

-- RLS Policies
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own matches"
ON public.matches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
ON public.matches FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
ON public.matches FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE 5: connections
-- ============================================================
-- Purpose: Manage sponsor/sponsee relationships
-- ============================================================

CREATE TABLE public.connections (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Connection Relationship
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,

  -- Feedback
  end_feedback TEXT,
  ended_by UUID REFERENCES auth.users(id),

  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(sponsor_id, sponsee_id),
  CHECK (sponsor_id != sponsee_id)
);

-- Indexes
CREATE INDEX idx_connections_sponsor_id ON public.connections(sponsor_id);
CREATE INDEX idx_connections_sponsee_id ON public.connections(sponsee_id);
CREATE INDEX idx_connections_status ON public.connections(status);
CREATE INDEX idx_connections_last_interaction ON public.connections(last_interaction_at DESC);

-- RLS Policies
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own connections"
ON public.connections FOR SELECT
USING (auth.uid() = sponsor_id OR auth.uid() = sponsee_id);

CREATE POLICY "Users can update their own connections"
ON public.connections FOR UPDATE
USING (auth.uid() = sponsor_id OR auth.uid() = sponsee_id);

CREATE POLICY "Users can insert connections they're part of"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = sponsor_id OR auth.uid() = sponsee_id);

-- Trigger
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE 6: messages
-- ============================================================
-- Purpose: Store messages between connected users
-- ============================================================

CREATE TABLE public.messages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Message Relationship
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  text TEXT NOT NULL CHECK (length(text) > 0 AND length(text) <= 5000),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_connection_id ON public.messages(connection_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_status ON public.messages(status);

-- RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages in their connections"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.id = messages.connection_id
    AND (connections.sponsor_id = auth.uid() OR connections.sponsee_id = auth.uid())
    AND connections.status = 'active'
  )
);

CREATE POLICY "Users can insert messages in their active connections"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.id = connection_id
    AND (connections.sponsor_id = auth.uid() OR connections.sponsee_id = auth.uid())
    AND connections.status = 'active'
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

-- Triggers
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_connection_last_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.connections
  SET last_interaction_at = NEW.created_at
  WHERE id = NEW.connection_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_connection_interaction_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_connection_last_interaction();

-- ============================================================
-- TABLE 7: notification_preferences
-- ============================================================
-- Purpose: User notification settings
-- ============================================================

CREATE TABLE public.notification_preferences (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification Types
  new_message_notifications BOOLEAN DEFAULT TRUE,
  milestone_notifications BOOLEAN DEFAULT TRUE,
  connection_request_notifications BOOLEAN DEFAULT TRUE,

  -- Channels
  push_notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_prefs_user_id ON public.notification_preferences(user_id);

-- RLS Policies
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notification preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ADDITIONAL RLS POLICIES (Cross-table relationships)
-- ============================================================

-- Users can read profiles of their connections
CREATE POLICY "Users can read connected profiles"
ON public.profiles FOR SELECT
USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE (sponsor_id = auth.uid() AND sponsee_id = profiles.id)
       OR (sponsee_id = auth.uid() AND sponsor_id = profiles.id)
    AND status = 'active'
  )
);

-- Users can read profiles of potential matches
CREATE POLICY "Users can read match profiles"
ON public.profiles FOR SELECT
USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE user_id = auth.uid()
    AND candidate_id = profiles.id
    AND status IN ('suggested', 'requested')
  )
);

-- Connected users can read each other's sobriety records
CREATE POLICY "Connected users can read sobriety records"
ON public.sobriety_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE (sponsor_id = auth.uid() AND sponsee_id = sobriety_records.user_id)
       OR (sponsee_id = auth.uid() AND sponsor_id = sobriety_records.user_id)
    AND status = 'active'
  )
);

COMMIT;
