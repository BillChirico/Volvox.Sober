-- Migration: Create database triggers and functions
-- Description: Automated triggers for timestamps, notifications, and business logic
-- Created: 2025-11-03

-- ============================================
-- Trigger 1: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_profiles_updated_at BEFORE UPDATE ON sponsor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsee_profiles_updated_at BEFORE UPDATE ON sponsee_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sobriety_dates_updated_at BEFORE UPDATE ON sobriety_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger 2: Notify on new messages (Realtime)
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'connection:' || NEW.connection_id::text,
    json_build_object(
      'type', 'new_message',
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'sent_at', NEW.sent_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_message_insert AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ============================================
-- Trigger 3: Update connection last_contact_at
-- ============================================

CREATE OR REPLACE FUNCTION update_connection_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE connections
  SET last_contact_at = NEW.sent_at,
      total_messages = total_messages + 1
  WHERE id = NEW.connection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_contact AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_connection_last_contact();

-- ============================================
-- Trigger 4: Update sponsor capacity
-- ============================================

CREATE OR REPLACE FUNCTION update_sponsor_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- On connection insert or status change to active
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active') THEN
    UPDATE sponsor_profiles
    SET current_capacity = current_capacity + 1
    WHERE user_id = NEW.sponsor_id;

  -- On connection status change from active to inactive
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE sponsor_profiles
    SET current_capacity = current_capacity - 1
    WHERE user_id = NEW.sponsor_id;

  -- On connection delete
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE sponsor_profiles
    SET current_capacity = current_capacity - 1
    WHERE user_id = OLD.sponsor_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_capacity_on_connection AFTER INSERT OR UPDATE OR DELETE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_sponsor_capacity();

-- Add comments for documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Auto-update updated_at timestamp on row modification';
COMMENT ON FUNCTION notify_new_message() IS 'Broadcast new message via PostgreSQL NOTIFY for Realtime subscriptions';
COMMENT ON FUNCTION update_connection_last_contact() IS 'Update connection last_contact_at and message count when new message is sent';
COMMENT ON FUNCTION update_sponsor_capacity() IS 'Update sponsor current_capacity when connections change status';
