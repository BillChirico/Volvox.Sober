---
work_package_id: "WP07"
subtasks:
  - "T034"
  - "T035"
  - "T036"
  - "T037"
  - "T038"
  - "T039"
title: "Messaging & Check-Ins"
phase: "Phase 2 - Core Features"
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

# Work Package Prompt: WP07 – Messaging & Check-Ins

## Objectives & Success Criteria

**Goal**: In-app messaging with Supabase Realtime + structured check-ins with notifications

**Success Criteria**:
- Messages delivered within 5 seconds under normal network
- Read receipts update in real-time
- Check-ins fire at scheduled time (±2 minute window)
- Sponsees can respond to check-ins from push notification

## Context & Constraints

**Prerequisites**: WP04 (connections), WP01 (FCM notifications)

**Key Docs**: [data-model.md](../../data-model.md#6-message) - Message, CheckIn, CheckInResponse

**Architecture**: Supabase Realtime for messaging, pg_cron for scheduled check-ins

**Constraints**:
- Realtime connection limits (500 concurrent on Pro tier)
- Check-in notifications must respect user timezones
- Message history may grow large (implement pagination)

## Subtasks

### T034 – Create Message, CheckIn, CheckInResponse tables

**Schema**:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT CHECK (length(text) <= 2000) NOT NULL,

  read_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_connection_id ON messages(connection_id, created_at DESC);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;

CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  recurrence TEXT CHECK (recurrence IN ('daily', 'weekly', 'custom')) NOT NULL,
  custom_interval_days INTEGER,
  scheduled_time TIME NOT NULL,
  timezone TEXT NOT NULL,

  questions TEXT[] NOT NULL,

  is_active BOOLEAN DEFAULT TRUE,
  next_scheduled_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE check_in_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  scheduled_for TIMESTAMPTZ NOT NULL,
  response_status TEXT CHECK (response_status IN ('completed', 'missed')) NOT NULL,
  responses JSONB DEFAULT '[]'
);

-- Trigger to update connection message stats
CREATE OR REPLACE FUNCTION update_connection_message_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE connections SET
    first_message_at = COALESCE(first_message_at, NOW()),
    last_message_at = NOW(),
    total_messages = total_messages + 1
  WHERE id = NEW.connection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_connection_message_stats();
```

### T035 – Build messaging UI with conversation threads

**UI Components**:
- ConversationListScreen (all connections with unread counts)
- ConversationScreen (chat interface with FlatList)
- Message bubbles (sender vs recipient styling)
- Input bar (text input + send button)
- Read receipts (checkmarks)

**FlatList Optimization**:
```typescript
export const ConversationScreen = ({ connectionId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [connectionId])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: false })
      .limit(50) // Pagination: load 50 at a time

    if (error) throw error
    setMessages(data.reverse())
    setLoading(false)
  }

  const sendMessage = async (text: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        connection_id: connectionId,
        sender_id: currentUserId,
        recipient_id: recipientId,
        text
      })
      .single()

    if (error) throw error

    // Optimistic update
    setMessages(prev => [...prev, data])
  }

  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
      keyExtractor={item => item.id}
      inverted
      onEndReached={loadMoreMessages}
      onEndReachedThreshold={0.5}
    />
  )
}
```

**Parallel**: Can develop parallel to T037

### T036 – Implement Supabase Realtime subscription

**Client Setup**:
```typescript
export const subscribeToMessages = (connectionId: string, callback: (message: Message) => void) => {
  return supabase
    .channel(`messages:${connectionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `connection_id=eq.${connectionId}`
    }, (payload) => {
      callback(payload.new as Message)
    })
    .subscribe()
}

export const subscribeToReadReceipts = (connectionId: string, callback: (messageId: string) => void) => {
  return supabase
    .channel(`read-receipts:${connectionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `connection_id=eq.${connectionId}`
    }, (payload) => {
      if (payload.new.read_at && !payload.old.read_at) {
        callback(payload.new.id)
      }
    })
    .subscribe()
}
```

**UI Integration**:
```typescript
useEffect(() => {
  const subscription = subscribeToMessages(connectionId, (newMessage) => {
    setMessages(prev => [...prev, newMessage])

    // Mark as read if on screen
    if (isScreenFocused) {
      markMessageAsRead(newMessage.id)
    }
  })

  return () => subscription.unsubscribe()
}, [connectionId])
```

### T037 – Create check-in scheduling screen

**UI** (Sponsor only):
- Recurrence selector (daily, weekly, custom)
- Time picker (local timezone)
- Question builder (add/edit/remove questions)
- Active/paused toggle
- Preview of next scheduled check-in

**Service**:
```typescript
export const createCheckIn = async (params: {
  connectionId: string
  recurrence: 'daily' | 'weekly' | 'custom'
  customIntervalDays?: number
  scheduledTime: string // HH:MM:SS
  timezone: string
  questions: string[]
}) => {
  const nextScheduled = calculateNextScheduledTime(params)

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      ...params,
      next_scheduled_at: nextScheduled
    })
    .single()

  if (error) throw error
  return data
}

const calculateNextScheduledTime = (params) => {
  const now = new Date()
  const scheduledTime = parseTime(params.scheduledTime)
  const nextDate = addDays(now, params.recurrence === 'daily' ? 1 : params.customIntervalDays || 7)
  return setTime(nextDate, scheduledTime)
}
```

**Parallel**: Can develop parallel to T035

### T038 – Build check-in response UI for sponsees

**Flow**:
1. Push notification at scheduled time
2. Tap notification → opens RespondCheckInScreen
3. Answer each question in form
4. Submit responses

**UI Components**:
- CheckInNotificationHandler (deep link navigation)
- RespondCheckInScreen (form with questions)
- QuestionInput (text areas for each question)
- Submit button

**Service**:
```typescript
export const submitCheckInResponse = async (params: {
  checkInId: string
  connectionId: string
  scheduledFor: string
  responses: { question: string, answer: string }[]
}) => {
  const { data, error } = await supabase
    .from('check_in_responses')
    .insert({
      check_in_id: params.checkInId,
      connection_id: params.connectionId,
      scheduled_for: params.scheduledFor,
      response_status: 'completed',
      responses: params.responses
    })
    .single()

  if (error) throw error

  // Trigger notifies sponsor automatically
  return data
}
```

### T039 – Implement check-in completion tracking

**Edge Function** (triggered by pg_cron):
```typescript
// supabase/functions/send-check-ins/index.ts
serve(async (req) => {
  const supabase = createClient(...)

  // Get all check-ins due in the next 5 minutes
  const now = new Date()
  const fiveMinutesFromNow = addMinutes(now, 5)

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*, connection:connections(sponsee_id)')
    .eq('is_active', true)
    .gte('next_scheduled_at', now.toISOString())
    .lte('next_scheduled_at', fiveMinutesFromNow.toISOString())

  for (const checkIn of checkIns) {
    // Send push notification to sponsee
    await invokeSendNotification({
      userId: checkIn.connection.sponsee_id,
      title: 'Daily Check-In',
      body: 'Time for your check-in!',
      data: {
        type: 'check_in',
        checkInId: checkIn.id,
        deepLink: `volvox://check-in/${checkIn.id}`
      }
    })

    // Update next_scheduled_at
    const nextScheduled = calculateNextScheduledTime(checkIn)
    await supabase
      .from('check_ins')
      .update({ next_scheduled_at: nextScheduled })
      .eq('id', checkIn.id)
  }

  // Check for missed check-ins (>24 hours overdue)
  const oneDayAgo = subDays(now, 1)
  const { data: overdueCheckIns } = await supabase
    .from('check_ins')
    .select('*, connection:connections(sponsor_id, sponsee_id)')
    .eq('is_active', true)
    .lt('next_scheduled_at', oneDayAgo.toISOString())

  for (const checkIn of overdueCheckIns) {
    // Log missed check-in
    await supabase
      .from('check_in_responses')
      .insert({
        check_in_id: checkIn.id,
        connection_id: checkIn.connection_id,
        scheduled_for: checkIn.next_scheduled_at,
        response_status: 'missed',
        responses: []
      })

    // Notify sponsor after 3 consecutive misses
    const { count: missedCount } = await supabase
      .from('check_in_responses')
      .select('*', { count: 'exact', head: true })
      .eq('check_in_id', checkIn.id)
      .eq('response_status', 'missed')
      .order('created_at', { ascending: false })
      .limit(3)

    if (missedCount >= 3) {
      await invokeSendNotification({
        userId: checkIn.connection.sponsor_id,
        title: 'Sponsee Check-In Alert',
        body: 'Your sponsee has missed 3 check-ins'
      })
    }
  }

  return new Response('OK', { status: 200 })
})
```

**Cron Setup**:
```sql
-- Run every 5 minutes
SELECT cron.schedule('send-check-ins', '*/5 * * * *', $$
  SELECT net.http_post(
    url := 'https://[project-id].functions.supabase.co/send-check-ins',
    headers := '{"Authorization": "Bearer [anon-key]"}'::jsonb
  );
$$);
```

**Sponsor Dashboard**:
- View check-in response history
- See completion rate per sponsee
- Edit or pause check-ins

## Test Strategy

- Integration: Send message → verify Realtime delivery
- Integration: Schedule check-in → trigger notification → submit response
- E2E: Full conversation flow on two devices
- Performance: Benchmark message loading with 1000+ messages (pagination)

## Risks & Mitigations

**Risk**: Realtime connection limits
- Mitigation: Monitor connection counts, plan upgrade at 400+ concurrent
- Fallback: Polling mechanism if Realtime unavailable

**Risk**: Check-in timezone complexity
- Mitigation: Store timezone in check_in table, calculate in user's local time
- Mitigation: Test with multiple timezones

**Risk**: Message history growth
- Mitigation: Implement pagination (50 messages at a time)
- Mitigation: Archive old messages after 90 days of inactivity

## Definition of Done

- [ ] Message, CheckIn, CheckInResponse tables created
- [ ] Messaging UI with FlatList virtualization
- [ ] Realtime subscription for live messages
- [ ] Check-in scheduling screen (sponsor)
- [ ] Check-in response UI (sponsee)
- [ ] Push notifications sent at scheduled times
- [ ] Missed check-in tracking and sponsor alerts
- [ ] Tests pass for messaging and check-in flows

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created

---

**Next**: `/spec-kitty.implement WP07` (parallel with WP05/WP06)
