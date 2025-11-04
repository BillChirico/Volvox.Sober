# Implementation Plan: Volvox.Sober Recovery Platform

**Branch**: `001-volvox-sober-recovery` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/kitty-specs/001-volvox-sober-recovery/spec.md`

## Summary

Volvox.Sober is a cross-platform mobile application (iOS and Android) for sobriety support, enabling authentic peer accountability through curated sponsor/sponsee matching. The platform connects individuals in recovery with experienced mentors through an intelligent SQL-based matching algorithm, provides structured 12-step AA worksheets with sponsor editing capabilities, supports hybrid communication (in-app messaging + optional external contact), and tracks sobriety with full mutual visibility between sponsors and sponsees.

**Technical Approach**:
- **Frontend**: React Native for unified iOS/Android codebase with native performance
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Matching**: SQL-based weighted scoring using PostgreSQL queries
- **Realtime**: Supabase Realtime subscriptions for messaging
- **Notifications**: Supabase Edge Functions triggered by pg_cron for scheduled events

## Technical Context

**Language/Version**: TypeScript 5.x (React Native), PostgreSQL 15+ (Supabase)
**Primary Dependencies**:
- Frontend: React Native 0.73+, React Navigation, Supabase JS Client
- Backend: Supabase (includes PostgreSQL, PostgREST, GoTrue auth, Realtime)
- Testing: Jest, React Native Testing Library, Playwright for E2E

**Storage**: PostgreSQL via Supabase with Row Level Security (RLS) for data privacy
**Testing**: Jest + React Native Testing Library (unit/integration), Playwright (E2E), Contract tests for API schemas
**Target Platform**: iOS 14+ and Android 8.0+ (API 26+)
**Project Type**: Mobile + API (React Native mobile apps + Supabase backend)
**Performance Goals**:
- API responses < 200ms p95
- UI interactions < 100ms
- App launch < 2 seconds on mid-range devices
- Real-time message delivery < 5 seconds under normal network

**Constraints**:
- Mobile memory footprint < 150MB under normal use
- Battery efficient (minimize background processing)
- Offline-first for core features (step work viewing, cached messages, sobriety tracking)
- WCAG 2.1 Level AA accessibility compliance
- Dark/light mode support across all screens

**Scale/Scope**:
- Target: 10,000+ concurrent users
- Estimated database size: ~100K users, ~500K connections, ~5M messages
- 50+ screens/routes across iOS and Android
- 12 structured step worksheets per user
- Real-time messaging infrastructure

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Code Quality & Maintainability
- **Status**: PASS - React Native + TypeScript provides strong typing and component modularity
- **Evidence**: TypeScript enforces type safety, React component model supports single responsibility principle, Supabase client library encourages clean API abstractions
- **Actions**: Will establish ESLint/Prettier config, component design system, and code review checklist

### ✅ Test-Driven Development (NON-NEGOTIABLE)
- **Status**: PASS - TDD workflow mandatory for all features
- **Evidence**: Jest/React Native Testing Library for unit tests, Playwright for E2E, Supabase schema validation for contract tests
- **Actions**:
  - Write tests BEFORE implementation (Red-Green-Refactor)
  - Minimum 80% coverage target for business logic
  - Integration tests for all database operations via Supabase
  - Contract tests for API schemas and data models
  - No test skipping; CI blocks merges on failures

### ✅ User Experience Consistency
- **Status**: PASS - React Native component system supports consistent UI
- **Evidence**:
  - React Navigation for consistent navigation patterns
  - Styled Components / React Native Paper for design system
  - Dark/light mode theming built into design system
  - Accessibility props available on all React Native components
- **Actions**: Create shared component library, establish spacing/typography scale, implement accessibility audits in testing phase

### ✅ Performance Requirements
- **Status**: PASS - React Native + Supabase architecture meets performance goals
- **Evidence**:
  - Supabase provides sub-200ms API responses for indexed queries
  - React Native achieves 60fps scrolling with FlatList virtualization
  - Offline support via Supabase client caching layer
  - Efficient data sync with incremental updates
- **Actions**: Performance testing with realistic data volumes, monitoring with Sentry/analytics, optimize query indexes

### ✅ Leverage MCPs & Skills
- **Status**: PASS - Plan explicitly uses MCP servers and Skills
- **Evidence**:
  - **Context7**: For React Native, Supabase documentation and best practices
  - **Sequential**: For complex matching algorithm design, error handling patterns
  - **Magic**: For UI component generation (forms, lists, modals)
  - **Playwright**: For E2E testing of user journeys
  - **TDD Skill**: Mandatory for all feature development
  - **Systematic Debugging Skill**: For production issue investigation
- **Actions**: Reference MCP servers throughout implementation, enforce TDD workflow via Skills

### Security & Privacy Compliance
- **Status**: PASS with mitigation plan
- **Evidence**: Supabase provides:
  - Encryption at rest and in transit (TLS)
  - Row Level Security (RLS) for authorization
  - JWT-based authentication
  - Audit logging built-in
- **Risks**:
  - Sensitive recovery data (sobriety dates, relapses, step work) requires careful RLS policies
  - HIPAA compliance may be required for health data (consult legal)
- **Actions**:
  - Implement strict RLS policies (users access only their data + connected sponsor/sponsee data)
  - Privacy policy and consent flow during onboarding
  - Data export and deletion features per GDPR
  - Regular dependency audits (npm audit, Dependabot)

### Conclusion
**All gates PASSED**. Proceed to Phase 0 research with confidence that architecture aligns with constitution principles.

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-volvox-sober-recovery/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (pending)
├── data-model.md        # Phase 1 output (pending)
├── quickstart.md        # Phase 1 output (pending)
├── contracts/           # Phase 1 output (pending)
│   ├── api-schema.yaml  # OpenAPI/Supabase RPC definitions
│   ├── database.sql     # PostgreSQL schema migrations
│   └── types.ts         # TypeScript type definitions
└── tasks.md             # Phase 2 output (created by /spec-kitty.tasks)
```

### Source Code (repository root)

```
mobile/                       # React Native application
├── src/
│   ├── components/          # Shared UI components
│   │   ├── design-system/   # Button, Input, Card, etc.
│   │   ├── features/        # Feature-specific components
│   │   └── layouts/         # Screen layouts, navigation
│   ├── screens/             # Top-level route screens
│   │   ├── auth/            # Login, signup, onboarding
│   │   ├── matching/        # Sponsor matches, requests
│   │   ├── sobriety/        # Tracking, milestones, relapses
│   │   ├── steps/           # 12-step worksheets
│   │   ├── messaging/       # Chat, check-ins
│   │   └── profile/         # Settings, preferences
│   ├── services/            # Business logic layer
│   │   ├── api/             # Supabase client wrapper
│   │   ├── matching/        # Matching algorithm logic
│   │   ├── notifications/   # Push notification handling
│   │   └── storage/         # Local storage/cache
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # React Navigation config
│   ├── theme/               # Design tokens, dark/light themes
│   └── types/               # TypeScript type definitions
├── tests/
│   ├── unit/                # Component & service tests
│   ├── integration/         # Multi-service interactions
│   └── e2e/                 # Playwright end-to-end tests
├── android/                 # Native Android config
├── ios/                     # Native iOS config
└── package.json

supabase/                     # Backend infrastructure
├── migrations/              # Database schema migrations
│   └── 001_initial_schema.sql
├── functions/               # Edge Functions
│   ├── match-users/         # Matching algorithm endpoint
│   ├── send-notifications/  # Scheduled notification sender
│   └── check-milestones/    # Daily milestone checker
├── seed.sql                 # Test data for development
└── config.toml              # Supabase project config
```

**Structure Decision**:
- **Mobile**: Single React Native codebase in `/mobile` directory compiles to both iOS and Android
- **Backend**: Supabase configuration and migrations in `/supabase` directory
- **Separation Rationale**: Mobile app is the primary user-facing product; Supabase provides managed backend services requiring only schema definitions and Edge Functions

## Complexity Tracking

*No constitution violations detected. All architectural decisions align with established principles.*

---

## Phase 0: Research & Scaffolding

**Status**: Pending execution of `/spec-kitty.research`

**Research Questions** (to be answered in research.md):

1. **React Native Navigation Architecture**
   - Research: Best practices for deeply nested navigation (tabs + stacks for sponsor dashboard, step work, messaging)
   - Decision needed: React Navigation stack/tab composition strategy
   - Impact: Navigation structure affects state management and deep linking

2. **Supabase Realtime Scaling**
   - Research: Realtime connection limits on Supabase Pro tier, best practices for connection pooling
   - Decision needed: Realtime subscription strategy (per-conversation vs global listener)
   - Impact: Determines real-time architecture and scaling characteristics

3. **Offline Data Sync Strategy**
   - Research: Supabase offline support patterns, conflict resolution for concurrent edits
   - Decision needed: Optimistic UI updates + sync queue vs pessimistic locking
   - Impact: User experience during poor connectivity, data consistency guarantees

4. **Push Notification Infrastructure**
   - Research: Firebase Cloud Messaging vs native push via Expo Notifications
   - Decision needed: Notification service selection and deep linking strategy
   - Impact: Reliability of check-ins and milestone celebrations

5. **PostgreSQL Full-Text Search for Sponsor Matching**
   - Research: Full-text search vs trigram similarity for user bio/values matching
   - Decision needed: Search indexing strategy for compatibility scoring
   - Impact: Match quality and query performance

6. **React Native State Management**
   - Research: Context API + Hooks vs Redux vs Zustand for global state
   - Decision needed: State management library selection
   - Impact: Code complexity, developer experience, performance

7. **Form Validation for Step Work**
   - Research: Formik vs React Hook Form vs uncontrolled forms for step worksheets
   - Decision needed: Form library selection for complex multi-field step work
   - Impact: User experience, validation logic complexity

8. **Accessibility Testing Tools**
   - Research: React Native accessibility testing tools and WCAG compliance verification
   - Decision needed: Automated accessibility testing strategy
   - Impact: Compliance confidence and development workflow

**Deliverable**: `research.md` with decisions, rationale, and alternatives for each question

---

## Phase 1: Design & Contracts

**Status**: Pending (starts after Phase 0 completion)

### 1.1 Data Model (`data-model.md`)

Extract entities from spec.md and define:

**Core Entities**:
- User (base entity for both sponsors and sponsees)
- SponsorProfile (extends User with capacity, preferences)
- SponseeProfile (extends User with step progress, preferences)
- SobrietyDate (tracks one sobriety journey per substance)
- Relapse (logs slip events with optional private notes)
- ConnectionRequest (pending sponsor/sponsee connections)
- Connection (active sponsor/sponsee relationships)
- Step (12 AA steps with default questions)
- StepWork (user's responses to step questions)
- Message (in-app text communication)
- CheckIn (recurring check-in schedules)
- CheckInResponse (completed check-in answers)
- Notification (system-generated alerts)
- Match (computed sponsor/sponsee compatibility pairings)

**Relationships**:
- User 1:N SobrietyDate
- SobrietyDate 1:N Relapse
- User (as sponsee) 1:N ConnectionRequest
- User (as sponsor) 1:N ConnectionRequest
- ConnectionRequest 1:1 Connection (when accepted)
- Connection 1:N Message
- Connection 1:N CheckIn
- CheckIn 1:N CheckInResponse
- User (as sponsee) 1:N StepWork
- StepWork N:1 Step
- User 1:N Notification
- User (as sponsee) 1:N Match

**State Machines**:
- ConnectionRequest: pending → accepted/declined/expired
- StepWork: not_started → in_progress → completed
- CheckIn: active/paused
- Connection: active → on_hiatus/disconnected

### 1.2 API Contracts (`contracts/`)

**Database Schema** (`contracts/database.sql`):
- PostgreSQL migrations for all entities
- Row Level Security (RLS) policies for data privacy
- Indexes for matching algorithm queries (geography, sobriety_time, preferences)
- Triggers for milestone calculations and notification generation

**TypeScript Types** (`contracts/types.ts`):
- TypeScript interfaces matching database schema
- API request/response types
- Supabase client type generation from schema

**Supabase Functions** (`contracts/api-schema.yaml`):
- Edge Function signatures for:
  - `match-users`: Calculate sponsor/sponsee compatibility scores
  - `send-notifications`: Send push notifications for check-ins/milestones
  - `check-milestones`: Daily cron job to detect sobriety milestones

### 1.3 Quickstart Guide (`quickstart.md`)

Development environment setup:
1. Install Node.js 18+, npm, React Native CLI
2. Install Xcode (iOS) and/or Android Studio
3. Install Supabase CLI: `npm install -g supabase`
4. Clone repo and install dependencies: `npm install`
5. Start Supabase local dev: `supabase start`
6. Run migrations: `supabase db push`
7. Seed test data: `supabase db seed`
8. Start React Native: `npm run ios` or `npm run android`
9. Run tests: `npm test`

### 1.4 Agent Context Update

Run: `.kittify/scripts/bash/update-agent-context.sh claude`

Adds to `.claude/CLAUDE.md`:
```markdown
## Volvox.Sober Technology Stack

- **Mobile**: React Native 0.73+ with TypeScript
- **Backend**: Supabase (PostgreSQL 15, Auth, Realtime, Edge Functions)
- **State Management**: [Decision from research.md]
- **Navigation**: React Navigation 6.x
- **Testing**: Jest, React Native Testing Library, Playwright
- **Notifications**: [Decision from research.md - FCM or Expo]
```

---

## Next Steps

After this command completes:

1. **Review Research Findings**: Read `research.md` and confirm technical decisions
2. **Validate Data Model**: Review `data-model.md` for entity completeness
3. **Inspect Contracts**: Verify `contracts/` schemas match spec requirements
4. **Run Quickstart**: Follow `quickstart.md` to set up local development environment
5. **Generate Tasks**: Run `/spec-kitty.tasks` to break down implementation into actionable work packages
6. **Begin Implementation**: Start TDD cycle for P1 user stories (matching, connection requests)

**Command ends here.** Implementation planning artifacts generated; ready for task breakdown.
