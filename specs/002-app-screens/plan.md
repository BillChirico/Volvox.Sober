# Implementation Plan: All Application Screens

**Branch**: `002-app-screens` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-app-screens/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement all main application screens for Volvox.Sober including onboarding flows (welcome, role selection, profile setup), core features (sobriety tracking, sponsor/sponsee matching, connections management, messaging), profile management, and bottom tab navigation. This feature builds on top of the authentication system (001-auth-screens) and establishes the primary user interface for the recovery support platform.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**:
- React Native 0.81+
- Expo 54.x (universal app platform)
- Expo Router 4.x (file-based routing)
- React Native Paper (UI component library)
- Redux Toolkit + Redux Persist (state management)
- Yup (form validation)
- Supabase JS SDK (@supabase/supabase-js) for Auth and Realtime

**Storage**:
- PostgreSQL 15+ via Supabase (user profiles, connections, messages, matches, sobriety records)
- Redux Persist (local cache for offline support)
- AsyncStorage (React Native local storage)

**Testing**:
- Jest + React Native Testing Library (unit/integration tests)
- Playwright (E2E tests for critical user journeys)

**Target Platform**: iOS 15+, Android 8.0+, Web (modern browsers)
**Project Type**: Mobile (universal Expo app with web support)
**Performance Goals**:
- App startup < 3 seconds on mid-range devices
- Screen transitions @ 60 FPS
- Real-time message delivery < 500ms
- Screen loads < 2 seconds

**Constraints**:
- Bundle size: iOS/Android < 50MB, Web < 500KB (gzipped)
- Accessibility: WCAG 2.1 AA compliance mandatory
- Cross-platform consistency: UI must render identically on iOS, Android, Web
- Offline support: 80% of screens must be viewable with cached data

**Scale/Scope**:
- 19 screen files across 3 route groups (tabs, onboarding, auth)
- 7 user stories with 42 acceptance scenarios
- 60 functional requirements
- 7 key entities (User Profile, Onboarding Progress, Sobriety Record, Match, Connection, Message, Notification Preferences)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Type Safety & Code Quality**
- [x] TypeScript strict mode enabled (`strict: true` in tsconfig.json)
- [x] No `any` types - use `unknown` or proper types
- [x] All exported functions have explicit return types
- [x] File naming conventions followed (PascalCase components, camelCase services/hooks)

**II. Test-Driven Development**
- [x] TDD workflow planned: Write tests → Verify failure → Implement → Verify pass → Refactor
- [x] 80% code coverage target for business logic
- [x] Testing pyramid: Unit tests → Integration tests → E2E tests
- [x] Tests co-located in `__tests__/` directories

**III. Cross-Platform UX Consistency**
- [x] UI components render consistently on iOS, Android, Web
- [x] Platform-specific overrides justified and documented
- [x] React Native Paper theme system used
- [x] Accessibility requirements met (labels, contrast, touch targets, screen readers)
- [x] Dark mode supported via theme provider

**IV. Performance Standards**
- [x] App startup < 3 seconds on mid-range devices
- [x] Screen transitions maintain 60 FPS
- [x] Real-time messaging latency < 500ms
- [x] Bundle size within targets (iOS/Android < 50MB, Web < 500KB gzipped)
- [x] Images optimized (WebP with JPEG fallback, lazy loading)
- [x] Database queries optimized (indexes, pagination, caching)

**V. Component Architecture**
- [x] Functional components only (no class components)
- [x] Consistent hooks order: useState → useEffect → custom hooks → handlers
- [x] Named exports preferred over default exports
- [x] Single Responsibility Principle enforced
- [x] State management hierarchy followed (local → Redux → Supabase)

**VI. Security & Privacy**
- [x] Row Level Security (RLS) enabled for all Supabase tables
- [x] Supabase Auth used (no custom auth logic)
- [x] Sensitive data access properly restricted
- [x] Environment variables not committed
- [x] Form inputs validated client-side (Yup) and server-side (Supabase)

**Constitution Compliance**: ✅ All requirements met. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-app-screens/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (database schema design)
├── quickstart.md        # Phase 1 output (local development guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── README.md
│   ├── profiles.yaml    # User profile CRUD operations
│   ├── onboarding.yaml  # Onboarding flow APIs
│   ├── sobriety.yaml    # Sobriety tracking APIs
│   ├── matches.yaml     # Matching algorithm APIs
│   ├── connections.yaml # Connection management APIs
│   └── messages.yaml    # Real-time messaging APIs
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Expo Router (file-based routing)
├── (tabs)/                   # Main app tab navigation group
│   ├── _layout.tsx           # Tab bar configuration
│   ├── sobriety.tsx          # Sobriety tracking screen (P1)
│   ├── matches.tsx           # Match discovery screen (P2)
│   ├── connections.tsx       # Connection management screen (P2)
│   ├── messages.tsx          # Messaging screen (P2)
│   └── profile.tsx           # User profile screen (P3)
├── (onboarding)/             # Onboarding flow group
│   ├── _layout.tsx           # Onboarding navigation
│   ├── welcome.tsx           # Welcome screen (P1)
│   ├── email-verification.tsx # Email verification prompt
│   ├── sponsor-profile.tsx   # Sponsor profile form (P1)
│   └── sponsee-profile.tsx   # Sponsee profile form (P1)
├── (auth)/                   # Authentication screens (from 001-auth-screens)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── forgot-password.tsx
│   └── verify-email.tsx
├── _layout.tsx               # Root layout with providers
├── index.tsx                 # Entry route (redirect logic)
└── +not-found.tsx            # 404 page

src/                          # Application source code
├── components/               # Reusable UI components
│   ├── onboarding/           # Onboarding-specific components
│   │   ├── WelcomeCard.tsx
│   │   ├── RoleSelector.tsx
│   │   ├── ProfileForm.tsx
│   │   └── __tests__/
│   ├── sobriety/             # Sobriety tracking components
│   │   ├── DaysCounter.tsx
│   │   ├── MilestoneCard.tsx
│   │   ├── ReflectionInput.tsx
│   │   ├── Timeline.tsx
│   │   └── __tests__/
│   ├── matches/              # Matching components
│   │   ├── MatchCard.tsx
│   │   ├── CompatibilityBadge.tsx
│   │   ├── FilterBar.tsx
│   │   └── __tests__/
│   ├── connections/          # Connection components
│   │   ├── ConnectionCard.tsx
│   │   ├── RequestCard.tsx
│   │   ├── ConnectionStatus.tsx
│   │   └── __tests__/
│   ├── messages/             # Messaging components
│   │   ├── MessageThread.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageBubble.tsx
│   │   └── __tests__/
│   ├── profile/              # Profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── SettingsSection.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── __tests__/
│   ├── navigation/           # Navigation components
│   │   ├── TabBar.tsx
│   │   ├── NotificationBadge.tsx
│   │   └── __tests__/
│   ├── common/               # Shared components
│   │   ├── AccessibleButton.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── EmptyState.tsx
│   │   └── __tests__/
│   └── auth/                 # Auth components (from 001-auth-screens)

├── services/                 # API clients, business logic
│   ├── profileService.ts     # Profile CRUD operations
│   ├── onboardingService.ts  # Onboarding flow logic
│   ├── sobrietyService.ts    # Sobriety tracking logic
│   ├── matchingService.ts    # Matching algorithm integration
│   ├── connectionService.ts  # Connection management logic
│   ├── messageService.ts     # Messaging and Realtime subscriptions
│   ├── validationSchemas.ts  # Yup validation schemas
│   └── __tests__/

├── store/                    # Redux Toolkit state management
│   ├── profile/              # Profile state slice
│   │   ├── profileSlice.ts
│   │   ├── profileSelectors.ts
│   │   ├── profileThunks.ts
│   │   └── __tests__/
│   ├── onboarding/           # Onboarding state slice
│   │   ├── onboardingSlice.ts
│   │   ├── onboardingSelectors.ts
│   │   ├── onboardingThunks.ts
│   │   └── __tests__/
│   ├── sobriety/             # Sobriety state slice
│   │   ├── sobrietySlice.ts
│   │   ├── sobrietySelectors.ts
│   │   ├── sobrietyThunks.ts
│   │   └── __tests__/
│   ├── matches/              # Matches state slice
│   │   ├── matchesSlice.ts
│   │   ├── matchesSelectors.ts
│   │   ├── matchesThunks.ts
│   │   └── __tests__/
│   ├── connections/          # Connections state slice
│   │   ├── connectionsSlice.ts
│   │   ├── connectionsSelectors.ts
│   │   ├── connectionsThunks.ts
│   │   └── __tests__/
│   ├── messages/             # Messages state slice
│   │   ├── messagesSlice.ts
│   │   ├── messagesSelectors.ts
│   │   ├── messagesThunks.ts
│   │   └── __tests__/
│   └── auth/                 # Auth state (from 001-auth-screens)

├── hooks/                    # Custom React hooks
│   ├── useOnboarding.ts      # Onboarding flow hook
│   ├── useSobrietyTracking.ts # Sobriety tracking hook
│   ├── useMatches.ts         # Match discovery hook
│   ├── useConnections.ts     # Connection management hook
│   ├── useMessages.ts        # Messaging hook with Realtime
│   ├── useProfile.ts         # Profile management hook
│   ├── useTabNavigation.ts   # Tab navigation hook
│   └── __tests__/

├── types/                    # TypeScript definitions
│   ├── profile.ts            # Profile types
│   ├── onboarding.ts         # Onboarding types
│   ├── sobriety.ts           # Sobriety types
│   ├── match.ts              # Match types
│   ├── connection.ts         # Connection types
│   ├── message.ts            # Message types
│   ├── navigation.ts         # Navigation types
│   └── auth.ts               # Auth types (from 001-auth-screens)

├── utils/                    # Utility functions
│   ├── dateCalculations.ts   # Sobriety date calculations
│   ├── matchingAlgorithm.ts  # Compatibility scoring
│   ├── formatting.ts         # Text/date formatting
│   └── __tests__/

├── theme/                    # Theme system
│   ├── colors.ts             # Color tokens
│   ├── typography.ts         # Typography tokens
│   ├── spacing.ts            # Spacing tokens
│   └── index.ts              # Theme provider

└── constants/                # App constants
    ├── RecoveryPrograms.ts   # AA, NA, CA, etc.
    ├── Availability.ts       # Availability options
    └── Layout.ts             # Layout constants

supabase/                     # Backend (Supabase)
├── migrations/               # Database schema migrations
│   ├── [timestamp]_create_profiles.sql
│   ├── [timestamp]_create_onboarding_progress.sql
│   ├── [timestamp]_create_sobriety_records.sql
│   ├── [timestamp]_create_matches.sql
│   ├── [timestamp]_create_connections.sql
│   ├── [timestamp]_create_messages.sql
│   └── [timestamp]_create_notification_preferences.sql
├── functions/                # Edge Functions
│   ├── calculate-match-score/
│   ├── send-milestone-notification/
│   └── clean-expired-matches/
└── seed.sql                  # Test data seeding

__tests__/                    # E2E tests (Playwright)
├── onboarding.spec.ts
├── sobriety-tracking.spec.ts
├── matching.spec.ts
├── connections.spec.ts
├── messaging.spec.ts
└── navigation.spec.ts
```

**Structure Decision**: This is a mobile application with universal Expo support (iOS, Android, Web). The structure follows Expo Router's file-based routing convention with route groups for logical organization. Source code is organized by feature domain (onboarding, sobriety, matches, etc.) with clear separation of concerns (components, services, state, hooks). Testing follows the pyramid: unit tests co-located with source, integration tests in services/store, E2E tests at root level.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected**. The implementation fully complies with all constitution requirements. TypeScript strict mode, TDD workflow, cross-platform consistency, performance standards, component architecture patterns, and security/privacy requirements are all met.

## Phase 0: Research & Technical Decisions

*Research tasks to resolve unknowns and establish technical patterns*

### Research Tasks

1. **Expo Router Navigation Patterns**
   - **Question**: What are best practices for Expo Router 4.x with tab navigation, nested route groups, and protected routes?
   - **Need**: Understand how to implement tab navigation with notification badges, route guards for onboarding completion, and deep linking support
   - **Output**: Navigation architecture decision in research.md

2. **Supabase Realtime for Messaging**
   - **Question**: How to implement real-time messaging with Supabase Realtime subscriptions, handle reconnection, and sync with Redux state?
   - **Need**: Architecture for bidirectional messaging with delivery status, read receipts, and offline queue
   - **Output**: Messaging architecture decision in research.md

3. **Matching Algorithm Design**
   - **Question**: What are effective compatibility scoring algorithms for sponsor/sponsee matching based on recovery program, location, availability, and preferences?
   - **Need**: Algorithm that balances multiple criteria, prevents spam, and improves with user feedback
   - **Output**: Matching algorithm design in research.md

4. **Offline-First Architecture**
   - **Question**: How to implement offline support with Redux Persist, optimistic updates, and background sync?
   - **Need**: 80% of screens must be viewable offline with cached data, changes must sync when online
   - **Output**: Offline strategy in research.md

5. **Cross-Platform Image Optimization**
   - **Question**: Best practices for responsive images across iOS, Android, Web with WebP support, lazy loading, and different screen densities?
   - **Need**: Images must be optimized for bundle size and performance without sacrificing quality
   - **Output**: Image optimization strategy in research.md

6. **Accessibility Testing Setup**
   - **Question**: How to set up automated accessibility testing with Playwright for WCAG 2.1 AA compliance across platforms?
   - **Need**: Verify color contrast, screen reader support, touch target sizes, keyboard navigation
   - **Output**: Accessibility testing approach in research.md

7. **State Management Patterns**
   - **Question**: What are Redux Toolkit best practices for normalized data, async thunks, optimistic updates, and Realtime integration?
   - **Need**: Efficient state updates without prop drilling, minimal re-renders, consistent patterns
   - **Output**: State management architecture in research.md

### Expected Output

`research.md` with decisions for:
- Navigation architecture (Expo Router patterns, route guards, deep linking)
- Messaging architecture (Supabase Realtime integration, offline queue, delivery status)
- Matching algorithm (compatibility scoring, filtering, spam prevention)
- Offline strategy (Redux Persist, optimistic updates, background sync)
- Image optimization (responsive images, WebP, lazy loading)
- Accessibility testing (Playwright setup, WCAG compliance verification)
- State management (Redux Toolkit patterns, normalization, Realtime sync)

## Phase 1: Design & Contracts

*Design artifacts before implementation*

### Database Schema (data-model.md)

**Entities to model**:
1. User Profile (extends auth.users from 001-auth-screens)
2. Onboarding Progress
3. Sobriety Record
4. Match
5. Connection
6. Message
7. Notification Preferences

**Requirements**:
- All tables MUST have Row Level Security (RLS) policies
- Foreign keys MUST reference auth.users table from Supabase Auth
- Indexes MUST be created for frequent query patterns
- Timestamps MUST use `timestamptz` for timezone awareness
- Soft deletes MUST be used for user data (privacy compliance)

### API Contracts (contracts/)

**Generate OpenAPI/GraphQL schemas for**:

1. **profiles.yaml**: User profile CRUD
   - GET /profiles/:id - Read profile
   - PATCH /profiles/:id - Update profile
   - GET /profiles/:id/completion - Get profile completion percentage

2. **onboarding.yaml**: Onboarding flow
   - GET /onboarding/progress - Get current onboarding step
   - POST /onboarding/role - Select role (sponsor/sponsee)
   - POST /onboarding/profile - Submit profile form
   - POST /onboarding/complete - Mark onboarding complete

3. **sobriety.yaml**: Sobriety tracking
   - GET /sobriety/record - Get sobriety record
   - POST /sobriety/date - Set sobriety start date
   - POST /sobriety/reflection - Add daily reflection
   - GET /sobriety/milestones - Get milestone history

4. **matches.yaml**: Matching algorithm
   - GET /matches - Get suggested matches (filtered, paginated)
   - GET /matches/:id - Get match profile details
   - POST /matches/:id/request - Send connection request
   - POST /matches/:id/decline - Decline match (30-day cooldown)

5. **connections.yaml**: Connection management
   - GET /connections - Get all connections (pending, active, past)
   - POST /connections/:id/accept - Accept connection request
   - POST /connections/:id/decline - Decline connection request
   - POST /connections/:id/end - End active connection
   - GET /connections/:id/profile - Get connection profile

6. **messages.yaml**: Real-time messaging
   - GET /messages/threads - Get message threads
   - GET /messages/threads/:id - Get thread messages (paginated)
   - POST /messages/threads/:id/send - Send message
   - PATCH /messages/:id/read - Mark message as read
   - WS /messages/subscribe - Subscribe to real-time updates (Supabase Realtime)

### Local Development Guide (quickstart.md)

**Include**:
- Prerequisites (Node 18+, pnpm 8+, Expo CLI, Supabase CLI)
- Environment setup (.env configuration)
- Database setup (migrations, seed data)
- Running the app (iOS simulator, Android emulator, Web browser)
- Running tests (unit, integration, E2E)
- Common troubleshooting (build issues, emulator problems, database connection)

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to:
- Add new Redux slices to context (profile, onboarding, sobriety, matches, connections, messages)
- Add new service layers to context
- Add new hook patterns to context
- Preserve manual additions between markers

## Phase 2: Work Breakdown (Not in this command)

*Generated by `/speckit.tasks` command*

The `/speckit.tasks` command will generate `tasks.md` with:
- Grouped work packages aligned with user story priorities
- Parallel execution opportunities identified
- Each task with specific prompts for implementation
- TDD requirements embedded in each task
- Constitution compliance verification steps

---

## Next Steps After Planning

1. ✅ Review this plan for technical accuracy
2. 🔄 Run `/speckit.plan` completion steps:
   - Generate research.md (Phase 0)
   - Generate data-model.md (Phase 1)
   - Generate contracts/ (Phase 1)
   - Generate quickstart.md (Phase 1)
   - Update agent context
3. ⏭️ Run `/speckit.tasks` to generate work packages
4. 🚀 Begin implementation following TDD workflow

## Notes

- **Dependency**: Feature 001-auth-screens must be complete before starting this feature
- **Database**: All migrations will extend existing auth schema from Supabase
- **Testing**: Playwright E2E tests will validate critical user journeys across iOS, Android, Web
- **Performance**: Bundle analysis required before merge to verify size targets
- **Accessibility**: VoiceOver (iOS) and TalkBack (Android) testing required for each screen
