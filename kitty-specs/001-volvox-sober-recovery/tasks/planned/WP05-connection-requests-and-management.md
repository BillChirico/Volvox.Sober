---
work_package_id: "WP05"
subtasks:
  - "T073"
  - "T074"
  - "T075"
  - "T076"
  - "T077"
  - "T078"
  - "T079"
  - "T080"
  - "T081"
  - "T082"
  - "T083"
  - "T084"
  - "T085"
  - "T086"
title: "Connection Requests & Management"
phase: "Phase 1 - MVP"
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

# Work Package Prompt: WP05 – Connection Requests & Management

## Objectives & Success Criteria

**Primary Objective**: Implement connection request workflow (send, accept, decline) and connection management (view, disconnect).

**Success Criteria**:
- Sponsees can send connection requests with optional message
- Sponsors receive push notifications for new requests
- Sponsors can accept/decline with feedback message
- Both parties can view active connections and disconnect
- Disconnection preserves messages for 90 days per constitution
- RLS policies enforce mutual visibility after connection

## Context & Constraints

**Related Documents**:
- User Stories: US1 (sponsee connections), US2 (sponsor management)
- Contract: `contracts/connections.yaml`
- Constitution: Security (RLS mutual visibility), Data Retention (90-day message archive)

**State Diagram**:
```
[pending] → accept → [active]
[pending] → decline → [declined]
[active] → disconnect → [disconnected]
```

## Subtasks & Detailed Guidance

### Connection Request Flow (T073-T078)

**T073: Send connection request**
- Input: sponsor_id, optional message (200 char max)
- Insert into connection_requests: status='pending', created_at=NOW()
- Trigger push notification to sponsor
- Show toast: "Request sent to [sponsor name]"

**T074: View pending requests (sponsor)**
- Query: `SELECT * FROM connection_requests WHERE sponsor_id = auth.uid() AND status = 'pending'`
- Display: sponsee name, photo, message, days_since_request
- Actions: Accept button, Decline button

**T075: Accept connection request**
- Update: connection_requests status = 'accepted'
- Insert into connections: sponsor_id, sponsee_id, connected_at = NOW()
- Trigger: update_sponsor_capacity() decrements available slots
- Send push notification to sponsee: "Your request was accepted!"

**T076: Decline connection request**
- Update: connection_requests status = 'declined', declined_reason (optional)
- Send push notification to sponsee: "Request was declined"
- Feedback message: "You can send another request in 30 days"

**T077: View sent requests (sponsee)**
- Query: `SELECT * FROM connection_requests WHERE sponsee_id = auth.uid()`
- Display: sponsor name, status (pending/accepted/declined), sent_date
- No actions for pending (wait for sponsor response)

**T078: Cancel pending request**
- Update: connection_requests status = 'cancelled'
- Show confirmation dialog: "Are you sure? You can send another request in 7 days."

### Connection Management (T079-T083)

**T079: View active connections**
- Query: `SELECT * FROM connections WHERE sponsor_id = auth.uid() OR sponsee_id = auth.uid()`
- Display: connection cards with name, photo, connected_since, last_contact
- Navigate to connection detail on tap

**T080: Connection detail screen**
- Show: full profile, connection stats (messages_sent, checkins_completed, last_contact)
- Actions: "Send Message" (navigate to messaging), "Disconnect"
- Mutual visibility: both sponsor and sponsee see same view

**T081: Disconnect flow**
- Show confirmation dialog: "Are you sure? Messages will be archived for 90 days."
- Update: connections status = 'disconnected', disconnected_at = NOW()
- Trigger: update_sponsor_capacity() increments available slots
- Archive messages: mark with retention_until = NOW() + 90 days

**T082: Message archiving**
- Background job: daily check for messages with retention_until < NOW()
- Delete archived messages: `DELETE FROM messages WHERE retention_until < NOW()`
- Preserve step_work: never delete sponsee's personal step work

**T083: Connection stats dashboard**
- For sponsors: list all sponsees with progress metrics (step_work completion, checkin frequency)
- For sponsees: list sponsors with contact stats (last_message, avg_response_time)
- Navigate to connection detail on tap

### API & Notifications (T084-T086)

**T084: Connections API slice (RTK Query)**
- Endpoints: sendRequest, acceptRequest, declineRequest, disconnect, getConnections
- Tag invalidation: connection updates invalidate 'Connections' cache

**T085: Push notification setup**
- Firebase Cloud Messaging (FCM) configuration for iOS and Android
- Notification types: new_request, request_accepted, request_declined, new_message
- Deep linking: notification tap opens relevant screen (requests, connections, messages)

**T086: RLS policies for connections**
- connection_requests: requestor and recipient can view own requests
- connections: both parties can view active connections
- Test unauthorized access: verify other users cannot see connections

## Test Strategy

**Unit Tests**:
- Connection state transitions: pending → accepted, pending → declined
- Capacity updates: verify sponsor capacity decrements/increments

**Integration Tests**:
- RLS policies: unauthorized users cannot view others' connections
- Message archiving: verify 90-day retention after disconnect

**E2E Tests** (Detox):
- Send request → sponsor accepts → verify both see active connection
- Disconnect flow → verify messages archived, connection status updated

## Risks & Mitigations

**Risk**: Push notification delivery failures
- **Mitigation**: In-app notification fallback, polling for updates every 5 minutes

**Risk**: Race condition: multiple sponsees request same sponsor at capacity
- **Mitigation**: Database constraint on sponsor capacity, transaction isolation

**Risk**: Message archiving job fails, data lost before 90 days
- **Mitigation**: Database trigger marks retention_until on disconnect, alerting on job failures

## Definition of Done Checklist

- [ ] All 14 subtasks (T073-T086) completed
- [ ] Connection requests send and receive correctly
- [ ] Accept/decline updates database and sends notifications
- [ ] Active connections display in dashboard
- [ ] Disconnect archives messages for 90 days
- [ ] RLS policies enforce mutual visibility
- [ ] Push notifications tested on iOS and Android
- [ ] Constitution compliance: security, data retention

## Review Guidance

**Key Review Points**:
- Connection state machine logic is correct
- RLS policies tested with unauthorized access attempts
- Message archiving job runs reliably
- Push notifications deliver within 2-minute window

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
