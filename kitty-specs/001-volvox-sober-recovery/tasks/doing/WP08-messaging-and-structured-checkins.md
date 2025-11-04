---
work_package_id: 'WP08'
subtasks:
  - 'T114'
  - 'T115'
  - 'T116'
  - 'T117'
  - 'T118'
  - 'T119'
  - 'T120'
  - 'T121'
  - 'T122'
  - 'T123'
  - 'T124'
  - 'T125'
  - 'T126'
  - 'T127'
  - 'T128'
  - 'T129'
title: 'Messaging & Structured Check-Ins'
phase: 'Phase 2 - Core Features'
lane: "doing"
assignee: ''
agent: "claude"
shell_pid: "15009"
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
---

# Work Package Prompt: WP08 – Messaging & Structured Check-Ins

## Objectives & Success Criteria

**Primary Objective**: Implement real-time messaging with Supabase Realtime and scheduled check-ins with templated prompts.

**Success Criteria**:

- Messages deliver in < 5 seconds under 3G+ conditions (constitution requirement)
- Real-time updates via Supabase Realtime subscriptions (WebSocket)
- Read receipts and typing indicators functional
- Scheduled check-ins trigger notifications at configured times (±2 minute window)
- Check-in responses stored with sentiment tracking
- Offline messages queue and sync on reconnect

## Context & Constraints

**Related Documents**:

- User Story: US5 (messaging and check-ins) - P2 priority
- Contract: `contracts/messages.yaml`
- Constitution: Performance (<5s delivery), Offline-First

**Data Model**:

- messages: connection_id, sender_id, recipient_id, content, read_at
- checkins: connection_id, schedule (daily/weekly), prompt_template
- checkin_responses: checkin_id, response_text, sentiment

## Subtasks & Detailed Guidance

### Messaging Core (T114-T119)

**T114: Messages data model setup**

- Already created in WP02, verify indexes:
  - idx_messages_connection_id (for conversation threads)
  - idx_messages_recipient_id (for unread counts)
- Test query performance: fetch 50 messages < 100ms

**T115: Supabase Realtime subscription**

- Subscribe to messages table changes:
  ```typescript
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
      payload => dispatch(addMessage(payload.new)),
    )
    .subscribe();
  ```
- Clean up subscription on component unmount

**T116: Send message flow**

- Input: connection_id, content (max 1000 chars)
- Insert into messages table
- Database trigger: notify_new_message() sends PostgreSQL NOTIFY
- Realtime broadcasts to recipient
- Optimistic UI: show message immediately, rollback on error

**T117: Message delivery confirmation**

- Update messages.delivered_at on recipient's app open
- Display double-checkmark icon when delivered
- Edge case: offline recipient receives on next app open

**T118: Read receipts**

- Update messages.read_at when recipient views conversation
- Display "Read" below message with timestamp
- RLS policy: only sender and recipient can update read_at

**T119: Typing indicators**

- Realtime channel: broadcast typing events (not persisted)
  ```typescript
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { user_id: userId, connection_id: connectionId },
  });
  ```
- Display "[Name] is typing..." for 3 seconds after last event

### Messaging UI (T120-T123)

**T120: Conversation list screen**

- Display: all connections with last message, timestamp, unread count
- Sort: most recent message first
- Tap conversation → navigate to message thread

**T121: Message thread screen**

- FlatList with inverted layout (newest at bottom)
- Message bubbles: sender (right, blue), recipient (left, gray)
- Input: TextInput with send button, emoji picker
- Auto-scroll to bottom on new message

**T122: Unread message count badge**

- Query: `SELECT COUNT(*) FROM messages WHERE recipient_id = auth.uid() AND read_at IS NULL`
- Display: badge on conversations tab icon
- Update in real-time via Realtime subscription

**T123: Message search**

- Search input: filter messages by content
- Full-text search: use PostgreSQL trigram similarity
- Highlight matching text in results

### Scheduled Check-Ins (T124-T128)

**T124: Check-in schedule configuration**

- Form: frequency (daily, weekly), time (HH:MM), days_of_week (for weekly)
- Store in checkins table: schedule as JSONB
- Example: `{"frequency": "daily", "time": "20:00", "timezone": "America/New_York"}`

**T125: Check-in prompt templates**

- Pre-defined prompts: "How are you feeling today?", "Any challenges this week?", "Rate your recovery (1-10)"
- Custom prompts: user can create own (200 char max)
- Store in checkins.prompt_template

**T126: Check-in notification Edge Function**

- Cron job: run every 5 minutes
- Query checkins where next_scheduled <= NOW()
- Send push notification with prompt text
- Deep link: opens check-in response screen

**T127: Check-in response screen**

- Display: prompt text from checkin
- Input: multiline text (500 char max)
- Submit: insert into checkin_responses, mark checkin as completed
- Notify sponsor: "[Sponsee] completed their check-in"

**T128: Check-in sentiment analysis**

- Simple keyword-based sentiment: positive (great, good), neutral, negative (struggling, difficult)
- Store sentiment in checkin_responses.sentiment
- Dashboard: trend chart of sentiment over time

### Offline & Performance (T129)

**T129: Offline message queueing**

- Queue unsent messages in AsyncStorage: `messageQueue:${connectionId}`
- Retry on reconnect: process queue sequentially
- Show pending indicator: single checkmark → double checkmark on send

## Test Strategy

**Unit Tests**:

- Message delivery: verify optimistic UI and rollback on error
- Typing indicators: verify broadcast and 3-second timeout
- Sentiment analysis: verify keyword matching

**Integration Tests**:

- Realtime subscription: verify messages appear in recipient's UI
- Check-in scheduling: verify cron job triggers at correct times
- Offline queue: verify messages send on reconnect

**E2E Tests** (Detox):

- Send message → verify recipient receives in < 5s (3G simulation)
- Schedule check-in → verify notification triggers
- Offline send → reconnect → verify message delivers

## Risks & Mitigations

**Risk**: Realtime subscription disconnects frequently on poor networks

- **Mitigation**: Auto-reconnect with exponential backoff, polling fallback every 30s

**Risk**: Check-in notifications delayed beyond 2-minute window

- **Mitigation**: Run cron every 5 minutes, monitor execution time

**Risk**: Message queue grows unbounded when offline for days

- **Mitigation**: Limit queue to 100 messages, show warning at 50

## Definition of Done Checklist

- [ ] All 16 subtasks (T114-T129) completed
- [ ] Messages deliver in < 5 seconds
- [ ] Realtime updates functional with typing indicators
- [ ] Read receipts and delivery confirmations work
- [ ] Scheduled check-ins trigger notifications
- [ ] Check-in responses stored with sentiment
- [ ] Offline message queue syncs on reconnect
- [ ] Constitution compliance: performance, offline-first

## Review Guidance

**Key Review Points**:

- Realtime subscription reliability tested on poor networks
- Message delivery time measured under 3G conditions
- Check-in cron job execution time monitored
- Offline queue handles edge cases (app kill, network errors)

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T20:17:31Z – claude – shell_pid=15009 – lane=doing – Started implementation of Messaging & Structured Check-ins
