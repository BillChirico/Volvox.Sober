-- Migration: WP07 T034 - Messaging and Check-Ins
-- Description: Create messages, check_ins, and check_in_responses tables with triggers
-- Dependencies: connections table (WP04), users table (WP02)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text TEXT CHECK (length(text) <= 2000) NOT NULL,

  read_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE NOT NULL,

  CONSTRAINT messages_sender_recipient_check
    CHECK (sender_id != recipient_id)
);

-- Indexes for message queries
CREATE INDEX idx_messages_connection_id ON messages(connection_id, created_at DESC);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);

-- ============================================================
-- CHECK-INS TABLE
-- ============================================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  recurrence TEXT CHECK (recurrence IN ('daily', 'weekly', 'custom')) NOT NULL,
  custom_interval_days INTEGER CHECK (custom_interval_days > 0),
  scheduled_time TIME NOT NULL,
  timezone TEXT NOT NULL,

  questions TEXT[] NOT NULL CHECK (array_length(questions, 1) > 0),

  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  next_scheduled_at TIMESTAMPTZ NOT NULL,

  CONSTRAINT check_ins_custom_interval_required
    CHECK (recurrence != 'custom' OR custom_interval_days IS NOT NULL)
);

-- Index for check-in scheduling queries
CREATE INDEX idx_check_ins_next_scheduled ON check_ins(next_scheduled_at) WHERE is_active = TRUE;
CREATE INDEX idx_check_ins_connection ON check_ins(connection_id, is_active);

-- ============================================================
-- CHECK-IN RESPONSES TABLE
-- ============================================================
CREATE TABLE check_in_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  scheduled_for TIMESTAMPTZ NOT NULL,
  response_status TEXT CHECK (response_status IN ('completed', 'missed')) NOT NULL,
  responses JSONB DEFAULT '[]' NOT NULL,

  CONSTRAINT check_in_responses_completed_has_data
    CHECK (response_status != 'completed' OR jsonb_array_length(responses) > 0)
);

-- Indexes for check-in response queries
CREATE INDEX idx_check_in_responses_check_in ON check_in_responses(check_in_id, scheduled_for DESC);
CREATE INDEX idx_check_in_responses_connection ON check_in_responses(connection_id, created_at DESC);
CREATE INDEX idx_check_in_responses_missed ON check_in_responses(check_in_id, response_status, created_at DESC)
  WHERE response_status = 'missed';

-- ============================================================
-- TRIGGER: Update connection message stats
-- ============================================================
CREATE OR REPLACE FUNCTION update_connection_message_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update connection stats when a new message is inserted
  UPDATE connections SET
    first_message_at = COALESCE(first_message_at, NOW()),
    last_message_at = NOW(),
    total_messages = total_messages + 1,
    updated_at = NOW()
  WHERE id = NEW.connection_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_connection_message_stats();

-- ============================================================
-- TRIGGER: Update check_in updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_check_in_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_in_updated
  BEFORE UPDATE ON check_ins
  FOR EACH ROW EXECUTE FUNCTION update_check_in_timestamp();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_responses ENABLE ROW LEVEL SECURITY;

-- Messages: Users can only see messages in their connections
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can insert messages in their connections"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND status = 'active'
      AND (sponsor_id = auth.uid() OR sponsee_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Check-ins: Only sponsors can manage, sponsees can view
CREATE POLICY "Sponsors can manage check-ins"
  ON check_ins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND sponsor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND sponsor_id = auth.uid()
    )
  );

CREATE POLICY "Sponsees can view their check-ins"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND sponsee_id = auth.uid()
    )
  );

-- Check-in responses: Sponsees create, sponsors view
CREATE POLICY "Sponsees can create check-in responses"
  ON check_in_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND sponsee_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Connection participants can view check-in responses"
  ON check_in_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE id = connection_id
      AND (sponsor_id = auth.uid() OR sponsee_id = auth.uid())
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_read(message_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE id = message_id
  AND recipient_id = auth.uid()
  AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE recipient_id = auth.uid()
    AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE messages IS 'Stores messages between sponsors and sponsees within a connection';
COMMENT ON TABLE check_ins IS 'Scheduled check-ins created by sponsors for sponsees';
COMMENT ON TABLE check_in_responses IS 'Responses to check-ins, including missed check-ins';

COMMENT ON COLUMN messages.archived IS 'Soft delete flag for messages';
COMMENT ON COLUMN check_ins.next_scheduled_at IS 'Next scheduled time for check-in notification';
COMMENT ON COLUMN check_in_responses.responses IS 'JSONB array of {question, answer} objects';
