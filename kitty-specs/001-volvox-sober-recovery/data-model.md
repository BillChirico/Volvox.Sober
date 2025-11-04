# Data Model: Volvox.Sober

**Feature**: Volvox.Sober Recovery Platform
**Branch**: 001-volvox-sober-recovery
**Date**: 2025-11-03

## Overview

This document defines all entities, relationships, and data structures for Volvox.Sober. The model is designed for PostgreSQL via Supabase with Row Level Security (RLS) for privacy.

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       ├─────────────┐ N
       │ sobriety_   │
       │ dates       │
       ▼             │
┌──────────────┐     │
│ SobrietyDate │     │
└──────┬───────┘     │
       │ 1           │
       │             │
       │ N           │
       ▼             │
┌──────────────┐     │
│   Relapse    │     │
└──────────────┘     │
                     │
       ┌─────────────┘
       │
       │ N (as sponsee)
       ▼
┌────────────────────┐
│ ConnectionRequest  │
└─────────┬──────────┘
          │ 1
          │
          │ 1
          ▼
┌────────────────────┐      ┌────────────┐
│    Connection      │──N───│  Message   │
└─────────┬──────────┘      └────────────┘
          │
          │ 1
          │
          ├──────N────┐
          │           │
          ▼           ▼
    ┌──────────┐  ┌─────────────────┐
    │ CheckIn  │  │   StepWork      │
    └────┬─────┘  └────────┬────────┘
         │ 1               │ N
         │                 │
         │ N               │ 1
         ▼                 ▼
┌──────────────────┐  ┌──────────┐
│ CheckInResponse  │  │   Step   │
└──────────────────┘  └──────────┘
```

---

## Core Entities

### 1. User

**Purpose**: Represents all registered users (both sponsors and sponsees).

**Attributes**:
```typescript
interface User {
  id: string; // UUID, primary key
  created_at: timestamp;
  updated_at: timestamp;

  // Auth (managed by Supabase Auth)
  email: string; // unique, indexed

  // Profile
  name: string;
  bio: string | null; // max 1000 chars
  profile_photo_url: string | null;

  // Demographics
  age: number;
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  city: string | null;
  state: string | null;
  country: string;
  latitude: number | null; // for distance calculations
  longitude: number | null;

  // Roles
  is_sponsor: boolean; // can be both sponsor and sponsee
  is_sponsee: boolean;

  // Sponsor-specific
  max_sponsees: number | null; // 1-10, only if is_sponsor
  current_sponsee_count: number; // denormalized for quick capacity checks
  communication_preferences: {
    in_app_only: boolean;
    phone_enabled: boolean;
    video_enabled: boolean;
    phone_number: string | null;
  } | null;
  availability_status: 'active' | 'on_hiatus'; // sponsor status

  // Sponsee-specific
  current_step: number | null; // 1-12, highest completed step

  // Matching preferences
  preferred_sponsor_gender: 'male' | 'female' | 'non_binary' | 'no_preference' | null;
  preferred_sponsor_age_min: number | null;
  preferred_sponsor_age_max: number | null;
  preferred_sponsor_sobriety_min_days: number | null;

  // System
  fcm_token: string | null; // Firebase Cloud Messaging token
  theme_preference: 'light' | 'dark' | 'system';
  notification_settings: {
    messages: boolean;
    check_ins: boolean;
    milestones: boolean;
    connection_requests: boolean;
  };

  // Full-text search (generated column)
  bio_search: tsvector; // GENERATED ALWAYS AS (to_tsvector('english', coalesce(bio, '')))
}
```

**Indexes**:
- `idx_users_email` (unique)
- `idx_users_is_sponsor` (for sponsor queries)
- `idx_users_bio_search` (GIN index for full-text search)
- `idx_users_location` (for geographic matching)

**RLS Policies**:
- Users can read their own profile (full access)
- Users can read profiles of their connections (sponsor/sponsee relationships)
- Sponsors can read profiles of users who sent connection requests
- Public profiles visible during matching (limited fields only)

---

### 2. SobrietyDate

**Purpose**: Tracks a user's sobriety journey for a specific substance.

**Attributes**:
```typescript
interface SobrietyDate {
  id: string; // UUID, primary key
  user_id: string; // foreign key to User
  created_at: timestamp;
  updated_at: timestamp;

  // Sobriety tracking
  substance_type: 'alcohol' | 'drugs' | 'gambling' | 'other';
  substance_name: string | null; // e.g., "cocaine", "marijuana"
  sobriety_start_date: date; // when user became sober

  // Computed fields (updated via triggers)
  current_streak_days: number; // days since sobriety_start_date or last relapse
  longest_streak_days: number; // historical best streak
  total_relapses: number; // count of associated relapses

  // Milestones (denormalized for quick access)
  milestones_achieved: number[]; // e.g., [30, 60, 90, 180, 365]
  next_milestone_date: date | null; // calculated
  next_milestone_days: number | null; // e.g., 90, 180, 365
}
```

**Relationships**:
- Many-to-one with User (user_id)
- One-to-many with Relapse

**State Transitions**: None (continuous tracking)

---

### 3. Relapse

**Purpose**: Logs a slip/relapse event in a user's sobriety journey.

**Attributes**:
```typescript
interface Relapse {
  id: string; // UUID, primary key
  sobriety_date_id: string; // foreign key to SobrietyDate
  created_at: timestamp;

  // Relapse details
  relapse_date: date; // when relapse occurred
  private_note: string | null; // max 1000 chars, only visible to user

  // System flags
  sponsor_notified: boolean; // whether sponsor was alerted
}
```

**Triggers**:
- On insert: Update SobrietyDate.current_streak_days, SobrietyDate.total_relapses
- On insert: Send notification to connected sponsor(s)

---

### 4. ConnectionRequest

**Purpose**: Represents a sponsee's request to connect with a sponsor.

**Attributes**:
```typescript
interface ConnectionRequest {
  id: string; // UUID, primary key
  created_at: timestamp;
  updated_at: timestamp;

  // Participants
  sponsee_id: string; // foreign key to User
  sponsor_id: string; // foreign key to User

  // Request details
  introduction_message: string | null; // max 500 chars
  compatibility_score: number; // 0-100, from matching algorithm
  compatibility_reasons: string[]; // e.g., ["Similar timeline", "Nearby location"]

  // Status
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  response_message: string | null; // optional decline explanation
  responded_at: timestamp | null;
  expires_at: timestamp; // auto-decline after 7 days
}
```

**State Machine**:
```
pending → accepted (creates Connection)
pending → declined (sponsee can request others)
pending → expired (after 7 days)
```

**Triggers**:
- On insert: Send notification to sponsor
- On update (accepted): Create Connection record
- On update (accepted): Increment sponsor's current_sponsee_count
- On update (declined/expired): Send notification to sponsee

---

### 5. Connection

**Purpose**: Active sponsor-sponsee relationship.

**Attributes**:
```typescript
interface Connection {
  id: string; // UUID, primary key
  created_at: timestamp;
  updated_at: timestamp;

  // Participants
  sponsor_id: string; // foreign key to User
  sponsee_id: string; // foreign key to User
  connection_request_id: string; // foreign key to ConnectionRequest (audit trail)

  // Relationship status
  status: 'active' | 'on_hiatus' | 'disconnected';
  disconnected_at: timestamp | null;
  disconnection_reason: string | null; // private note
  disconnected_by: string | null; // user_id who initiated disconnect

  // Activity metrics (denormalized)
  first_message_at: timestamp | null;
  last_message_at: timestamp | null;
  total_messages: number;
  check_in_completion_rate: number; // percentage
}
```

**State Machine**:
```
active → on_hiatus (temporary pause)
active → disconnected (permanent end)
on_hiatus → active (resume)
on_hiatus → disconnected
```

**Triggers**:
- On update (disconnected): Archive messages (90-day retention)
- On update (disconnected): Decrement sponsor's current_sponsee_count
- On update (disconnected): Send notifications to both parties

---

### 6. Message

**Purpose**: In-app text communication between sponsor and sponsee.

**Attributes**:
```typescript
interface Message {
  id: string; // UUID, primary key
  connection_id: string; // foreign key to Connection
  created_at: timestamp;

  // Message details
  sender_id: string; // foreign key to User
  recipient_id: string; // foreign key to User
  text: string; // max 2000 chars

  // Status
  read_at: timestamp | null;

  // System
  archived: boolean; // true after connection disconnected for 90 days
}
```

**Indexes**:
- `idx_messages_connection_id` (for conversation queries)
- `idx_messages_recipient_unread` (for unread count)

**RLS Policies**:
- Users can only read/write messages in their own connections

---

### 7. Step

**Purpose**: Defines the 12 AA steps with default questions.

**Attributes**:
```typescript
interface Step {
  id: string; // UUID, primary key
  step_number: number; // 1-12, unique
  title: string; // e.g., "Step 1: Powerlessness"
  description: string; // full step text from AA literature

  // Default questions (array of strings)
  default_questions: string[]; // e.g., ["What does powerlessness mean to you?", ...]
}
```

**Notes**: This is a seed table with 12 static records. Not user-editable.

---

### 8. StepWork

**Purpose**: A sponsee's responses to step questions, with sponsor guidance.

**Attributes**:
```typescript
interface StepWork {
  id: string; // UUID, primary key
  created_at: timestamp;
  updated_at: timestamp;

  // Ownership
  sponsee_id: string; // foreign key to User
  sponsor_id: string; // foreign key to User (current sponsor guiding this work)
  step_id: string; // foreign key to Step
  connection_id: string; // foreign key to Connection

  // Status
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: timestamp | null;
  completed_at: timestamp | null;

  // Content
  responses: {
    question_id: string; // UUID for each question
    question_text: string; // original or sponsor-edited question
    answer: string | null; // sponsee's response
    sponsor_comments: string | null; // sponsor feedback on this answer
    last_updated_at: timestamp;
  }[];

  // Customization
  custom_questions: {
    question_id: string; // UUID
    question_text: string; // sponsor-added question
    answer: string | null;
    sponsor_comments: string | null;
  }[];
}
```

**Triggers**:
- On update (completed): Send notification to both sponsor and sponsee
- On update (completed): Update User.current_step if this is the highest step

---

### 9. CheckIn

**Purpose**: Recurring scheduled check-in prompts created by sponsors.

**Attributes**:
```typescript
interface CheckIn {
  id: string; // UUID, primary key
  connection_id: string; // foreign key to Connection
  created_at: timestamp;
  updated_at: timestamp;

  // Schedule
  recurrence: 'daily' | 'weekly' | 'custom';
  custom_interval_days: number | null; // if recurrence = 'custom'
  scheduled_time: time; // e.g., "09:00:00"
  timezone: string; // IANA timezone, e.g., "America/New_York"

  // Questions
  questions: string[]; // e.g., ["How are you feeling today?", "Any cravings?"]

  // Status
  is_active: boolean; // can be paused
  next_scheduled_at: timestamp; // calculated
}
```

**Triggers**:
- pg_cron calls Edge Function daily to check for due check-ins
- Edge Function sends push notifications to sponsees

---

### 10. CheckInResponse

**Purpose**: A sponsee's response to a scheduled check-in.

**Attributes**:
```typescript
interface CheckInResponse {
  id: string; // UUID, primary key
  check_in_id: string; // foreign key to CheckIn
  connection_id: string; // foreign key to Connection
  created_at: timestamp;

  // Response
  scheduled_for: timestamp; // when check-in was due
  response_status: 'completed' | 'missed';
  responses: {
    question: string;
    answer: string | null;
  }[];
}
```

**Triggers**:
- On insert (completed): Send notification to sponsor
- After 3 missed check-ins: Send inactivity alert to sponsor

---

### 11. Notification

**Purpose**: System-generated alerts for users.

**Attributes**:
```typescript
interface Notification {
  id: string; // UUID, primary key
  user_id: string; // foreign key to User (recipient)
  created_at: timestamp;

  // Notification details
  type: 'connection_request' | 'request_accepted' | 'request_declined' |
        'new_message' | 'check_in_reminder' | 'milestone_celebration' |
        'relapse_alert' | 'inactivity_warning';
  title: string;
  body: string;

  // Related entities
  related_entity_type: 'connection_request' | 'connection' | 'message' | 'sobriety_date' | null;
  related_entity_id: string | null; // UUID of related entity

  // Status
  read_at: timestamp | null;
  action_taken: boolean; // e.g., tapped notification and navigated to screen

  // Deep linking
  deep_link_url: string; // e.g., "volvox://connection/abc-123"
}
```

**RLS Policies**:
- Users can only read their own notifications

---

### 12. Match

**Purpose**: Computed sponsor-sponsee compatibility pairings (materialized view).

**Attributes**:
```typescript
interface Match {
  id: string; // UUID, primary key (for view)
  sponsee_id: string; // foreign key to User
  sponsor_id: string; // foreign key to User

  // Compatibility
  compatibility_score: number; // 0-100
  compatibility_breakdown: {
    bio_relevance: number; // 0-1
    geographic_proximity: number; // 0-1
    demographic_match: number; // 0-1
    availability_match: number; // 0-1
  };
  compatibility_reasons: string[]; // human-readable explanations

  // Computed at
  calculated_at: timestamp;

  // Status
  viewed_by_sponsee: boolean;
  connection_requested: boolean;
}
```

**Notes**: This is a **materialized view** refreshed hourly or when user profiles update. Not a persistent table.

**Matching Query** (SQL):
```sql
CREATE MATERIALIZED VIEW matches AS
SELECT
  s.id AS sponsee_id,
  sp.id AS sponsor_id,
  (
    0.3 * ts_rank(sp.bio_search, to_tsquery('english', s.bio)) +
    0.2 * similarity(sp.bio, s.bio) +
    0.2 * (1.0 - LEAST(earth_distance(ll_to_earth(sp.latitude, sp.longitude),
                                       ll_to_earth(s.latitude, s.longitude)) / 160934.0, 1.0)) +
    0.15 * CASE WHEN sp.gender = s.preferred_sponsor_gender OR s.preferred_sponsor_gender = 'no_preference'
                THEN 1.0 ELSE 0.0 END +
    0.15 * CASE WHEN sp.current_sponsee_count < sp.max_sponsees THEN 1.0 ELSE 0.0 END
  ) * 100 AS compatibility_score
FROM users s
CROSS JOIN users sp
WHERE s.is_sponsee = true
  AND sp.is_sponsor = true
  AND sp.availability_status = 'active'
  AND sp.current_sponsee_count < sp.max_sponsees
ORDER BY compatibility_score DESC;
```

---

## Relationships Summary

| Entity | Relationship | Entity | Cardinality |
|--------|--------------|--------|-------------|
| User | has | SobrietyDate | 1:N |
| SobrietyDate | has | Relapse | 1:N |
| User (sponsee) | sends | ConnectionRequest | 1:N |
| User (sponsor) | receives | ConnectionRequest | 1:N |
| ConnectionRequest | creates | Connection | 1:1 (when accepted) |
| Connection | has | Message | 1:N |
| Connection | has | CheckIn | 1:N |
| CheckIn | has | CheckInResponse | 1:N |
| Connection | has | StepWork | 1:N |
| StepWork | references | Step | N:1 |
| User | receives | Notification | 1:N |

---

## Data Integrity Rules

### Constraints
1. **Sponsor capacity**: `current_sponsee_count ≤ max_sponsees` (enforced by trigger)
2. **Connection uniqueness**: One active connection per sponsor-sponsee pair (unique constraint)
3. **Step sequence**: Steps 1-12 only (check constraint)
4. **Sobriety date validity**: `sobriety_start_date ≤ current_date` (check constraint)
5. **Message recipient**: Must be part of the connection (foreign key constraint)

### Cascading Deletes
- User deleted → Cascade delete all SobrietyDates, ConnectionRequests, Notifications
- Connection deleted → Cascade delete Messages, CheckIns, StepWork (after 90-day archive)
- SobrietyDate deleted → Cascade delete Relapses

---

## Performance Considerations

### Denormalized Fields (for query performance)
- `User.current_sponsee_count` (vs COUNT query on Connections)
- `User.current_step` (vs MAX query on StepWork)
- `SobrietyDate.current_streak_days` (vs date arithmetic)
- `Connection.total_messages` (vs COUNT query on Messages)

### Materialized Views
- `Matches` (refreshed hourly) - Precompute expensive compatibility scoring

### Indexes
- All foreign keys indexed
- Full-text search indexes on `bio_search`
- Composite indexes for common queries:
  - `(connection_id, created_at)` on Messages (conversation history)
  - `(user_id, read_at)` on Notifications (unread count)
  - `(sponsee_id, status)` on ConnectionRequests (pending requests)

---

**Next Step**: Generate database schema SQL and API contracts in `contracts/` directory.
