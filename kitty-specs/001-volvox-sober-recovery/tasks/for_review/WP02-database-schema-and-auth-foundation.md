---
work_package_id: 'WP02'
subtasks:
  - 'T014'
  - 'T015'
  - 'T016'
  - 'T017'
  - 'T018'
  - 'T019'
  - 'T020'
  - 'T021'
  - 'T022'
  - 'T023'
  - 'T024'
  - 'T025'
  - 'T026'
  - 'T027'
  - 'T028'
  - 'T029'
  - 'T030'
  - 'T031'
  - 'T032'
  - 'T033'
  - 'T034'
  - 'T035'
  - 'T036'
  - 'T037'
  - 'T038'
  - 'T039'
  - 'T040'
  - 'T041'
  - 'T042'
  - 'T043'
  - 'T044'
title: 'Database Schema & Authentication Foundation'
phase: 'Phase 0 - Foundation'
lane: "for_review"
assignee: ''
agent: "claude"
shell_pid: "63241"
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
---

# Work Package Prompt: WP02 – Database Schema & Authentication Foundation

## Objectives & Success Criteria

**Primary Objective**: Implement complete PostgreSQL database schema with Row Level Security policies and Supabase Auth integration.

**Success Criteria**:

- All migrations apply successfully (`supabase db push`)
- All 15+ entities created per data-model.md specification
- RLS policies enforce multi-tenant data isolation (automated tests verify unauthorized access blocked)
- Database triggers maintain referential integrity (capacity tracking, timestamps)
- Indexes optimize query performance for matching and messaging
- Users can signup, login, logout via Supabase Auth
- JWT tokens stored securely in AsyncStorage with encryption

## Context & Constraints

**Related Documents**:

- Constitution: Security & Privacy (FR-059 to FR-062), Test-First Development (100% security paths coverage)
- Data Model: `kitty-specs/001-volvox-sober-recovery/data-model.md` (complete schema specification)
- Contracts: `kitty-specs/001-volvox-sober-recovery/contracts/auth.yaml` (authentication API)

**Security Requirements**:

- Enable RLS on ALL tables immediately after creation
- Use `auth.uid()` in RLS policies to reference authenticated user
- Private relapse notes MUST be filtered from sponsors (RLS + application layer)
- Password management handled exclusively by Supabase Auth (never stored in app)

## Subtasks & Detailed Guidance

### Database Migrations (T014-T020)

Follow data-model.md exactly. Create migrations in order:

- **T014**: users table (id, email, role, profile fields, timestamps)
- **T015**: sponsor_profiles, sponsee_profiles (user_id FK, preferences, capacity)
- **T016**: sobriety_dates (GENERATED columns for streak/milestones), relapses
- **T017**: connection_requests (status enum), connections (sponsor_id, sponsee_id), matches (cached algorithm results)
- **T018**: steps (reference data, pre-seeded), step_work (JSONB responses/comments)
- **T019**: messages (connection_id FK), checkins (recurrence schedule), checkin_responses
- **T020**: notifications (notification_type enum, related_entity polymorphic reference)

**Migration Pattern**:

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) NOT NULL UNIQUE,
  role enum('sponsor', 'sponsee', 'both') NOT NULL,
  -- ... other columns
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### RLS Policies (T021-T026)

**Pattern**: Each table needs SELECT, INSERT, UPDATE, DELETE policies where appropriate.

**Example** (users table):

```sql
-- Users view own profile
CREATE POLICY "Users view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Connected users view each other
CREATE POLICY "Connected users view profiles" ON users
  FOR SELECT USING (
    id IN (
      SELECT sponsor_id FROM connections WHERE sponsee_id = auth.uid()
      UNION
      SELECT sponsee_id FROM connections WHERE sponsor_id = auth.uid()
    )
  );
```

**Critical Policies**:

- Sobriety dates: Mutual visibility between connected users (T022)
- Relapses: Sponsors see dates but NOT private_note (T022)
- Step work: Only connected sponsors can view/comment (T024)
- Messages: Only sender and recipient can view (T025)

### Database Triggers (T027-T030)

- **T027**: `update_updated_at_column()` - auto-update timestamps on all tables
- **T028**: `notify_new_message()` - PostgreSQL NOTIFY for Realtime subscriptions
- **T029**: `update_connection_last_contact()` - track communication stats
- **T030**: `update_sponsor_capacity()` - increment/decrement on connection changes

### Indexes (T031-T037)

**Critical for Performance**:

- users.email (login), users.location GIST (geographic matching)
- sponsor_profiles.capacity (availability filtering)
- connections.sponsor_id, connections.sponsee_id (dashboard queries)
- messages.connection_id, messages.recipient_id (unread counts)

### Seed Data (T038)

Pre-populate steps table with 12 AA steps and default questions (see data-model.md for reference data).

### Mobile Auth Integration (T039-T043)

- **T039**: Supabase client in `mobile/src/services/supabase.ts`
- **T040**: Redux store setup with RTK Query base
- **T041**: Auth API slice (signup, login, logout, resetPassword)
- **T042**: Auth screens (Login, Signup, EmailVerification, PasswordReset)
- **T043**: Secure token storage (AsyncStorage with react-native-encrypted-storage)

### RLS Policy Tests (T044)

Automated tests attempting unauthorized access:

```javascript
// Example: Sponsee should NOT see another sponsee's step work
const { data, error } = await supabase
  .from('step_work')
  .select('*')
  .eq('sponsee_id', otherSponseeId)
  .single();

expect(error).toBeDefined();
expect(error.message).toContain('row-level security');
```

## Test Strategy

**Integration Tests** (Constitution requirement: 100% security paths):

- RLS policy tests for all tables (T044)
- Test unauthorized access scenarios for each entity
- Verify mutual visibility works for connected users
- Confirm sponsors cannot see private relapse notes

**Test Location**: `supabase/tests/rls-policies.test.js`
**Run Command**: `supabase test db`

## Risks & Mitigations

**Risk**: RLS policy bugs allowing data leaks

- **Mitigation**: Automated tests for every policy, manual security audit

**Risk**: Migration conflicts or schema drift

- **Mitigation**: Apply migrations sequentially, use Supabase CLI version control

**Risk**: Performance degradation with complex RLS policies

- **Mitigation**: Heavy indexing on foreign keys, EXPLAIN ANALYZE on slow queries

## Definition of Done Checklist

- [ ] All 31 subtasks (T014-T044) completed
- [ ] All migrations apply successfully (`supabase db push`)
- [ ] RLS policies pass automated security tests (T044)
- [ ] Database triggers tested and verified
- [ ] Users can signup and login via mobile app
- [ ] Constitution compliance: 100% security path coverage
- [ ] `tasks.md` updated: WP02 marked complete

## Review Guidance

**Key Review Points**:

- Schema matches data-model.md exactly (all tables, columns, constraints)
- RLS policies enforce multi-tenant isolation correctly
- Indexes cover all high-frequency queries
- Triggers maintain data integrity (capacity, timestamps)
- Auth screens follow React Native Paper design system

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T00:20:06Z – claude – shell_pid=63241 – lane=doing – Started WP02 implementation: Database schema and authentication foundation
- 2025-11-04T00:25:16Z – claude – shell_pid=63241 – lane=for_review – WP02 complete: All 31 subtasks implemented. Created comprehensive RLS test suite (18 tests) ensuring 100% security coverage per constitution requirements. Database schema, auth integration, and security policies fully implemented and documented.
