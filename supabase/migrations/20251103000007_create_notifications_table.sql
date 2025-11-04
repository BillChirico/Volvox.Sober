-- Migration: Create notifications table
-- Description: System-generated alerts for users
-- Created: 2025-11-03

-- Create custom type for notification types
CREATE TYPE notification_type AS ENUM (
  'connection_request',
  'request_accepted',
  'request_declined',
  'new_message',
  'checkin_reminder',
  'milestone',
  'relapse_alert'
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title varchar(255) NOT NULL,
  body text NOT NULL,
  related_entity_type varchar(50),
  related_entity_id uuid,
  action_url varchar(500),
  sent_at timestamptz DEFAULT NOW(),
  read_at timestamptz
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id, sent_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications

-- Policy: Users can view and update their own notifications
CREATE POLICY "Users manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Add comments to table
COMMENT ON TABLE notifications IS 'System-generated alerts for users';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity (connection, message, etc.)';
COMMENT ON COLUMN notifications.action_url IS 'Deep link into app for notification action';
