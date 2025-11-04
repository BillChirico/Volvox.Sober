---
work_package_id: 'WP07'
subtasks:
  - 'T099'
  - 'T100'
  - 'T101'
  - 'T102'
  - 'T103'
  - 'T104'
  - 'T105'
  - 'T106'
  - 'T107'
  - 'T108'
  - 'T109'
  - 'T110'
  - 'T111'
  - 'T112'
  - 'T113'
title: '12-Step Program Worksheets'
phase: 'Phase 2 - Core Features'
lane: 'planned'
assignee: ''
agent: ''
shell_pid: ''
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
---

# Work Package Prompt: WP07 – 12-Step Program Worksheets

## Objectives & Success Criteria

**Primary Objective**: Implement digital 12-step worksheets with structured questions, JSONB response storage, and sponsor commenting.

**Success Criteria**:

- 12 steps pre-seeded with official AA questions
- Sponsees complete step work with multi-field responses (JSONB)
- Sponsors view and comment on submitted step work
- Step progress tracked (not_started, in_progress, submitted, reviewed)
- Auto-save drafts every 30 seconds to prevent data loss
- Offline step work edits sync when connectivity restored

## Context & Constraints

**Related Documents**:

- User Story: US4 (12-step worksheets) - P2 priority
- Contract: `contracts/steps.yaml`
- Constitution: Security (RLS for connected users only), Offline-First

**Data Model**:

- steps: step_number (1-12), title, description, questions (JSONB array)
- step_work: sponsee_id, step_id, responses (JSONB), sponsor_comments (JSONB), status

## Subtasks & Detailed Guidance

### Step Data & Seeding (T099-T101)

**T099: Seed steps table with AA 12 steps**

- Migration: insert 12 rows with official AA step text
- Questions stored as JSONB:
  ```json
  {
    "questions": [
      { "id": 1, "text": "What does powerlessness mean to you?", "type": "long_text" },
      { "id": 2, "text": "List examples of unmanageability", "type": "bullet_list" }
    ]
  }
  ```
- Reference: Use official AA literature for step questions

**T100: Steps API slice (RTK Query)**

- Endpoints: getAllSteps, getStepWork, saveStepWork, submitStepWork
- Cache steps reference data indefinitely (rarely changes)

**T101: RLS policies for step work**

- Sponsees can CRUD own step work
- Connected sponsors can SELECT and comment on sponsee step work
- Test: verify unauthorized users cannot view step work

### Step Work UI (T102-T107)

**T102: Step list screen**

- Display: 12 steps with progress indicators (not_started, in_progress, submitted, reviewed)
- Tap step → navigate to step work screen
- Visual: progress bar showing X/12 steps completed

**T103: Step work form**

- Dynamic question rendering based on JSONB questions array
- Question types: long_text (multiline), bullet_list (add/remove items), rating (1-5)
- Auto-save: debounce 30s, save to AsyncStorage and server
- "Submit for Review" button: changes status to 'submitted', notifies sponsor

**T104: Step work draft management**

- Save drafts to AsyncStorage: `stepwork:draft:${stepId}`
- Load draft on form mount
- "Discard Draft" button: clear AsyncStorage entry

**T105: Sponsor view of sponsee step work**

- Display: sponsee name, step number, submission date, responses
- Comment box below each question (multiline text input)
- "Mark as Reviewed" button: changes status to 'reviewed', notifies sponsee

**T106: Step work history**

- List all submitted step work with timestamps
- View previous submissions and sponsor comments
- Navigate to current step work from history

**T107: Step work progress tracking**

- Redux slice: `stepWorkSlice` with state for each step's status
- Selectors: `selectStepProgress` (returns array of 12 statuses)
- Dashboard widget: "X/12 steps completed"

### Comments & Notifications (T108-T110)

**T108: Sponsor commenting system**

- JSONB comments structure:
  ```json
  {
    "comments": [
      {
        "question_id": 1,
        "text": "Great insight on powerlessness",
        "timestamp": "2025-01-15T10:30:00Z"
      }
    ]
  }
  ```
- Update step_work.sponsor_comments via JSONB append
- Notify sponsee: "New comment on Step X"

**T109: Step work submission notifications**

- Push notification to sponsor: "[Sponsee] submitted Step X for review"
- Deep link: opens step work detail screen

**T110: Step review notifications**

- Push notification to sponsee: "Your Step X has been reviewed"
- Deep link: opens step work with comments

### Offline & Sync (T111-T113)

**T111: Offline step work editing**

- Save all edits to AsyncStorage immediately
- Queue server sync operations when offline
- Display banner: "Offline - changes saved locally"

**T112: Sync queue implementation**

- Redux slice: `syncQueue` with pending operations
- On reconnect: process queue sequentially (create/update/submit)
- Conflict resolution: server timestamp wins, show diff modal if local changes lost

**T113: Auto-save with debounce**

- Use lodash.debounce(saveStepWork, 30000)
- Show indicator: "Saving..." → "Saved" → "Offline" states
- Prevent data loss on app backgrounding

## Test Strategy

**Unit Tests**:

- JSONB question rendering: verify all question types display correctly
- Auto-save debounce: verify saves after 30s, not before
- Sync queue: verify operations process in order

**Integration Tests**:

- RLS policies: sponsors can view connected sponsees' step work
- Comment storage: verify JSONB appends correctly

**E2E Tests** (Detox):

- Complete step work → submit → sponsor comments → sponsee views comments
- Offline edit → reconnect → verify sync completes

## Risks & Mitigations

**Risk**: JSONB queries slow with large response data

- **Mitigation**: Index on step_work.step_id, limit response size (5000 chars per question)

**Risk**: Auto-save conflicts with manual save

- **Mitigation**: Debounce logic prevents duplicate saves, optimistic UI updates

**Risk**: Sync queue failures lose offline edits

- **Mitigation**: Persist sync queue in AsyncStorage, retry with exponential backoff

## Definition of Done Checklist

- [ ] All 15 subtasks (T099-T113) completed
- [ ] 12 steps seeded with official AA questions
- [ ] Step work form supports all question types
- [ ] Auto-save prevents data loss
- [ ] Sponsors can view and comment on step work
- [ ] Offline editing and sync functional
- [ ] Push notifications for submission/review
- [ ] Constitution compliance: security, offline-first

## Review Guidance

**Key Review Points**:

- JSONB structure is flexible and queryable
- Auto-save UX is clear (saving/saved indicators)
- RLS policies tested: unauthorized access blocked
- Sync queue handles edge cases (app kill, network errors)

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
