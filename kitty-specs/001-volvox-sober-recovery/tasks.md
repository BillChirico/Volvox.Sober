# Implementation Tasks: Volvox.Sober Recovery Platform

**Feature**: Volvox.Sober Recovery Platform
**Branch**: `001-volvox-sober-recovery`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2025-11-03

## Overview

This document breaks down the Volvox.Sober implementation into **8 work packages** (WP01-WP08) derived from the 7 prioritized user stories in spec.md. Each work package contains a cohesive set of subtasks (T001-T045) that can be implemented independently following TDD principles.

**Total Subtasks**: 45 across 8 work packages
**MVP Scope**: WP01-WP03 (Priority P1 user stories)
**Estimated Timeline**: 8-12 weeks for full implementation

---

## Work Package Summary

| ID | Title | Priority | Subtasks | Dependencies | Prompt File |
|----|-------|----------|----------|--------------|-------------|
| WP01 | Project Setup & Infrastructure | P0 | T001-T005 (5) | None | [WP01-project-setup.md](./tasks/planned/WP01-project-setup.md) |
| WP02 | User Authentication & Profiles | P1 | T006-T010 (5) | WP01 | [WP02-auth-profiles.md](./tasks/planned/WP02-auth-profiles.md) |
| WP03 | Sponsor Matching Algorithm | P1 | T011-T015 (5) | WP01, WP02 | [WP03-matching-algorithm.md](./tasks/planned/WP03-matching-algorithm.md) |
| WP04 | Connection Requests Flow | P1 | T016-T021 (6) | WP02, WP03 | [WP04-connection-requests.md](./tasks/planned/WP04-connection-requests.md) |
| WP05 | Sobriety Tracking | P2 | T022-T027 (6) | WP02, WP04 | [WP05-sobriety-tracking.md](./tasks/planned/WP05-sobriety-tracking.md) |
| WP06 | 12-Step Worksheets | P2 | T028-T033 (6) | WP04 | [WP06-step-worksheets.md](./tasks/planned/WP06-step-worksheets.md) |
| WP07 | Messaging & Check-Ins | P2 | T034-T039 (6) | WP04 | [WP07-messaging-checkins.md](./tasks/planned/WP07-messaging-checkins.md) |
| WP08 | Theme & Polish | P3 | T040-T045 (6) | All | [WP08-theme-polish.md](./tasks/planned/WP08-theme-polish.md) |

---

## Phase 0: Setup & Infrastructure (P0)

### WP01: Project Setup & Infrastructure
**Priority**: P0 (Foundational - must complete first)
**Goal**: Establish React Native + Supabase development environment with CI/CD pipeline
**Independent Test**: Run `npm test` and `npm run ios/android` successfully with auth working

**Included Subtasks**:
- [x] T001: Initialize React Native project with TypeScript
- [ ] T002: Configure Supabase local development (migrations, seed data)
- [ ] T003: Set up ESLint, Prettier, Jest configuration
- [ ] T004: Create design system foundation (theme tokens, base components)
- [ ] T005: Configure CI/CD pipeline (GitHub Actions for linting, tests)

**Implementation Sketch**:
1. Initialize React Native 0.73+ with TypeScript template
2. Install and configure Supabase CLI, create initial schema migration
3. Set up linting/formatting rules per constitution
4. Create theme provider with light/dark mode tokens
5. Add GitHub Actions workflow for automated testing

**Parallel Opportunities**: T003 (linting config) can run parallel to T002 (Supabase setup)

**Dependencies**: None (foundational work package)

**Risks**:
- Supabase local development may require Docker troubleshooting
- React Native environment setup varies by platform (iOS/Android)

**Success Criteria**:
- `npm install && npm test` passes with 100% pass rate
- `npm run ios` and `npm run android` launch successfully
- Supabase local instance starts with `supabase start`
- CI pipeline runs on every commit

**Deliverables**:
- `/mobile` directory with React Native project
- `/supabase` directory with migrations and config
- `.github/workflows/ci.yml` for continuous integration

---

## Phase 1: MVP Core (P1 User Stories)

### WP02: User Authentication & Profiles
**Priority**: P1 (Required for all user stories)
**Goal**: Implement Supabase auth with sponsor/sponsee profile creation and editing
**Independent Test**: User can sign up, log in, complete profile, and view their profile screen

**Included Subtasks**:
- [ ] T006: Create User table schema with RLS policies in Supabase
- [ ] T007: Implement auth screens (signup, login, password reset)
- [ ] T008: Build profile onboarding flow (role selection, demographics, preferences)
- [ ] T009: Create profile editing screen with form validation (React Hook Form + Zod)
- [ ] T010: Implement profile photo upload to Supabase Storage

**Implementation Sketch**:
1. Create Supabase migration for `users` table with full schema from data-model.md
2. Add RLS policies: users read own profile, public profiles visible during matching
3. Build auth screens using Supabase Auth (email/password)
4. Create multi-step onboarding wizard (role → demographics → preferences)
5. Implement profile edit form with validation and photo upload

**Parallel Opportunities**: T007 (auth screens) parallel to T006 (database schema)

**Dependencies**: WP01 (requires project setup and Supabase config)

**Risks**:
- RLS policy complexity for multi-role users (both sponsor and sponsee)
- Profile photo upload requires Supabase Storage bucket configuration

**Success Criteria**:
- User can create account, receive email verification, and log in
- Onboarding flow collects all required profile fields per data-model.md
- Profile edit saves successfully and updates display immediately
- Profile photos upload and display correctly

**Deliverables**:
- `supabase/migrations/002_users_table.sql`
- `mobile/src/screens/auth/` (SignupScreen, LoginScreen, OnboardingScreen)
- `mobile/src/screens/profile/` (ProfileScreen, EditProfileScreen)
- `mobile/src/services/auth/` (Supabase auth client wrapper)

---

### WP03: Sponsor Matching Algorithm
**Priority**: P1 (Core of User Story 1)
**Goal**: Implement SQL-based compatibility scoring and match generation for sponsees
**Independent Test**: Sponsee sees 3-5 relevant sponsor matches with compatibility scores and reasons

**Included Subtasks**:
- [ ] T011: Create matching algorithm SQL function with weighted scoring
- [ ] T012: Add full-text search indexes (`bio_search` with ts_vector)
- [ ] T013: Implement geographic distance calculation (PostGIS or earth_distance)
- [ ] T014: Create `matches` materialized view with hourly refresh trigger
- [ ] T015: Build sponsor match list screen with compatibility breakdown UI

**Implementation Sketch**:
1. Write PostgreSQL function for compatibility scoring (bio relevance, distance, demographics, capacity)
2. Add GIN index on `users.bio_search` for full-text search performance
3. Use `earth_distance` for geographic proximity calculation
4. Create materialized view that pre-computes matches, refresh via pg_cron
5. Build React Native screen displaying top 5 matches with scores and reasons

**Parallel Opportunities**: T012 (indexes) and T013 (distance calc) can run parallel

**Dependencies**: WP01 (database), WP02 (user profiles with bio and location data)

**Risks**:
- Matching quality depends on sufficient user data (need seed data for testing)
- Performance degradation if materialized view not refreshed properly

**Success Criteria**:
- Matching query returns results in < 200ms for 1000+ users
- Compatibility scores range from 0-100 with clear reasoning
- Sponsees see diverse matches (not just closest geographically)
- Match list updates when profile preferences change

**Deliverables**:
- `supabase/migrations/003_matching_algorithm.sql`
- `supabase/functions/match-users/` (Edge Function for on-demand matching)
- `mobile/src/screens/matching/MatchListScreen.tsx`
- `mobile/src/services/matching/matchingService.ts`

---

### WP04: Connection Requests Flow
**Priority**: P1 (User Stories 1 & 2)
**Goal**: Implement full connection request lifecycle (send, review, accept/decline, notifications)
**Independent Test**: Sponsee sends request → Sponsor receives notification → Sponsor accepts → Both see active connection

**Included Subtasks**:
- [ ] T016: Create ConnectionRequest and Connection tables with state machines
- [ ] T017: Implement "send connection request" flow with introduction message
- [ ] T018: Build sponsor request queue screen (pending requests with profiles)
- [ ] T019: Create request response actions (accept, decline, message before deciding)
- [ ] T020: Implement Supabase Realtime subscription for request status updates
- [ ] T021: Set up Firebase Cloud Messaging for push notifications

**Implementation Sketch**:
1. Create database schema for `connection_requests` and `connections` tables
2. Build sponsee UI to send request with optional intro message (max 500 chars)
3. Create sponsor inbox showing pending requests with sponsee profiles
4. Implement accept/decline logic with triggers to create Connection record and update sponsor capacity
5. Add Supabase Realtime channel to notify sponsees of request status changes
6. Configure FCM and send push notifications via Supabase Edge Function

**Parallel Opportunities**: T020 (Realtime) and T021 (FCM) can be developed in parallel

**Dependencies**: WP02 (user profiles), WP03 (matching to find sponsors)

**Risks**:
- Push notification delivery depends on FCM configuration
- Realtime connection scaling (monitor connection limits)
- Race conditions if multiple sponsors accept same sponsee (need server-side validation)

**Success Criteria**:
- Connection request appears in sponsor's queue within 5 seconds
- Push notification delivered when request status changes
- Only one sponsor can accept a given request (database constraint enforced)
- Declined requests show up with optional explanation to sponsee

**Deliverables**:
- `supabase/migrations/004_connections.sql`
- `supabase/functions/send-notifications/` (FCM Edge Function)
- `mobile/src/screens/matching/SendRequestScreen.tsx`
- `mobile/src/screens/dashboard/RequestQueueScreen.tsx` (sponsor view)
- `mobile/src/services/notifications/fcmService.ts`

---

## Phase 2: Core Features (P2 User Stories)

### WP05: Sobriety Tracking
**Priority**: P2 (User Story 3 - foundational accountability)
**Goal**: Implement sobriety date tracking, relapse logging, milestone celebrations with mutual visibility
**Independent Test**: User logs sobriety date → Reaches 30-day milestone → Sponsor receives celebration notification

**Included Subtasks**:
- [ ] T022: Create SobrietyDate and Relapse tables with milestone calculations
- [ ] T023: Build sobriety tracking screen (add/edit dates, view streak, milestones)
- [ ] T024: Implement relapse logging with optional private note
- [ ] T025: Create milestone detection cron job (pg_cron + Edge Function)
- [ ] T026: Build milestone celebration UI with notifications
- [ ] T027: Implement mutual visibility (sponsor can view sponsee's sobriety data)

**Implementation Sketch**:
1. Create database schema with triggers to auto-calculate `current_streak_days`
2. Build UI for users to add sobriety dates for different substances
3. Create relapse logging flow that resets streak and notifies sponsor
4. Set up daily pg_cron job to check for upcoming/reached milestones
5. Send celebration notifications to user and their connections
6. Add sobriety summary to profile screens for mutual visibility

**Parallel Opportunities**: T024 (relapse logging) parallel to T025 (milestone detection)

**Dependencies**: WP02 (user profiles), WP04 (connections for notifications)

**Risks**:
- Date calculations must handle timezones correctly
- Private notes for relapses must remain private (RLS policy enforcement)

**Success Criteria**:
- Sobriety streak calculates correctly after relapses
- Milestones detected within 24 hours of occurrence
- Sponsor receives compassionate notification on sponsee relapse
- Multiple substances tracked independently

**Deliverables**:
- `supabase/migrations/005_sobriety_tracking.sql`
- `supabase/functions/check-milestones/` (daily cron job)
- `mobile/src/screens/sobriety/SobrietyTrackingScreen.tsx`
- `mobile/src/screens/sobriety/LogRelapseScreen.tsx`

---

### WP06: 12-Step Worksheets
**Priority**: P2 (User Story 4 - core recovery work)
**Goal**: Implement structured step worksheets with sponsor editing and progress tracking
**Independent Test**: Sponsee completes Step 1 responses → Sponsor adds comments → Marks complete → Step 2 unlocks

**Included Subtasks**:
- [ ] T028: Create Step and StepWork tables with JSON response storage
- [ ] T029: Seed database with 12 AA steps and default questions
- [ ] T030: Build step worksheet screen with auto-save (React Hook Form)
- [ ] T031: Implement sponsor comment system (inline feedback per question)
- [ ] T032: Create sponsor customization (edit questions, add custom questions)
- [ ] T033: Build step completion flow with sponsor approval

**Implementation Sketch**:
1. Create database schema with JSONB storage for responses and custom questions
2. Seed `steps` table with 12 AA steps and default guided questions
3. Build sponsee worksheet UI with multi-field form and auto-save every 30s
4. Allow sponsors to view sponsee step work and add comments per question
5. Enable sponsors to edit questions and add custom questions for individual sponsees
6. Implement completion flow where sponsor marks step as done

**Parallel Opportunities**: T030 (worksheet UI) parallel to T031 (comment system)

**Dependencies**: WP04 (requires active connections)

**Risks**:
- Large text responses may hit JSONB size limits (monitor and add validation)
- Auto-save must handle offline scenarios gracefully

**Success Criteria**:
- All 12 steps available with default questions
- Responses auto-save every 30 seconds without user action
- Sponsor comments appear inline with sponsee responses
- Step completion updates progress on both dashboards

**Deliverables**:
- `supabase/migrations/006_step_work.sql`
- `supabase/seed.sql` (12 steps with questions)
- `mobile/src/screens/steps/StepWorksheetScreen.tsx`
- `mobile/src/screens/steps/SponsorReviewScreen.tsx` (sponsor view)

---

### WP07: Messaging & Check-Ins
**Priority**: P2 (User Story 5 - ongoing communication)
**Goal**: Implement in-app messaging with Supabase Realtime + structured check-ins with notifications
**Independent Test**: Sponsor sends message → Sponsee receives real-time → Sponsor schedules daily check-in → Sponsee responds

**Included Subtasks**:
- [ ] T034: Create Message, CheckIn, CheckInResponse tables
- [ ] T035: Build messaging UI with conversation threads (FlatList, real-time updates)
- [ ] T036: Implement Supabase Realtime subscription for live messages
- [ ] T037: Create check-in scheduling screen (sponsors set recurring questions)
- [ ] T038: Build check-in response UI for sponsees (push notification → form)
- [ ] T039: Implement check-in completion tracking with sponsor visibility

**Implementation Sketch**:
1. Create database schema for messages and check-ins
2. Build chat UI with FlatList virtualization for performance
3. Subscribe to Supabase Realtime channel for live message delivery
4. Allow sponsors to create recurring check-ins with custom questions
5. Send push notifications at scheduled times via Edge Function
6. Track check-in responses and notify sponsors of missed check-ins

**Parallel Opportunities**: T035 (messaging UI) parallel to T037 (check-in scheduling)

**Dependencies**: WP04 (connections), WP01 (FCM notifications)

**Risks**:
- Realtime connection limits (500 concurrent on Pro tier)
- Check-in notifications must respect user timezones
- Message history may grow large (implement pagination)

**Success Criteria**:
- Messages delivered within 5 seconds under normal network
- Read receipts update in real-time
- Check-ins fire at scheduled time (±2 minute window)
- Sponsees can respond to check-ins from push notification

**Deliverables**:
- `supabase/migrations/007_messaging.sql`
- `mobile/src/screens/messaging/ConversationScreen.tsx`
- `mobile/src/screens/checkins/ScheduleCheckInScreen.tsx` (sponsor)
- `mobile/src/screens/checkins/RespondCheckInScreen.tsx` (sponsee)
- `mobile/src/services/realtime/realtimeService.ts`

---

## Phase 3: Polish & Launch Prep (P3)

### WP08: Theme & Polish
**Priority**: P3 (User Story 7 + production readiness)
**Goal**: Implement dark/light mode, accessibility compliance, performance optimization, production deployment
**Independent Test**: User toggles theme → All screens adapt → Accessibility tests pass → App performs < 2s startup

**Included Subtasks**:
- [ ] T040: Implement dark/light theme switching with system preference
- [ ] T041: Accessibility audit (WCAG 2.1 Level AA compliance, screen reader testing)
- [ ] T042: Performance optimization (lazy loading, image optimization, bundle splitting)
- [ ] T043: Error handling and offline UX improvements
- [ ] T044: Production Supabase deployment and environment config
- [ ] T045: App Store and Google Play submission prep (icons, screenshots, descriptions)

**Implementation Sketch**:
1. Create theme provider supporting light/dark/system modes with persistent preference
2. Audit all screens for accessibility (labels, contrast ratios, keyboard navigation)
3. Optimize performance: lazy load screens, compress images, analyze bundle size
4. Improve error handling with user-friendly messages and retry logic
5. Deploy Supabase to production, configure environment variables
6. Prepare app store assets (icons, screenshots, privacy policy, app descriptions)

**Parallel Opportunities**: Most subtasks can run in parallel (different areas of polish)

**Dependencies**: All previous work packages (WP01-WP07)

**Risks**:
- Accessibility issues may require UI redesigns
- Performance bottlenecks may surface only under production load
- App store review process unpredictable (1-7 days)

**Success Criteria**:
- Theme switches instantly with no visual glitches
- All text meets WCAG AA contrast standards (4.5:1 ratio)
- App launches in < 2 seconds on mid-range devices
- Offline mode works gracefully for cached data
- Production Supabase running with proper backups and monitoring

**Deliverables**:
- `mobile/src/theme/ThemeProvider.tsx` (dark/light toggle)
- Accessibility test results and fixes
- Performance optimization report
- Production deployment documentation
- App store submission assets

---

## Subtask Registry

### Phase 0: Setup (T001-T005)
- **T001**: Initialize React Native project with TypeScript and folder structure
- **T002**: Configure Supabase local development, initial migration, seed data
- **T003**: Set up ESLint, Prettier, Jest, TypeScript config per constitution
- **T004**: Create design system foundation (theme tokens, Button, Input, Card components)
- **T005**: Configure GitHub Actions CI/CD (linting, tests, build validation)

### Phase 1: MVP Core (T006-T021)

**Authentication & Profiles (T006-T010)**:
- **T006**: Create User table schema with RLS policies in Supabase
- **T007**: Implement auth screens (signup, login, password reset) with Supabase Auth
- **T008**: Build onboarding flow (role selection, demographics, preferences)
- **T009**: Create profile editing screen with form validation (React Hook Form + Zod)
- **T010**: Implement profile photo upload to Supabase Storage with compression

**Matching Algorithm (T011-T015)**:
- **T011**: Create matching algorithm SQL function with weighted scoring
- **T012**: Add full-text search indexes (bio_search with ts_vector, GIN index)
- **T013**: Implement geographic distance calculation (earth_distance)
- **T014**: Create matches materialized view with pg_cron hourly refresh
- **T015**: Build sponsor match list screen with compatibility breakdown UI

**Connection Requests (T016-T021)**:
- **T016**: Create ConnectionRequest and Connection tables with state machines
- **T017**: Implement "send connection request" flow with intro message
- **T018**: Build sponsor request queue screen (pending requests with profiles)
- **T019**: Create request response actions (accept, decline, message)
- **T020**: Implement Supabase Realtime subscription for request status updates
- **T021**: Set up Firebase Cloud Messaging for push notifications

### Phase 2: Core Features (T022-T039)

**Sobriety Tracking (T022-T027)**:
- **T022**: Create SobrietyDate and Relapse tables with milestone calculation triggers
- **T023**: Build sobriety tracking screen (add/edit dates, view streak, milestones)
- **T024**: Implement relapse logging with optional private note
- **T025**: Create milestone detection cron job (pg_cron + Edge Function)
- **T026**: Build milestone celebration UI with push notifications
- **T027**: Implement mutual visibility (sponsor views sponsee sobriety data)

**12-Step Worksheets (T028-T033)**:
- **T028**: Create Step and StepWork tables with JSONB response storage
- **T029**: Seed database with 12 AA steps and default guided questions
- **T030**: Build step worksheet screen with auto-save (React Hook Form)
- **T031**: Implement sponsor comment system (inline feedback per question)
- **T032**: Create sponsor customization (edit questions, add custom questions)
- **T033**: Build step completion flow with sponsor approval

**Messaging & Check-Ins (T034-T039)**:
- **T034**: Create Message, CheckIn, CheckInResponse tables
- **T035**: Build messaging UI with conversation threads (FlatList virtualization)
- **T036**: Implement Supabase Realtime subscription for live message delivery
- **T037**: Create check-in scheduling screen (sponsors set recurring questions)
- **T038**: Build check-in response UI for sponsees (push notification → form)
- **T039**: Implement check-in completion tracking with sponsor visibility

### Phase 3: Polish (T040-T045)
- **T040**: Implement dark/light theme switching with system preference
- **T041**: Accessibility audit (WCAG 2.1 Level AA, screen reader testing)
- **T042**: Performance optimization (lazy loading, image compression, bundle analysis)
- **T043**: Error handling and offline UX improvements (retry logic, graceful degradation)
- **T044**: Production Supabase deployment and environment configuration
- **T045**: App Store and Google Play submission prep (assets, policies, descriptions)

---

## Implementation Guidance

### TDD Workflow (Constitution Requirement)
All subtasks must follow Red-Green-Refactor cycle:
1. **Red**: Write failing test for subtask
2. **Green**: Write minimum code to pass test
3. **Refactor**: Improve code quality while maintaining tests

### Parallelization Opportunities
- **WP01**: T003 || T002 (linting parallel to Supabase setup)
- **WP03**: T012 || T013 (indexes parallel to distance calc)
- **WP04**: T020 || T021 (Realtime parallel to FCM)
- **WP05**: T024 || T025 (relapse logging parallel to milestone detection)
- **WP06**: T030 || T031 (worksheet UI parallel to comment system)
- **WP07**: T035 || T037 (messaging UI parallel to check-in scheduling)
- **WP08**: All subtasks parallelizable (different polish areas)

### Critical Path (MVP)
Must complete in order for MVP launch:
1. WP01 (setup) → WP02 (auth) → WP03 (matching) → WP04 (connections)
2. After MVP core, WP05-WP07 can be developed in parallel teams
3. WP08 runs after all features complete

### Risk Mitigation
- **Supabase connection limits**: Monitor Realtime connections, plan upgrade to Team tier at 400+ concurrent users
- **Push notification delivery**: Implement fallback in-app notification system
- **Data integrity**: Comprehensive RLS policy testing before production launch
- **Performance**: Benchmark matching algorithm with 10K+ users, optimize indexes

---

## Success Metrics

**MVP (WP01-WP04)**:
- User signup to first match view: < 10 minutes
- Connection request to sponsor acceptance: < 48 hours (tracked)
- Matching accuracy: 70%+ user satisfaction with match relevance

**Full Launch (WP01-WP08)**:
- Daily active users: 1,000+ within first month
- Average sponsor/sponsee relationship duration: > 90 days
- Step 1 completion rate: 60%+ of connected sponsees
- Message response time: < 24 hours for 80% of conversations

---

## Next Steps

1. **Start with WP01**: Run `/spec-kitty.implement WP01` to execute project setup
2. **Review Prompts**: Each work package has a detailed prompt file in `tasks/planned/`
3. **Track Progress**: Mark subtasks complete in this file as you finish them
4. **Code Review**: Use `/spec-kitty.review WPxx` after completing each work package
5. **Launch Checklist**: Complete WP08 before production deployment

**Status**: Ready for implementation. All design artifacts complete. Begin with WP01-project-setup.md.
