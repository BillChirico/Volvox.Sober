-- Migration: Add delivery tracking to messages table
-- Description: Add delivered_at column for message delivery confirmation (WP08 T117)
-- Created: 2025-11-04

-- Add delivered_at column for tracking when recipient's device received the message
ALTER TABLE messages ADD COLUMN delivered_at timestamptz;

-- Create index for delivery status queries
CREATE INDEX idx_messages_delivery_status ON messages(recipient_id, delivered_at);

-- Add comment
COMMENT ON COLUMN messages.delivered_at IS 'Timestamp when message was delivered to recipient device (WP08 T117)';
