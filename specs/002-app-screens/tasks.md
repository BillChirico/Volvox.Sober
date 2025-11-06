# Tasks: All Application Screens

**Feature**: 002-app-screens
**Date**: 2025-11-05
**Input**: Design documents from `/specs/002-app-screens/`

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing. Each user story can be completed as a standalone increment.

**Tests**: Not explicitly requested in spec.md - TDD workflow will be followed but test tasks are integrated into implementation tasks following RED-GREEN-REFACTOR cycle.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1-US7)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database foundation

- [X] T001 Apply database migration for profiles table in supabase/migrations/
- [X] T002 [P] Apply database migration for onboarding_progress table in supabase/migrations/
- [X] T003 [P] Apply database migration for sobriety_records table in supabase/migrations/
- [X] T004 [P] Apply database migration for matches table in supabase/migrations/
- [X] T005 [P] Apply database migration for connections table in supabase/migrations/
- [X] T006 [P] Apply database migration for messages table in supabase/migrations/
- [X] T007 [P] Apply database migration for notification_preferences table in supabase/migrations/
- [X] T008 Verify all RLS policies are enabled and test with sample user in supabase/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions (Foundation)

- [X] T009 [P] Create Profile types in src/types/profile.ts
- [X] T010 [P] Create Onboarding types in src/types/onboarding.ts
- [X] T011 [P] Create Sobriety types in src/types/sobriety.ts
- [X] T012 [P] Create Match types in src/types/match.ts
- [X] T013 [P] Create Connection types in src/types/connection.ts
- [X] T014 [P] Create Message types in src/types/message.ts
- [X] T015 [P] Create Navigation types in src/types/navigation.ts

### Service Layer (Foundation)

- [X] T016 [P] Implement profileService with CRUD operations in src/services/profileService.ts
- [X] T017 [P] Implement onboardingService with progress tracking in src/services/onboardingService.ts
- [X] T018 [P] Implement sobrietyService with date calculations in src/services/sobrietyService.ts
- [X] T019 [P] Implement matchingService with filtering in src/services/matchingService.ts
- [X] T020 [P] Implement connectionService with request management in src/services/connectionService.ts
- [X] T021 [P] Implement messageService with Realtime subscriptions in src/services/messageService.ts
- [X] T022 [P] Create validation schemas (Yup) in src/services/validationSchemas.ts

### Redux Store (Foundation)

- [X] T023 [P] Create profileSlice with entity adapter in src/store/profile/profileSlice.ts
- [X] T024 [P] Create onboardingSlice with progress state in src/store/onboarding/onboardingSlice.ts
- [X] T025 [P] Create sobrietySlice with calculations in src/store/sobriety/sobrietySlice.ts
- [X] T026 [P] Create matchesSlice with filtering in src/store/matches/matchesSlice.ts
- [X] T027 [P] Create connectionsSlice with status management in src/store/connections/connectionsSlice.ts
- [X] T028 [P] Create messagesSlice with thread normalization in src/store/messages/messagesSlice.ts

### Redux Thunks (Foundation)

- [X] T029 [P] Create profileThunks for async profile operations in src/store/profile/profileThunks.ts
- [X] T030 [P] Create onboardingThunks for onboarding flow in src/store/onboarding/onboardingThunks.ts
- [X] T031 [P] Create sobrietyThunks for sobriety operations in src/store/sobriety/sobrietyThunks.ts
- [X] T032 [P] Create matchesThunks for match fetching in src/store/matches/matchesThunks.ts
- [X] T033 [P] Create connectionsThunks for connection operations in src/store/connections/connectionsThunks.ts
- [X] T034 [P] Create messagesThunks with optimistic updates in src/store/messages/messagesThunks.ts

### Redux Selectors (Foundation)

- [X] T035 [P] Create profileSelectors with memoization in src/store/profile/profileSelectors.ts
- [X] T036 [P] Create onboardingSelectors for progress state in src/store/onboarding/onboardingSelectors.ts
- [X] T037 [P] Create sobrietySelectors with days calculation in src/store/sobriety/sobrietySelectors.ts
- [X] T038 [P] Create matchesSelectors with filtering in src/store/matches/matchesSelectors.ts
- [X] T039 [P] Create connectionsSelectors with status grouping in src/store/connections/connectionsSelectors.ts
- [X] T040 [P] Create messagesSelectors with thread selection in src/store/messages/messagesSelectors.ts

### Custom Hooks (Foundation)

- [X] T041 [P] Create useOnboarding hook in src/hooks/useOnboarding.ts
- [X] T042 [P] Create useSobrietyTracking hook in src/hooks/useSobrietyTracking.ts
- [X] T043 [P] Create useMatches hook in src/hooks/useMatches.ts
- [X] T044 [P] Create useConnections hook in src/hooks/useConnections.ts
- [X] T045 [P] Create useMessages hook with Realtime in src/hooks/useMessages.ts
- [X] T046 [P] Create useProfile hook in src/hooks/useProfile.ts
- [X] T047 [P] Create useTabNavigation hook in src/hooks/useTabNavigation.ts

### Constants & Utilities (Foundation)

- [X] T048 [P] Create RecoveryPrograms constants in src/constants/RecoveryPrograms.ts
- [X] T049 [P] Create Availability constants in src/constants/Availability.ts
- [X] T050 [P] Create date calculation utilities in src/utils/dateCalculations.ts
- [X] T051 [P] Create matching algorithm utilities in src/utils/matchingAlgorithm.ts
- [X] T052 [P] Create formatting utilities in src/utils/formatting.ts

### Common Components (Foundation)

- [X] T053 [P] Create LoadingSpinner component in src/components/common/LoadingSpinner.tsx
- [X] T054 [P] Create ErrorBoundary component in src/components/common/ErrorBoundary.tsx
- [X] T055 [P] Create EmptyState component in src/components/common/EmptyState.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 7 - Navigation (Priority: P1) 🎯 INFRASTRUCTURE

**Goal**: Implement bottom tab navigation with 5 tabs (Sobriety, Matches, Connections, Messages, Profile) with notification badges and consistent styling

**Independent Test**: Navigate between all tabs, verify active tab highlighting, check notification badges appear for unread messages and pending connections, confirm tab state persists when switching

**Why First**: Navigation is fundamental infrastructure required for all other screens to be accessible. Without navigation, users cannot access any functionality.

### Implementation for User Story 7

- [X] T056 [US7] Create root layout with providers in app/_layout.tsx
- [X] T057 [US7] Create index route with redirect logic in app/index.tsx
- [X] T058 [US7] Create tab layout with bottom navigation in app/(tabs)/_layout.tsx
- [X] T059 [P] [US7] Create TabBar component with badges in src/components/navigation/TabBar.tsx
- [X] T060 [P] [US7] Create NotificationBadge component in src/components/navigation/NotificationBadge.tsx
- [X] T061 [US7] Implement tab navigation state persistence in useTabNavigation hook
- [X] T062 [US7] Add accessibility labels to all tab icons and ensure 44x44 touch targets
- [X] T063 [US7] Test navigation flow: tap each tab, verify screen loads, check state persistence

**Checkpoint**: Navigation infrastructure complete - users can access all screens

---

## Phase 4: User Story 1 - Onboarding (Priority: P1) 🎯 MVP

**Goal**: Guide newly registered users through welcome screen, role selection (sponsor/sponsee), and profile setup to complete onboarding

**Independent Test**: Create new account, complete email verification, progress through welcome screen, select role, fill profile form, verify redirect to Sobriety tab and onboarding skip on next login

**Why P1**: Onboarding is the critical first experience that determines whether users understand the app and complete setup. Required before any other features are usable.

### Components for User Story 1

- [X] T064 [P] [US1] Create WelcomeCard component in src/components/onboarding/WelcomeCard.tsx
- [X] T065 [P] [US1] Create RoleSelector component in src/components/onboarding/RoleSelector.tsx
- [X] T066 [P] [US1] Create ProfileForm component with role-specific fields in src/components/onboarding/ProfileForm.tsx

### Screens for User Story 1

- [X] T067 [US1] Create onboarding layout with stack navigation in app/(onboarding)/_layout.tsx
- [X] T068 [US1] Implement welcome screen in app/(onboarding)/welcome.tsx
- [X] T069 [US1] Implement email verification prompt in app/(onboarding)/email-verification.tsx
- [X] T070 [US1] Implement sponsor profile form screen in app/(onboarding)/sponsor-profile.tsx
- [X] T071 [US1] Implement sponsee profile form screen in app/(onboarding)/sponsee-profile.tsx
- [X] T072 [US1] Add onboarding completion redirect logic to app/index.tsx
- [X] T073 [US1] Test complete onboarding flow: welcome → role → profile → redirect to Sobriety tab

**Checkpoint**: Onboarding complete - new users can set up their profiles

---

## Phase 5: User Story 2 - Sobriety Tracking (Priority: P1) 🎯 MVP

**Goal**: Provide sobriety tracking with days counter, milestone recognition, and daily reflections to motivate users and provide context for relationships

**Independent Test**: Set sobriety start date, view calculated days count, add daily reflection, verify data persists, check milestone notifications appear at 30/60/90 days

**Why P1**: Sobriety tracking is core value proposition providing daily motivation. Foundation for accountability relationships.

### Components for User Story 2

- [X] T074 [P] [US2] Create DaysCounter component with large display in src/components/sobriety/DaysCounter.tsx
- [X] T075 [P] [US2] Create MilestoneCard component in src/components/sobriety/MilestoneCard.tsx
- [X] T076 [P] [US2] Create ReflectionInput component in src/components/sobriety/ReflectionInput.tsx
- [X] T077 [P] [US2] Create Timeline component for reflections in src/components/sobriety/Timeline.tsx

### Screen for User Story 2

- [X] T078 [US2] Implement sobriety tracking screen in app/(tabs)/sobriety.tsx
- [X] T079 [US2] Add sobriety date picker with validation (no future dates)
- [X] T080 [US2] Implement milestone detection and notification logic
- [X] T081 [US2] Add pull-to-refresh for sobriety data updates
- [X] T082 [US2] Test sobriety flow: set date → view days → add reflection → verify persistence

**Checkpoint**: Sobriety tracking complete - users can track their journey

---

## Phase 6: User Story 3 - Matching (Priority: P2)

**Goal**: Display compatible sponsor/sponsee matches based on recovery program, location, availability with filtering and compatibility scores

**Independent Test**: Create sponsor and sponsee profiles, view suggested matches, filter by program/availability, send connection request, verify match quality improves with profile completion

**Why P2**: Matching is key differentiator but requires existing users and profiles to be valuable. Essential but can be added after core tracking.

### Components for User Story 3

- [X] T083 [P] [US3] Create MatchCard component with compatibility badge in src/components/matches/MatchCard.tsx
- [X] T084 [P] [US3] Create CompatibilityBadge component in src/components/matches/CompatibilityBadge.tsx
- [X] T085 [P] [US3] Create FilterBar component for program/availability in src/components/matches/FilterBar.tsx

### Screen for User Story 3

- [X] T086 [US3] Implement matches screen with filtered list in app/(tabs)/matches.tsx
- [X] T087 [US3] Add match profile detail view with full information
- [X] T088 [US3] Implement connection request action with rate limiting (5 per day)
- [X] T089 [US3] Implement decline match action with 30-day cooldown
- [X] T090 [US3] Add empty state for no matches with profile completion tips
- [X] T091 [US3] Test matching flow: view matches → filter → view profile → send request

### Edge Function for User Story 3

- [X] T092 [US3] Implement matching algorithm Edge Function in supabase/functions/calculate-match-score/
- [X] T093 [US3] Test matching algorithm with various profile combinations

**Checkpoint**: Matching complete - users can discover compatible connections

---

## Phase 7: User Story 4 - Connections (Priority: P2)

**Goal**: Manage sponsor/sponsee relationships with pending requests, active connections, and past connections with quick communication access

**Independent Test**: Send connection request, accept connection, view in Connections tab, access quick message action, end connection and verify move to Past

**Why P2**: Connections management is important for relationships but requires matches to exist first. Key feature that depends on matching system.

### Components for User Story 4

- [X] T094 [P] [US4] Create ConnectionCard component for active connections in src/components/connections/ConnectionCard.tsx
- [X] T095 [P] [US4] Create RequestCard component for pending requests in src/components/connections/RequestCard.tsx
- [X] T096 [P] [US4] Create ConnectionStatus component in src/components/connections/ConnectionStatus.tsx

### Screen for User Story 4

- [X] T097 [US4] Implement connections screen with 3 sections in app/(tabs)/connections.tsx
- [X] T098 [US4] Add pending requests section with accept/decline actions
- [X] T099 [US4] Add active connections section sorted by last interaction
- [X] T100 [US4] Add past connections section for historical reference
- [X] T101 [US4] Implement connection profile view with full details
- [X] T102 [US4] Implement end connection flow with optional feedback
- [X] T103 [US4] Add notification badge for pending requests count
- [X] T104 [US4] Test connections flow: accept request → view active → send message → end connection

**Checkpoint**: Connections management complete - users can manage relationships

---

## Phase 8: User Story 5 - Messaging (Priority: P2)

**Goal**: Enable secure messaging between connections with real-time delivery, read receipts, and conversation history

**Independent Test**: Send message to active connection, receive reply, view message history, verify real-time delivery and read receipts work

**Why P2**: Messaging is critical for sponsor/sponsee relationships but requires active connections to be useful. Essential for accountability.

### Components for User Story 5

- [X] T105 [P] [US5] Create MessageThread component for thread list in src/components/messages/MessageThread.tsx
- [X] T106 [P] [US5] Create MessageInput component with character count in src/components/messages/MessageInput.tsx
- [X] T107 [P] [US5] Create MessageBubble component with timestamps in src/components/messages/MessageBubble.tsx

### Screen for User Story 5

- [X] T108 [US5] Implement messages screen with thread list in app/(tabs)/messages.tsx
- [X] T109 [US5] Implement thread detail view with message history
- [X] T110 [US5] Add Realtime subscription for new messages in thread
- [X] T111 [US5] Implement message sending with optimistic updates
- [X] T112 [US5] Implement read receipt tracking and display
- [X] T113 [US5] Add unread message badge on Messages tab
- [X] T114 [US5] Add offline message queue with sync on reconnect
- [X] T115 [US5] Test messaging flow: send message → receive reply → verify real-time delivery

**Checkpoint**: Messaging complete - users can communicate with connections

---

## Phase 9: User Story 6 - Profile Management (Priority: P3)

**Goal**: Allow users to view and update profile information, preferences, notification settings, and account details

**Independent Test**: Access Profile tab, update bio and recovery program, change notification preferences, verify changes persist and affect app behavior

**Why P3**: Profile management is important for long-term engagement but not critical for MVP. Users can set profiles during onboarding and update later.

### Components for User Story 6

- [X] T116 [P] [US6] Create ProfileHeader component with photo and name in src/components/profile/ProfileHeader.tsx
- [X] T117 [P] [US6] Create SettingsSection component in src/components/profile/SettingsSection.tsx
- [X] T118 [P] [US6] Create NotificationSettings component in src/components/profile/NotificationSettings.tsx

### Screen for User Story 6

- [X] T119 [US6] Implement profile screen with view mode in app/(tabs)/profile.tsx
- [X] T120 [US6] Add profile edit mode with validation
- [X] T121 [US6] Implement role change with profile re-configuration
- [X] T122 [US6] Implement notification preferences management
- [X] T123 [US6] Add profile completion percentage indicator
- [X] T124 [US6] Add account settings (email, password, delete account)
- [X] T125 [US6] Test profile flow: edit profile → change role → update settings → verify persistence

**Checkpoint**: Profile management complete - users can maintain their profiles

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

### Performance Optimization

- [X] T126 [P] Implement image lazy loading across all screens
- [X] T127 [P] Add Redux Persist for offline support
- [X] T128 [P] Optimize FlashList rendering for long lists (matches, messages, connections)
- [X] T129 [P] Add skeleton screens for loading states across all screens

### Error Handling

- [X] T130 [P] Implement error boundaries for all screen groups
- [X] T131 [P] Add user-friendly error messages with retry actions
- [X] T132 [P] Add network error handling with offline indicators

### Accessibility

- [X] T133 [P] Run Playwright accessibility tests for all screens
- [ ] T134 Manual VoiceOver testing on iOS for critical flows (requires manual execution)
- [ ] T135 Manual TalkBack testing on Android for critical flows (requires manual execution)
- [X] T136 [P] Verify all touch targets are minimum 44x44 points
- [X] T137 [P] Verify color contrast meets WCAG 2.1 AA standards

### Dark Mode

- [X] T138 [P] Implement dark mode theme tokens in src/theme/
- [X] T139 [P] Apply dark mode styling across all components
- [X] T140 Test dark mode across all screens on iOS, Android, Web

### Testing

- [X] T141 [P] Add E2E test for onboarding flow in __tests__/onboarding-flow.spec.ts
- [X] T142 [P] Add E2E test for sobriety tracking in __tests__/sobriety-tracking.spec.ts
- [X] T143 [P] Add E2E test for matching in __tests__/matching-flow.spec.ts
- [X] T144 [P] Add E2E test for connections in __tests__/connections-flow.spec.ts
- [X] T145 [P] Add E2E test for messaging in __tests__/messaging-flow.spec.ts
- [X] T146 [P] Add E2E test for navigation in __tests__/navigation-flow.spec.ts

### Documentation & Validation

- [ ] T147 Run quickstart.md validation on clean environment
- [ ] T148 Update CLAUDE.md with new screen patterns and state management
- [ ] T149 Verify all acceptance scenarios from spec.md pass
- [ ] T150 Run bundle size analysis and verify targets met (iOS/Android < 50MB, Web < 500KB gzipped)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) OR sequentially in priority order
  - Recommended sequence: US7 (Navigation) → US1 (Onboarding) → US2 (Sobriety) → US3 (Matching) → US4 (Connections) → US5 (Messaging) → US6 (Profile)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US7 (Navigation - P1)**: **Must be first** - provides infrastructure for all other screens
- **US1 (Onboarding - P1)**: Can start after US7 - No dependencies on other stories
- **US2 (Sobriety - P1)**: Can start after US7 - No dependencies on other stories (can run parallel with US1)
- **US3 (Matching - P2)**: Can start after US7 - No dependencies on US1/US2 but requires profiles to exist
- **US4 (Connections - P2)**: Can start after US7 - Integrates with US3 (sends connection requests to matches)
- **US5 (Messaging - P2)**: Can start after US7 - Requires US4 (messages sent within active connections)
- **US6 (Profile - P3)**: Can start after US7 - No dependencies on other stories

### Within Each User Story

- Components before screens (components are used by screens)
- Screens before navigation integration
- Story complete and independently testable before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All database migrations (T001-T007) can run in parallel

**Phase 2 (Foundational)**:
- All type definitions (T009-T015) can run in parallel
- All services (T016-T022) can run in parallel
- All Redux slices (T023-T028) can run in parallel
- All Redux thunks (T029-T034) can run in parallel
- All Redux selectors (T035-T040) can run in parallel
- All custom hooks (T041-T047) can run in parallel
- All constants/utilities (T048-T052) can run in parallel
- All common components (T053-T055) can run in parallel

**User Story 1 (Onboarding)**: Components T064-T066 can run in parallel

**User Story 2 (Sobriety)**: Components T074-T077 can run in parallel

**User Story 3 (Matching)**: Components T083-T085 can run in parallel

**User Story 4 (Connections)**: Components T094-T096 can run in parallel

**User Story 5 (Messaging)**: Components T105-T107 can run in parallel

**User Story 6 (Profile)**: Components T116-T118 can run in parallel

**Phase 10 (Polish)**: Most tasks can run in parallel except manual testing (T134-T135)

---

## Parallel Execution Examples

### Foundational Phase - Maximum Parallelization

```bash
# Launch all type definitions together:
Task T009: "Create Profile types in src/types/profile.ts"
Task T010: "Create Onboarding types in src/types/onboarding.ts"
Task T011: "Create Sobriety types in src/types/sobriety.ts"
Task T012: "Create Match types in src/types/match.ts"
Task T013: "Create Connection types in src/types/connection.ts"
Task T014: "Create Message types in src/types/message.ts"
Task T015: "Create Navigation types in src/types/navigation.ts"

# Launch all services together:
Task T016: "Implement profileService in src/services/profileService.ts"
Task T017: "Implement onboardingService in src/services/onboardingService.ts"
Task T018: "Implement sobrietyService in src/services/sobrietyService.ts"
Task T019: "Implement matchingService in src/services/matchingService.ts"
Task T020: "Implement connectionService in src/services/connectionService.ts"
Task T021: "Implement messageService in src/services/messageService.ts"
Task T022: "Create validation schemas in src/services/validationSchemas.ts"
```

### User Story Phase - Component Parallelization

```bash
# Launch all Messaging components together:
Task T105: "Create MessageThread component in src/components/messages/MessageThread.tsx"
Task T106: "Create MessageInput component in src/components/messages/MessageInput.tsx"
Task T107: "Create MessageBubble component in src/components/messages/MessageBubble.tsx"
```

---

## Implementation Strategy

### MVP First (Navigation + Onboarding + Sobriety Only)

1. Complete Phase 1: Setup (Database migrations)
2. Complete Phase 2: Foundational (All infrastructure)
3. Complete Phase 3: User Story 7 (Navigation) - **Infrastructure**
4. Complete Phase 4: User Story 1 (Onboarding) - **First user flow**
5. Complete Phase 5: User Story 2 (Sobriety) - **Core value**
6. **STOP and VALIDATE**: Test complete user journey (signup → onboard → track sobriety)
7. Deploy/demo if ready

**MVP delivers**: New user can sign up, complete onboarding, and track their sobriety journey.

### Incremental Delivery (Add Matching + Connections + Messaging)

1. Complete MVP (Navigation + Onboarding + Sobriety)
2. Add User Story 3 (Matching) → Test independently → Deploy/Demo
3. Add User Story 4 (Connections) → Test independently → Deploy/Demo
4. Add User Story 5 (Messaging) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

**Full Feature Set delivers**: Complete sponsor/sponsee matching and accountability platform.

### Final Polish (Add Profile Management + Optimization)

1. Complete Full Feature Set
2. Add User Story 6 (Profile Management) → Test independently
3. Complete Phase 10 (Polish & Cross-Cutting)
4. Final validation and deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: US7 (Navigation) [MUST BE FIRST]
   - **After US7 complete**:
     - Developer A: US1 (Onboarding)
     - Developer B: US2 (Sobriety)
     - Developer C: US3 (Matching)
   - **After US1-US3 complete**:
     - Developer A: US4 (Connections)
     - Developer B: US5 (Messaging)
     - Developer C: US6 (Profile)
3. Stories complete and integrate independently

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 7 user stories deliver their stated goals
- [ ] Each user story passes its independent test criteria
- [ ] All acceptance scenarios from spec.md pass
- [ ] Navigation works consistently across iOS, Android, Web
- [ ] Offline support works for 80% of screens
- [ ] Real-time messaging delivers within 500ms
- [ ] WCAG 2.1 AA accessibility standards met
- [ ] Dark mode works across all screens
- [ ] Bundle size within targets (iOS/Android < 50MB, Web < 500KB gzipped)
- [ ] All screens maintain 60 FPS during scrolling
- [ ] App startup < 3 seconds on mid-range devices
- [ ] Playwright E2E tests pass for all critical flows
- [ ] Manual VoiceOver (iOS) and TalkBack (Android) testing complete
- [ ] quickstart.md validated on clean environment

---

## Total Task Count

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 47 tasks
- **Phase 3 (US7 - Navigation)**: 8 tasks
- **Phase 4 (US1 - Onboarding)**: 10 tasks
- **Phase 5 (US2 - Sobriety)**: 9 tasks
- **Phase 6 (US3 - Matching)**: 11 tasks
- **Phase 7 (US4 - Connections)**: 11 tasks
- **Phase 8 (US5 - Messaging)**: 11 tasks
- **Phase 9 (US6 - Profile)**: 10 tasks
- **Phase 10 (Polish)**: 25 tasks

**Total**: 150 tasks

**Parallel Opportunities**: 90+ tasks can run in parallel with proper team coordination

**MVP Scope** (Navigation + Onboarding + Sobriety): 72 tasks (Setup + Foundation + US7 + US1 + US2)

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] indicates tasks that can run in parallel (different files, no dependencies)
- [Story] labels (US1-US7) map directly to user stories in spec.md
- Each user story is independently completable and testable
- TDD workflow integrated: Write test → Verify failure → Implement → Verify pass → Refactor
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- Foundation (Phase 2) MUST be complete before any user story work begins
- Navigation (US7) MUST be complete before other screens can be accessed