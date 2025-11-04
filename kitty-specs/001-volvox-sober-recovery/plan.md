# Implementation Plan: Volvox.Sober Recovery Platform

**Branch**: `001-volvox-sober-recovery` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/kitty-specs/001-volvox-sober-recovery/spec.md`

## Summary

Volvox.Sober is a cross-platform mobile application (iOS and Android) that facilitates authentic peer accountability in addiction recovery through the AA 12-step program. The platform connects individuals in recovery with experienced mentors through intelligent matching, provides structured digital worksheets for step work, and enables ongoing communication and progress tracking with mutual sobriety visibility.

**Technical Approach**: React Native application with Supabase backend (PostgreSQL + Realtime + Auth + Edge Functions). Weighted scoring algorithm for sponsor-sponsee matching. Offline-first architecture with automatic sync. Standard web security with Row Level Security policies.

## Technical Context

**Language/Version**: TypeScript 5.x (React Native 0.73+), Node.js 18+ for Edge Functions
**Primary Dependencies**:

- Frontend: React Native, React Navigation, React Native Paper (UI), Redux Toolkit + RTK Query, AsyncStorage
- Backend: Supabase (PostgreSQL 15+, Realtime, Auth, Edge Functions), Deno 1.x for Edge Functions
- Real-time: Supabase Realtime subscriptions (PostgreSQL LISTEN/NOTIFY)
- Push Notifications: Firebase Cloud Messaging (FCM) for both iOS and Android

**Storage**:

- Primary: Supabase PostgreSQL 15+ (relational data: users, connections, messages, step work)
- Local: AsyncStorage for offline data caching and user preferences
- Files: Supabase Storage for profile photos

**Testing**:

- Unit: Jest + React Native Testing Library
- Integration: Supertest for API endpoints, Supabase local dev environment
- E2E: Detox for mobile app flows
- Contract: JSON Schema validation for API contracts

**Target Platform**:

- iOS 14.0+ (iPhone and iPad)
- Android 8.0+ (API level 26+)
- Cross-platform feature parity using React Native platform-specific modules when needed

**Project Type**: Mobile + API (React Native mobile app + Supabase backend services)

**Performance Goals**:

- Message delivery: <5 seconds under normal network conditions
- Matching algorithm: <60 seconds to generate 3-5 matches
- Dashboard load: <3 seconds for sponsor dashboard with all sponsee progress
- Theme switching: <1 second with no visual glitches
- Offline sync: Automatic background sync when connectivity restored

**Constraints**:

- Scheduled check-in notifications: delivered within 2-minute window
- Push notification delivery: 90%+ success rate
- System uptime: 99.5% excluding planned maintenance
- Text/UI contrast: WCAG AA standards (4.5:1 ratio) in both themes
- Offline functionality: core features (step work viewing, message reading, sobriety stats) accessible without network

**Scale/Scope**:

- MVP Target: 10,000 concurrent users without performance degradation
- Data Model: 15+ entities (User, SobrietyDate, Connection, StepWork, Message, etc.)
- User Stories: 7 stories (3 P1, 3 P2, 1 P3) covering matching, tracking, step work, communication
- Screens: ~25-30 screens (onboarding, profiles, matching, messaging, step work, dashboards, settings)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Initial Status** (Pre-Research): Constitution file contains placeholder template only. No specific project principles defined yet.

**Action Required**: Since no constitution principles exist, proceeding with standard software development best practices:

- Test-First Development: Write tests before implementation for critical flows
- Security-First: Row Level Security policies for all data access
- Offline-First: Local caching and sync for core features
- Accessibility: WCAG AA compliance for all UI elements

**Post-Design Re-evaluation** (Phase 1 Complete): ✅

After completing design artifacts (research.md, data-model.md, contracts/, quickstart.md), the following patterns should be codified into project constitution:

### Recommended Constitution Principles

1. **Data Modeling Standards**
   - All tables MUST have `created_at` and `updated_at` timestamps
   - All user-generated data MUST have RLS policies defined
   - Foreign keys MUST use `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately
   - Sensitive data (step work notes, relapse notes) MUST have access restrictions in RLS

2. **API Contract Standards**
   - All Edge Functions MUST have OpenAPI 3.0 specifications in `/contracts/`
   - All endpoints MUST require JWT authentication except `/auth/*`
   - All responses MUST follow standard error format (see auth.yaml)
   - All mutations MUST be idempotent where possible

3. **Security Policies**
   - RLS policies MUST be tested with automated tests for unauthorized access attempts
   - User passwords MUST be handled exclusively by Supabase Auth (never stored in app)
   - Private data (relapse notes) MUST be filtered at application layer even if RLS permits read
   - All external contact sharing (phone, email) MUST be opt-in only

4. **Offline-First Architecture**
   - Core features (sobriety tracking, step work viewing, message reading) MUST work offline
   - All writes MUST queue locally when offline and sync when online
   - Conflict resolution MUST preserve both versions for manual merge on critical data (step work)
   - Sync status MUST be visible to user in UI

5. **Testing Requirements**
   - Unit tests required for all business logic (Redux slices, services)
   - Integration tests required for all Supabase operations (RLS policy validation)
   - E2E tests required for P1 user stories (matching, connections, sobriety tracking)
   - Contract tests required for Edge Function APIs

**Decision**: Recommend creating constitution file with above principles before implementation phase begins. This ensures consistent patterns across all development work.

**Next Action**: If approved, create `.kittify/memory/constitution.md` with these principles before running `/spec-kitty.tasks`.

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-volvox-sober-recovery/
├── plan.md              # This file (/spec-kitty.plan output)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Developer setup and architecture guide
├── contracts/           # Phase 1: API contracts and schemas
│   ├── auth.yaml       # Authentication endpoints (signup, login, password reset)
│   ├── users.yaml      # User profile and preferences
│   ├── matching.yaml   # Sponsor-sponsee matching algorithm
│   ├── connections.yaml # Connection requests and management
│   ├── sobriety.yaml   # Sobriety tracking and milestones
│   ├── steps.yaml      # 12-step worksheets and progress
│   └── messages.yaml   # In-app messaging and check-ins
└── tasks.md             # Phase 2: Work packages (/spec-kitty.tasks - not created yet)
```

### Source Code (repository root)

```
# Mobile + API Architecture (React Native + Supabase)

# React Native Mobile App
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Buttons, inputs, cards, modals
│   │   ├── matching/       # Match cards, compatibility indicators
│   │   ├── messaging/      # Message bubbles, check-in prompts
│   │   ├── stepwork/       # Step worksheet components
│   │   └── tracking/       # Sobriety calendars, milestone displays
│   ├── screens/            # Top-level screen components
│   │   ├── auth/           # Onboarding, login, signup
│   │   ├── profile/        # User profiles and preferences
│   │   ├── matching/       # Browse matches, connection requests
│   │   ├── dashboard/      # Sponsee and sponsor dashboards
│   │   ├── sobriety/       # Sobriety tracking and milestones
│   │   ├── stepwork/       # 12-step worksheets
│   │   ├── messaging/      # Conversations and check-ins
│   │   └── settings/       # App settings and theme
│   ├── navigation/         # React Navigation configuration
│   ├── store/              # Redux state management
│   │   ├── slices/         # Feature-based state slices
│   │   └── api/            # RTK Query API definitions
│   ├── services/           # Business logic and utilities
│   │   ├── supabase.ts     # Supabase client configuration
│   │   ├── notifications.ts # FCM push notification handling
│   │   ├── offline.ts      # Offline sync logic
│   │   └── realtime.ts     # Realtime subscription management
│   ├── hooks/              # Custom React hooks
│   ├── theme/              # Theme definitions (light/dark)
│   └── types/              # TypeScript type definitions
├── android/                # Android native code
├── ios/                    # iOS native code
└── __tests__/             # Mobile app tests
    ├── unit/
    ├── integration/
    └── e2e/

# Supabase Backend
supabase/
├── migrations/             # PostgreSQL schema migrations
│   └── [timestamp]_*.sql  # Versioned schema changes
├── functions/              # Edge Functions (Deno)
│   ├── matching-algorithm/ # Sponsor-sponsee matching logic
│   ├── notifications/      # Push notification dispatch
│   └── scheduled-tasks/    # Cron jobs (milestone checks, check-in reminders)
├── seed.sql               # Development seed data
└── config.toml            # Supabase project configuration

# Shared Types and Contracts
shared/
└── types/                  # Shared TypeScript types
    ├── entities/          # Database entity types
    ├── api/               # API request/response types
    └── contracts/         # Contract validation schemas

# Root configuration
├── package.json           # Root package manifest
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview and setup
```

**Structure Decision**: Selected **Mobile + API** architecture because:

1. Spec explicitly requires iOS and Android mobile apps with feature parity
2. Supabase Edge Functions provide serverless backend logic (matching algorithm, notifications)
3. PostgreSQL migrations manage schema evolution with version control
4. Shared types ensure consistency between mobile client and backend contracts
5. Separation allows independent development and testing of mobile vs backend concerns

## Complexity Tracking

_No constitution violations to justify - proceeding with standard architecture._

---

## Phase 0: Research & Technology Validation

**Status**: PENDING - Will run `/spec-kitty.research` to scaffold research artifacts

**Research Tasks** (to be expanded in research.md):

1. **React Native 0.73+ Setup**: Validate React Native version supports iOS 14+ and Android 8.0+, document setup with TypeScript
2. **Supabase Integration**: Validate Supabase JS client v2.x with React Native, test Realtime subscriptions on mobile
3. **Offline Sync Patterns**: Research AsyncStorage + Redux Persist for offline-first architecture, identify conflict resolution patterns
4. **Push Notifications**: Validate FCM integration for both iOS and Android, document APNs certificates and FCM setup
5. **Matching Algorithm Design**: Research weighted scoring algorithms, identify compatibility factors and scoring weights
6. **Row Level Security Patterns**: Design RLS policies for user data isolation (sponsors can't see non-connected sponsees' step work)
7. **Real-time Messaging**: Validate Supabase Realtime for message delivery, test message ordering and read receipts
8. **Dark Mode Implementation**: Research React Native theming with React Native Paper, validate WCAG AA contrast ratios

**Next Step**: Run `/spec-kitty.research` command to scaffold research.md and begin systematic research.

---

## Phase 1: Design Artifacts

**Status**: PENDING - Awaits Phase 0 completion

**Deliverables**:

1. **data-model.md**: Complete entity definitions with fields, relationships, validation rules
2. **contracts/**: OpenAPI 3.0 specifications for all API endpoints
3. **quickstart.md**: Developer setup guide with architecture diagrams

**Next Step**: After Phase 0 research complete, generate design artifacts based on research findings.

---

## Phase 2: Task Planning

**Status**: PENDING - Will run `/spec-kitty.tasks` after Phase 1 complete

**Approach**: Generate work packages organized by priority (P1 → P2 → P3) from user stories in spec.md

**Note**: This plan document ends at Phase 1. Task generation is a separate command.
