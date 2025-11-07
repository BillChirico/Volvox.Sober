# Database Schema Design: All Application Screens

**Feature**: 002-app-screens
**Date**: 2025-11-05
**Database**: PostgreSQL 15+ via Supabase

This document defines the database schema for all main application screens, including tables, relationships, indexes, and Row Level Security (RLS) policies.

---

## Schema Overview

All tables extend the existing `auth.users` table from Supabase Auth (created in feature 001-auth-screens). Each table includes:

- Row Level Security (RLS) enabled
- Foreign keys to `auth.users`
- Timestamps with timezone (`timestamptz`)
- Indexes for frequent query patterns
- Soft deletes for user data (privacy compliance)

---

## Entity Relationship Diagram

```
auth.users (from Supabase Auth)
    ↓
profiles (1:1)
    ↓
onboarding_progress (1:1)
    ↓
sobriety_records (1:1)
    ↓
    ├── matches (1:N) ← Bidirectional with other profiles
    ├── connections (1:N) ← sponsor/sponsee relationships
    │       ↓
    │   messages (1:N) ← Messages within connections
    └── notification_preferences (1:1)
```

---

## Table Definitions

### 1. profiles

**Purpose**: Extended user profile information beyond auth

```sql
CREATE TABLE public.profiles (
  -- Primary Key
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,

  -- Role & Recovery
  role VARCHAR(20) NOT NULL CHECK (role IN ('sponsor', 'sponsee', 'both')),
  recovery_program VARCHAR(50) NOT NULL, -- AA, NA, CA, Smart Recovery, etc.
  sobriety_start_date DATE,

  -- Location (city/state level for privacy)
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'United States',

  -- Availability
  availability JSONB NOT NULL DEFAULT '[]'::JSONB, -- ["weekends", "evenings", "anytime"]

  -- Preferences (for matching)
  preferences JSONB DEFAULT '{}'::JSONB,

  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_recovery_program ON public.profiles(recovery_program) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_location ON public.profiles(city, state) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_sobriety_date ON public.profiles(sobriety_start_date) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id AND deleted_at IS NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id AND deleted_at IS NULL);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

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

-- Trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. onboarding_progress

**Purpose**: Track user's onboarding completion status

```sql
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
  last_step VARCHAR(50), -- 'welcome', 'role_selection', 'profile_form', 'complete'

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

-- Trigger to update updated_at
CREATE TRIGGER update_onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set completed_at when onboarding_completed changes to true
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
```

---

### 3. sobriety_records

**Purpose**: Track user's sobriety journey with milestones and reflections

```sql
CREATE TABLE public.sobriety_records (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sobriety Tracking
  current_sobriety_start_date DATE NOT NULL,
  days_sober INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - current_sobriety_start_date)::INTEGER
  ) STORED,

  -- Relapse History (array of previous start dates)
  previous_sobriety_dates JSONB DEFAULT '[]'::JSONB,

  -- Milestones (array of milestone objects)
  milestones JSONB DEFAULT '[]'::JSONB, -- [{"days": 30, "achieved_at": "2025-01-15T10:00:00Z"}]

  -- Daily Reflections (array of reflection objects)
  reflections JSONB DEFAULT '[]'::JSONB, -- [{"date": "2025-01-01", "text": "Feeling strong today"}]

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sobriety_user_id ON public.sobriety_records(user_id);
CREATE INDEX idx_sobriety_start_date ON public.sobriety_records(current_sobriety_start_date);
CREATE INDEX idx_sobriety_days ON public.sobriety_records(days_sober);

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

-- Connections can read each other's sobriety records
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

-- Trigger to update updated_at
CREATE TRIGGER update_sobriety_records_updated_at
BEFORE UPDATE ON public.sobriety_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 4. matches

**Purpose**: Store potential sponsor/sponsee matches with compatibility scores

```sql
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

  -- Decline Cooldown (30 days from decline)
  decline_cooldown_expires_at TIMESTAMPTZ GENERATED ALWAYS AS (
    CASE WHEN declined_at IS NOT NULL
    THEN declined_at + INTERVAL '30 days'
    ELSE NULL END
  ) STORED,

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
CREATE INDEX idx_matches_cooldown ON public.matches(decline_cooldown_expires_at) WHERE declined_at IS NOT NULL;

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

-- Don't show declined matches within 30-day cooldown
CREATE POLICY "Hide matches in cooldown period"
ON public.matches FOR SELECT
USING (
  auth.uid() = user_id AND
  (status != 'declined' OR decline_cooldown_expires_at < NOW())
);

-- Trigger to update updated_at
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 5. connections

**Purpose**: Manage sponsor/sponsee relationships

```sql
CREATE TABLE public.connections (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Connection Relationship
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Request sent
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ, -- Last message or check-in

  -- Feedback (when ending connection)
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

-- Trigger to update updated_at
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_interaction_at when messages are sent
-- (This will be in the messages table trigger)
```

---

### 6. messages

**Purpose**: Store messages between connected users

```sql
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

-- Trigger to broadcast new message (Supabase Realtime)
CREATE OR REPLACE FUNCTION broadcast_new_message()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'connection:' || NEW.connection_id::TEXT,
    'new_message',
    'INSERT',
    'messages',
    'public',
    NEW,
    NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER broadcast_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION broadcast_new_message();

-- Trigger to update connection's last_interaction_at
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

-- Trigger to update updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 7. notification_preferences

**Purpose**: User notification settings

```sql
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

-- Trigger to update updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Utility Functions

### Update Updated At Column

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Scripts

### Create Tables Migration

```sql
-- Migration: Create profiles, onboarding_progress, sobriety_records, matches, connections, messages, notification_preferences
-- Generated: 2025-11-05

BEGIN;

-- Create utility function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables (see above definitions)
-- ... (all table creation SQL from above)

COMMIT;
```

---

## Data Integrity Constraints

### Business Rules Enforced by Database

1. **Profile Completion**: Calculated based on filled fields
2. **Sobriety Days**: Auto-calculated from start date (generated column)
3. **Match Cooldown**: Auto-calculated 30 days from decline (generated column)
4. **Connection Uniqueness**: One connection per sponsor/sponsee pair
5. **Message Length**: 1-5000 characters
6. **Self-Connections**: Prevented via CHECK constraint
7. **Soft Deletes**: Profiles marked deleted, not removed

---

## Query Patterns & Performance

### Common Queries with Indexes

```sql
-- Get user's pending connection requests (indexed)
SELECT * FROM connections
WHERE sponsee_id = $1 AND status = 'pending'
ORDER BY created_at DESC;

-- Get user's unread messages (indexed)
SELECT m.* FROM messages m
JOIN connections c ON m.connection_id = c.id
WHERE (c.sponsor_id = $1 OR c.sponsee_id = $1)
AND m.status != 'read'
AND m.sender_id != $1
ORDER BY m.created_at DESC;

-- Get top matches for user (indexed)
SELECT p.*, m.compatibility_score
FROM matches m
JOIN profiles p ON m.candidate_id = p.id
WHERE m.user_id = $1
AND m.status = 'suggested'
AND (m.declined_at IS NULL OR m.decline_cooldown_expires_at < NOW())
ORDER BY m.compatibility_score DESC
LIMIT 20;

-- Get active connections sorted by recent interaction (indexed)
SELECT * FROM connections
WHERE (sponsor_id = $1 OR sponsee_id = $1)
AND status = 'active'
ORDER BY last_interaction_at DESC NULLS LAST;
```

---

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with policies that:

- Users can only read/update their own data
- Connected users can read each other's profiles and sobriety records
- Messages are only visible within active connections
- Matches respect the 30-day decline cooldown

### Sensitive Data Protection

- Sobriety dates and reflections only visible to user and active connections
- Profile data is soft-deleted (deleted_at), never hard-deleted
- Message content is not indexed for search (privacy)

---

## Next Steps

1. Generate migration files in `supabase/migrations/`
2. Apply migrations to local Supabase instance
3. Seed test data for development
4. Implement API contracts based on this schema

**Schema Version**: 1.0.0
**Last Updated**: 2025-11-05
