-- Migration: Create messages, checkins, and checkin_responses tables
-- Description: Real-time messaging and scheduled check-ins between sponsors and sponsees
-- Created: 2025-11-03

-- Create custom types for messaging tables
CREATE TYPE message_type AS ENUM ('text', 'checkin_response', 'system');
CREATE TYPE checkin_recurrence AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE checkin_response_status AS ENUM ('completed', 'missed');

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid NOT NULL REFERENCES users(id),
  message_text text NOT NULL CHECK (LENGTH(message_text) <= 5000),
  message_type message_type DEFAULT 'text',
  sent_at timestamptz DEFAULT NOW(),
  read_at timestamptz,
  archived boolean DEFAULT false
);

-- Create checkins table
CREATE TABLE checkins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  recurrence checkin_recurrence NOT NULL,
  custom_interval_days integer CHECK (custom_interval_days > 0),
  active boolean DEFAULT true,
  next_scheduled_at timestamptz NOT NULL,
  timezone varchar(50) NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Create checkin_responses table
CREATE TABLE checkin_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id uuid NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  responded_at timestamptz DEFAULT NOW(),
  status checkin_response_status DEFAULT 'completed'
);

-- Create indexes for messages
CREATE INDEX idx_messages_connection_id ON messages(connection_id, sent_at DESC);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id, read_at);

-- Create indexes for checkins
CREATE INDEX idx_checkins_connection_id ON checkins(connection_id);
CREATE INDEX idx_checkins_next_scheduled ON checkins(next_scheduled_at, active);

-- Create indexes for checkin_responses
CREATE INDEX idx_checkin_responses_checkin_id ON checkin_responses(checkin_id, responded_at DESC);
CREATE INDEX idx_checkin_responses_connection_id ON checkin_responses(connection_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages

-- Policy: Users can view messages where they are sender or recipient
CREATE POLICY "Users view own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Policy: Users can send messages in their active connections
CREATE POLICY "Users send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND (connections.sponsor_id = auth.uid() OR connections.sponsee_id = auth.uid())
      AND connections.status = 'active'
    )
  );

-- Policy: Users can update read status of their own messages
CREATE POLICY "Users update message read status" ON messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- RLS Policies for checkins

-- Policy: Sponsors can manage check-ins for their connections
CREATE POLICY "Sponsors manage check-ins" ON checkins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND connections.sponsor_id = auth.uid()
    )
  );

-- Policy: Sponsees can view check-ins created for them
CREATE POLICY "Sponsees view own check-ins" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND connections.sponsee_id = auth.uid()
    )
  );

-- RLS Policies for checkin_responses

-- Policy: Sponsees can create responses to their check-ins
CREATE POLICY "Sponsees respond to check-ins" ON checkin_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND connections.sponsee_id = auth.uid()
    )
  );

-- Policy: Both sponsor and sponsee can view responses
CREATE POLICY "Users view check-in responses" ON checkin_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND (connections.sponsor_id = auth.uid() OR connections.sponsee_id = auth.uid())
    )
  );

-- Add comments to tables
COMMENT ON TABLE messages IS 'Text messages between sponsor and sponsee';
COMMENT ON TABLE checkins IS 'Scheduled recurring check-in prompts created by sponsors';
COMMENT ON TABLE checkin_responses IS 'Sponsee responses to scheduled check-ins';
COMMENT ON COLUMN messages.archived IS 'Soft delete for disconnected relationships';
COMMENT ON COLUMN checkins.questions IS 'JSONB array of {question_id, question_text}';
COMMENT ON COLUMN checkin_responses.answers IS 'JSONB array of {question_id, answer_text}';
