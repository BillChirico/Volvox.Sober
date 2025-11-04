-- Migration: Create connections and connection_requests tables
-- WP05: Connection Requests & Management

-- Connection Requests Table
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT CHECK (char_length(message) <= 200),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
  declined_reason TEXT CHECK (char_length(declined_reason) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Business rules
  CONSTRAINT no_self_connection CHECK (sponsee_id != sponsor_id),
  CONSTRAINT unique_pending_request UNIQUE (sponsee_id, sponsor_id, status) WHERE status = 'pending'
);

-- Create index for faster queries
CREATE INDEX idx_connection_requests_sponsor ON connection_requests(sponsor_id, status);
CREATE INDEX idx_connection_requests_sponsee ON connection_requests(sponsee_id, status);

-- Active Connections Table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_request_id UUID REFERENCES connection_requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'disconnected')) DEFAULT 'active',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  last_contact TIMESTAMPTZ,

  -- Business rules
  CONSTRAINT no_self_sponsorship CHECK (sponsee_id != sponsor_id),
  CONSTRAINT unique_active_connection UNIQUE (sponsee_id, sponsor_id) WHERE status = 'active'
);

-- Create indexes for faster queries
CREATE INDEX idx_connections_sponsor ON connections(sponsor_id, status);
CREATE INDEX idx_connections_sponsee ON connections(sponsee_id, status);
CREATE INDEX idx_connections_both_parties ON connections(sponsee_id, sponsor_id, status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for connection_requests
CREATE TRIGGER update_connection_requests_updated_at
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update sponsor capacity on connection accept/disconnect
CREATE OR REPLACE FUNCTION update_sponsor_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- On connection creation (accept), decrement available slots
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE sponsor_profiles
    SET current_sponsees = current_sponsees + 1
    WHERE user_id = NEW.sponsor_id;
  END IF;

  -- On disconnect, increment available slots
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'disconnected' THEN
    UPDATE sponsor_profiles
    SET current_sponsees = current_sponsees - 1
    WHERE user_id = NEW.sponsor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sponsor capacity updates
CREATE TRIGGER trigger_update_sponsor_capacity
  AFTER INSERT OR UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_capacity();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Connection Requests Policies
-- Sponsees can view their own sent requests
CREATE POLICY "Sponsees can view own requests"
  ON connection_requests FOR SELECT
  USING (auth.uid() = sponsee_id);

-- Sponsors can view requests sent to them
CREATE POLICY "Sponsors can view received requests"
  ON connection_requests FOR SELECT
  USING (auth.uid() = sponsor_id);

-- Sponsees can send connection requests
CREATE POLICY "Sponsees can send requests"
  ON connection_requests FOR INSERT
  WITH CHECK (auth.uid() = sponsee_id);

-- Sponsors can update (accept/decline) their requests
CREATE POLICY "Sponsors can update received requests"
  ON connection_requests FOR UPDATE
  USING (auth.uid() = sponsor_id);

-- Sponsees can update (cancel) their sent requests
CREATE POLICY "Sponsees can cancel own requests"
  ON connection_requests FOR UPDATE
  USING (auth.uid() = sponsee_id AND status = 'pending');

-- Connections Policies
-- Both parties can view their active connections
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  USING (auth.uid() = sponsee_id OR auth.uid() = sponsor_id);

-- System can create connections (via triggers/functions)
CREATE POLICY "System can create connections"
  ON connections FOR INSERT
  WITH CHECK (true);

-- Both parties can update connections (disconnect)
CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = sponsee_id OR auth.uid() = sponsor_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON connection_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON connections TO authenticated;

-- Comments for documentation
COMMENT ON TABLE connection_requests IS 'Stores connection requests from sponsees to sponsors';
COMMENT ON TABLE connections IS 'Stores active and historical connections between sponsees and sponsors';
COMMENT ON COLUMN connection_requests.message IS 'Optional message from sponsee (max 200 chars)';
COMMENT ON COLUMN connection_requests.status IS 'Request status: pending, accepted, declined, cancelled';
COMMENT ON COLUMN connections.status IS 'Connection status: active, disconnected';
COMMENT ON COLUMN connections.last_contact IS 'Timestamp of last message or interaction';
