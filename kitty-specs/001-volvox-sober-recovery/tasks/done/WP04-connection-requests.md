---
work_package_id: "WP04"
subtasks:
  - "T016"
  - "T017"
  - "T018"
  - "T019"
  - "T020"
  - "T021"
title: "Connection Requests Flow"
phase: "Phase 1 - MVP Core"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
history:
  - timestamp: "2025-11-03"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP04 – Connection Requests Flow

## Objectives & Success Criteria

**Goal**: Full connection request lifecycle (send, review, accept/decline, notifications)

**Success Criteria**:
- Connection request appears in sponsor queue within 5 seconds
- Push notification delivered when request status changes
- Only one sponsor can accept a given request (database constraint)
- Declined requests show explanation to sponsee

## Context & Constraints

**Prerequisites**: WP02 (user profiles), WP03 (matching to find sponsors)

**Key Docs**: [data-model.md](../../data-model.md#4-connectionrequest) - State machine

**Architecture**: Supabase Realtime for status updates, Firebase Cloud Messaging for push notifications

**Constraints**:
- FCM requires Firebase project setup and server key
- Realtime connection scaling (monitor limits)
- Race conditions if multiple sponsors accept same sponsee

## Subtasks & Detailed Guidance

### T016 – Create ConnectionRequest and Connection tables

**Schema**:
```sql
CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  sponsee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES users(id) ON DELETE CASCADE,

  introduction_message TEXT CHECK (length(introduction_message) <= 500),
  compatibility_score NUMERIC,
  compatibility_reasons TEXT[],

  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  UNIQUE(sponsee_id, sponsor_id, status) WHERE status = 'pending'
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  sponsor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sponsee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  connection_request_id UUID REFERENCES connection_requests(id),

  status TEXT CHECK (status IN ('active', 'on_hiatus', 'disconnected')) DEFAULT 'active',
  disconnected_at TIMESTAMPTZ,
  disconnection_reason TEXT,
  disconnected_by UUID,

  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  total_messages INTEGER DEFAULT 0,
  check_in_completion_rate NUMERIC DEFAULT 0,

  UNIQUE(sponsor_id, sponsee_id) WHERE status = 'active'
);

-- Trigger on request acceptance
CREATE OR REPLACE FUNCTION handle_request_accepted() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Create connection
    INSERT INTO connections (sponsor_id, sponsee_id, connection_request_id)
    VALUES (NEW.sponsor_id, NEW.sponsee_id, NEW.id);

    -- Increment sponsor's sponsee count
    UPDATE users SET current_sponsee_count = current_sponsee_count + 1
    WHERE id = NEW.sponsor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER connection_request_accepted
  AFTER UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION handle_request_accepted();
```

**RLS Policies**: Sponsees see own requests, sponsors see received requests

### T017 – Implement "send connection request" flow

**UI**: Button on match card → Modal with optional intro message (max 500 chars)

**Service**:
```typescript
export const sendConnectionRequest = async (params: {
  sponseeId: string
  sponsorId: string
  introMessage?: string
  compatibilityScore: number
  compatibilityReasons: string[]
}) => {
  const { data, error } = await supabase
    .from('connection_requests')
    .insert({
      sponsee_id: params.sponseeId,
      sponsor_id: params.sponsorId,
      introduction_message: params.introMessage,
      compatibility_score: params.compatibilityScore,
      compatibility_reasons: params.compatibilityReasons
    })
    .single()

  if (error) throw error

  // Trigger push notification to sponsor (handled by database trigger + Edge Function)
  return data
}
```

### T018 – Build sponsor request queue screen

**UI Components**:
- List of pending requests with sponsee profile preview
- Introduction message display
- Compatibility score badge
- Actions: Accept, Decline, Send Message

**Features**:
- Sort by: compatibility, date received
- Filter: by availability, demographics

### T019 – Create request response actions

**Accept Flow**:
```typescript
export const acceptRequest = async (requestId: string) => {
  const { data, error } = await supabase
    .from('connection_requests')
    .update({
      status: 'accepted',
      responded_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .single()

  if (error) throw error
  return data // Trigger creates Connection automatically
}
```

**Decline Flow**: Similar but with optional `response_message`

**Message Before Deciding**: Open conversation without accepting/declining

### T020 – Implement Supabase Realtime subscription

**Client Setup**:
```typescript
export const subscribeToRequestUpdates = (userId: string, callback: (request: ConnectionRequest) => void) => {
  return supabase
    .channel('connection-requests')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'connection_requests',
      filter: `sponsee_id=eq.${userId}`
    }, (payload) => {
      callback(payload.new as ConnectionRequest)
    })
    .subscribe()
}
```

**UI Integration**: Update request status in real-time without polling

### T021 – Set up Firebase Cloud Messaging

**Setup Steps**:
1. Create Firebase project
2. Add FCM configuration to React Native app
3. Create Supabase Edge Function for notifications:

```typescript
// supabase/functions/send-notifications/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId, title, body, data } = await req.json()

  // Get user's FCM token
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: user } = await supabase.from('users').select('fcm_token').eq('id', userId).single()

  if (!user?.fcm_token) return new Response('No FCM token', { status: 400 })

  // Send via FCM
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: user.fcm_token,
      notification: { title, body },
      data
    })
  })

  return new Response(JSON.stringify({ sent: response.ok }), { status: 200 })
})
```

4. Create database trigger to invoke Edge Function on request status changes

**Mobile Integration**: Handle FCM token registration, notification permissions

## Test Strategy

- Integration: Full request lifecycle (send → accept → connection created)
- Realtime: Subscribe to updates, verify real-time delivery
- E2E: Send request on device A, accept on device B, verify push notification

## Risks & Mitigations

**Risk**: Push notification delivery failures
- Mitigation: Fallback to in-app notification system
- Mitigation: Retry failed FCM sends with exponential backoff

**Risk**: Realtime connection scaling (500 limit on Pro tier)
- Mitigation: Monitor connection counts
- Mitigation: Plan upgrade to Team tier at 400+ concurrent

**Risk**: Race conditions on request acceptance
- Mitigation: Database constraint prevents duplicate accepts
- Mitigation: Server-side validation in triggers

## Definition of Done

- [ ] Connection request and connection tables created
- [ ] Sponsee can send request with intro message
- [ ] Sponsor sees pending requests in queue
- [ ] Accept/decline actions work correctly
- [ ] Realtime updates delivered within 5 seconds
- [ ] Push notifications sent on status changes
- [ ] Database constraint prevents duplicate accepts
- [ ] Tests pass for full request lifecycle

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created

---

**Next**: `/spec-kitty.implement WP04` (after WP03)
