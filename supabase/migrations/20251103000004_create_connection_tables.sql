-- Migration: Create connection_requests, connections, and matches tables
-- Description: Manage sponsor-sponsee matching and relationships
-- Created: 2025-11-03

-- Create custom types for connection tables
CREATE TYPE connection_request_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE connection_status AS ENUM ('active', 'on_hiatus', 'disconnected');

-- Create connection_requests table
CREATE TABLE connection_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  introduction_message text CHECK (LENGTH(introduction_message) <= 500),
  status connection_request_status DEFAULT 'pending',
  decline_reason text,
  requested_at timestamptz DEFAULT NOW(),
  responded_at timestamptz,
  expires_at timestamptz GENERATED ALWAYS AS (requested_at + INTERVAL '30 days') STORED
);

-- Create connections table
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sponsee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status connection_status DEFAULT 'active',
  connected_at timestamptz DEFAULT NOW(),
  disconnected_at timestamptz,
  disconnection_reason text,
  first_contact_at timestamptz,
  last_contact_at timestamptz,
  total_messages integer DEFAULT 0,
  checkin_completion_rate numeric(5,2) DEFAULT 0.00,
  archive_after timestamptz,
  CONSTRAINT unique_sponsor_sponsee UNIQUE (sponsor_id, sponsee_id)
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score integer CHECK (compatibility_score BETWEEN 0 AND 100),
  proximity_score integer,
  sobriety_alignment_score integer,
  communication_score integer,
  demographic_score integer,
  availability_score integer,
  compatibility_reasons jsonb NOT NULL,
  match_timestamp timestamptz DEFAULT NOW(),
  viewed boolean DEFAULT false,
  viewed_at timestamptz
);

-- Create indexes for connection_requests
CREATE INDEX idx_connection_requests_sponsor_id ON connection_requests(sponsor_id, status);
CREATE INDEX idx_connection_requests_sponsee_id ON connection_requests(sponsee_id, status);

-- Create indexes for connections
CREATE INDEX idx_connections_sponsor_id ON connections(sponsor_id, status);
CREATE INDEX idx_connections_sponsee_id ON connections(sponsee_id, status);
CREATE INDEX idx_connections_status ON connections(status);

-- Create indexes for matches
CREATE INDEX idx_matches_sponsee_id ON matches(sponsee_id, compatibility_score DESC);
CREATE INDEX idx_matches_sponsor_id ON matches(sponsor_id);

-- Enable Row Level Security
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connection_requests

-- Policy: Sponsees can manage their own requests
CREATE POLICY "Sponsees manage own requests" ON connection_requests
  FOR ALL USING (sponsee_id = auth.uid());

-- Policy: Sponsors can manage incoming requests
CREATE POLICY "Sponsors manage incoming requests" ON connection_requests
  FOR ALL USING (sponsor_id = auth.uid());

-- RLS Policies for connections

-- Policy: Users can manage their own connections
CREATE POLICY "Users manage own connections" ON connections
  FOR ALL USING (sponsor_id = auth.uid() OR sponsee_id = auth.uid());

-- RLS Policies for matches

-- Policy: Sponsees can view their own matches
CREATE POLICY "Sponsees view own matches" ON matches
  FOR SELECT USING (sponsee_id = auth.uid());

-- Add comments to tables
COMMENT ON TABLE connection_requests IS 'Track sponsee requests to connect with sponsors';
COMMENT ON TABLE connections IS 'Active sponsor-sponsee relationships';
COMMENT ON TABLE matches IS 'Generated sponsor-sponsee match suggestions (cached algorithm results)';
COMMENT ON COLUMN connections.archive_after IS 'Auto-delete after 90 days from disconnection';
COMMENT ON COLUMN matches.compatibility_reasons IS 'Array of reason strings (e.g., ["Nearby location", "Similar recovery timeline"])';
