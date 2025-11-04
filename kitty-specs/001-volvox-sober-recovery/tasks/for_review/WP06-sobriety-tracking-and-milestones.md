---
work_package_id: 'WP06'
subtasks:
  - 'T087'
  - 'T088'
  - 'T089'
  - 'T090'
  - 'T091'
  - 'T092'
  - 'T093'
  - 'T094'
  - 'T095'
  - 'T096'
  - 'T097'
  - 'T098'
title: 'Sobriety Tracking & Milestones'
phase: 'Phase 2 - Core Features'
lane: "for_review"
assignee: ''
agent: "claude"
shell_pid: ""
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
  - timestamp: '2025-11-04T13:24:00Z'
    lane: 'doing'
    agent: 'claude'
    shell_pid: '31202'
    action: 'Starting WP06: Sobriety Tracking & Milestones implementation'
  - timestamp: '2025-11-04T15:30:00Z'
    lane: 'for_review'
    agent: 'claude'
    shell_pid: ''
    action: 'Implementation complete - ready for review'
---

# Work Package Prompt: WP06 – Sobriety Tracking & Milestones

## Objectives & Success Criteria

**Primary Objective**: Implement sobriety date tracking with automatic milestone calculations and relapse management.

**Success Criteria**:

- Users can set sobriety date and view current streak
- GENERATED columns automatically calculate streak days and milestones
- Relapse entry updates sobriety date and preserves history
- Sponsors see sponsee sobriety stats but NOT private relapse notes
- Milestone notifications trigger at 30/60/90/180/365 days
- Offline sobriety stats display from cached data

## Context & Constraints

**Related Documents**:

- User Story: US3 (sobriety tracking) - P2 priority
- Contract: `contracts/sobriety.yaml`
- Constitution: Security (private relapse notes), Test-First Development

**Data Model**:

- sobriety_dates: sobriety_date, streak_days (GENERATED), milestones_achieved (GENERATED)
- relapses: relapse_date, private_note (sponsor cannot see), trigger_context

## Subtasks & Detailed Guidance

### Database & Calculations (T087-T090)

**T087: GENERATED columns for streak calculation**

- Already created in WP02, verify functionality:
  ```sql
  streak_days INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - sobriety_date))
  ) STORED
  ```
- Test: insert sobriety_date, verify streak_days auto-calculated

**T088: Milestones calculation**

- GENERATED column for milestones:
  ```sql
  milestones_achieved TEXT[] GENERATED ALWAYS AS (
    CASE
      WHEN streak_days >= 30 THEN ARRAY['30 days']
      WHEN streak_days >= 60 THEN ARRAY['30 days', '60 days']
      ...
    END
  ) STORED
  ```
- Milestone thresholds: 30, 60, 90, 180, 365 days

**T089: Relapse history tracking**

- Insert into relapses: relapse_date, user_id, private_note, trigger_context
- Update sobriety_dates: set sobriety_date = relapse_date + 1 day
- RLS policy: sponsors see relapse_date but NOT private_note

**T090: Sobriety visibility RLS policies**

- Connected users see each other's sobriety stats:
  ```sql
  CREATE POLICY "Connected users view sobriety" ON sobriety_dates
    FOR SELECT USING (
      user_id IN (
        SELECT sponsor_id FROM connections WHERE sponsee_id = auth.uid()
        UNION
        SELECT sponsee_id FROM connections WHERE sponsor_id = auth.uid()
      )
    );
  ```
- Test: verify unauthorized users cannot view sobriety data

### UI Components (T091-T095)

**T091: Sobriety dashboard**

- Display: current streak (days), next milestone, progress bar
- Celebratory animation on milestone achievement (confetti, badge)
- Historical chart: line graph of streak over time

**T092: Set sobriety date screen**

- Date picker: @react-native-community/datetimepicker
- Validation: date cannot be in future
- Confirmation: "Your sobriety journey starts [date]"

**T093: Relapse entry form**

- Fields: relapse_date (required), private_note (optional 500 char), trigger_context (dropdown)
- Trigger options: stress, social pressure, emotional, physical pain, other
- Privacy notice: "This note is private. Sponsors see date only."
- Confirmation dialog: "Are you sure? This will reset your streak."

**T094: Sponsor view of sponsee sobriety**

- Display: sponsee name, current streak, last milestone achieved
- Relapse history: dates only (no private notes)
- Encouragement prompt: "Send a message of support"

**T095: Milestone celebration modal**

- Auto-display when milestone achieved
- Content: "Congratulations on [X] days sober!"
- Share button: optional share to connected sponsors
- Accessibility: VoiceOver announces achievement

### Notifications & Offline (T096-T098)

**T096: Milestone notification scheduling**

- Edge Function cron job: daily check for users hitting milestones
- Send push notification: "Congratulations on [X] days!"
- Deep link: notification opens sobriety dashboard

**T097: Offline sobriety tracking**

- Cache sobriety_date in AsyncStorage
- Calculate streak locally: `Math.floor((Date.now() - sobrietyDate) / 86400000)`
- Display banner: "Offline - streak calculated locally"
- Sync on reconnect: update with server streak

**T098: Sobriety API slice (RTK Query)**

- Endpoints: getSobrietyStats, updateSobrietyDate, logRelapse
- Cache sobriety stats for 1 hour
- Invalidate on relapse entry

## Test Strategy

**Unit Tests**:

- GENERATED column calculations: verify streak_days and milestones
- Relapse logic: verify sobriety_date updates correctly

**Integration Tests**:

- RLS policies: sponsors see dates but not private notes
- Milestone notifications: verify triggered at correct thresholds

**E2E Tests** (Detox):

- Set sobriety date → verify dashboard displays streak
- Log relapse → verify streak resets, private note hidden from sponsor

## Risks & Mitigations

**Risk**: GENERATED columns don't update in real-time

- **Mitigation**: Test with realistic data, verify calculations on page load

**Risk**: Offline streak calculations drift from server

- **Mitigation**: Sync immediately on reconnect, show discrepancy warning

**Risk**: Milestone notifications delayed by cron job frequency

- **Mitigation**: Run cron every hour, acceptable 1-hour delay

## Definition of Done Checklist

- [ ] All 12 subtasks (T087-T098) completed
- [ ] Sobriety streak calculates correctly
- [ ] Relapse entry resets streak and preserves history
- [ ] Sponsors cannot see private relapse notes (RLS enforced)
- [ ] Milestone notifications trigger at correct thresholds
- [ ] Offline tracking works with AsyncStorage caching
- [ ] Constitution compliance: security, test-first

## Review Guidance

**Key Review Points**:

- GENERATED columns tested with various sobriety dates
- RLS policies validated: unauthorized access blocked
- Milestone celebration UX is encouraging and accessible
- Offline calculations match server calculations

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T13:24:00Z – claude – shell_pid=31202 – lane=doing – Starting WP06: Sobriety Tracking & Milestones implementation
