# Research: Volvox.Sober Recovery Platform

**Feature**: 001-volvox-sober-recovery
**Research Date**: 2025-11-03
**Researcher**: Claude (via /spec-kitty.plan planning interrogation)
**Status**: Planning phase research complete

## Executive Summary

This document captures the technology research and architectural decisions made during the planning phase for Volvox.Sober, a cross-platform mobile recovery support application. All decisions were validated through interactive planning interrogation with the project stakeholder.

**Key Decisions**:

- **Mobile Framework**: React Native (TypeScript) for cross-platform development
- **Backend**: Supabase (PostgreSQL + Realtime + Auth + Edge Functions)
- **Matching Algorithm**: Weighted scoring (not ML-based for MVP)
- **Real-time Communication**: Supabase Realtime subscriptions
- **Security Posture**: Standard web security with Row Level Security policies

---

## Decision 1: Cross-Platform Mobile Framework

### Decision

**Chosen**: React Native 0.73+ with TypeScript 5.x

### Rationale

1. **Single Codebase**: Develop once, deploy to both iOS (14.0+) and Android (8.0+) with feature parity
2. **Strong Ecosystem**: Mature libraries for real-time messaging (Socket.IO compatibility), offline storage (AsyncStorage), and push notifications (React Native Firebase)
3. **Developer Experience**: TypeScript provides type safety across the entire stack when shared with backend Edge Functions
4. **Performance**: Sufficient for the app's requirements (forms, lists, messaging) with ability to optimize critical paths with native modules if needed
5. **Time to Market**: Faster than dual native development, more capable than PWA for offline and notifications

### Alternatives Considered

- **Flutter**: Excellent performance and UI, but team has stronger TypeScript/JavaScript experience and Supabase has better React Native integration
- **Native (Swift + Kotlin)**: Maximum platform optimization but 2x development time and maintenance burden
- **PWA**: Simplest deployment but insufficient offline capabilities and limited push notification support

### Evidence

- **Source**: React Native 0.73+ documentation confirms iOS 14+ and Android 8.0+ support [react-native-docs]
- **Source**: Supabase JS Client v2.x officially supports React Native [supabase-docs]
- **Source**: React Native Firebase provides FCM integration for both platforms [rnfirebase-docs]

### Implementation Notes

- Use React Native Paper for Material Design components with theming support
- Configure Metro bundler for proper TypeScript compilation
- Set up platform-specific configuration for iOS (Xcode) and Android (Gradle)
- Configure Hermes engine for better JavaScript performance on Android

---

## Decision 2: Backend Infrastructure

### Decision

**Chosen**: Supabase (PostgreSQL 15+ with Realtime, Auth, Edge Functions, Storage)

### Rationale

1. **Relational Data Model**: The app has complex entity relationships (users, connections, step work, messages) that fit PostgreSQL's strengths
2. **Real-time Built-in**: Supabase Realtime uses PostgreSQL's LISTEN/NOTIFY for efficient message delivery without separate WebSocket infrastructure
3. **Integrated Auth**: Built-in JWT-based authentication with email/password support, reducing custom auth implementation
4. **Row Level Security**: Native PostgreSQL RLS provides fine-grained data access control (sponsors can't see non-connected sponsees' data)
5. **Edge Functions**: Deno-based serverless functions for matching algorithm computation and scheduled tasks (milestone notifications)
6. **Storage**: Built-in object storage for profile photos
7. **Local Development**: Supabase CLI provides Docker-based local environment for development and testing

### Alternatives Considered

- **Firebase**: Excellent real-time and push notifications, but Firestore's NoSQL model less suited for complex relational queries (matching algorithm, step work relationships)
- **Custom Node.js Backend**: Maximum flexibility but requires building auth, real-time, storage, and hosting infrastructure from scratch
- **Hybrid (Supabase + Firebase)**: Adds unnecessary complexity; Supabase can handle push notifications via Edge Functions + FCM

### Evidence

- **Source**: Supabase Realtime supports React Native via WebSocket subscriptions [supabase-realtime-docs]
- **Source**: PostgreSQL RLS policies provide row-level access control for multi-tenant data [postgres-rls-docs]
- **Source**: Supabase Edge Functions use Deno runtime for TypeScript serverless functions [supabase-functions-docs]

### Implementation Notes

- Design database schema with normalized entities for users, connections, messages, step work
- Implement RLS policies for each table to enforce data isolation between users
- Use Edge Functions for compute-heavy operations (matching algorithm) to keep mobile app lightweight
- Configure Supabase project with appropriate rate limits and connection pooling for 10K concurrent users

---

## Decision 3: Matching Algorithm Approach

### Decision

**Chosen**: Weighted Scoring Algorithm (not ML-based)

### Rationale

1. **MVP Scope**: Delivers on spec's promise of "3-5 curated matches" based on "comprehensive compatibility scoring" without requiring ML infrastructure
2. **Transparent Logic**: Weighted scoring is explainable and debuggable, allowing sponsors and sponsees to understand why they were matched
3. **No Training Data**: New platform has no historical connection data to train an ML model effectively
4. **Performance**: Weighted scoring can execute in <60 seconds (spec requirement) using PostgreSQL queries with appropriate indexes
5. **Evolvability**: Can collect connection success data and upgrade to ML in future iterations when sufficient data exists

### Scoring Factors & Weights

- **Geographic Proximity** (25 pts): Closer matches for timezone compatibility and potential in-person meetups
- **Sobriety Time Alignment** (25 pts): Sponsors with sufficient sobriety time (typically 1+ years) for sponsees' needs
- **Communication Preference Alignment** (20 pts): Matching preferred frequency (daily/weekly) and methods (in-app/phone)
- **Demographic Preferences** (15 pts): Gender, age range preferences when specified
- **Availability** (15 pts): Sponsors below capacity threshold, active status

### Alternatives Considered

- **Random Selection**: Simplest but provides no quality matching, likely to result in poor connections
- **ML-Based Recommendation System**: Most sophisticated but premature without training data, adds significant complexity and infrastructure cost
- **Hybrid (Weighted + Future ML)**: Selected weighted scoring as foundation, with plan to evolve based on data

### Evidence

- **Source**: Weighted scoring algorithms widely used in matching systems (dating apps, mentorship platforms) [matching-systems-research]
- **Source**: PostgreSQL full-text search and GIS extensions can handle proximity and preference matching efficiently [postgres-matching]

### Implementation Notes

- Implement matching algorithm as Supabase Edge Function
- Use PostGIS extension for geographic proximity calculations
- Create database indexes on matching criteria columns (location, sobriety_date, preferences)
- Store compatibility reasons in match table for transparency
- Log match quality metrics for future ML training

---

## Decision 4: Real-Time Messaging Architecture

### Decision

**Chosen**: Supabase Realtime Subscriptions (PostgreSQL LISTEN/NOTIFY)

### Rationale

1. **Integrated with Data Layer**: Messages stored in PostgreSQL are automatically broadcast to subscribers, no separate message queue needed
2. **Sufficient for Use Case**: The app's communication is structured (check-ins, sponsor guidance) not high-frequency chat, so Supabase Realtime's latency (<5 seconds) meets spec requirements
3. **Simplified Infrastructure**: No need for separate WebSocket server, Redis pub/sub, or message broker
4. **Offline Resilience**: Messages persist in PostgreSQL; when app comes online, it fetches missed messages via standard queries
5. **Access Control**: RLS policies on messages table ensure users only receive messages for their connections

### Message Flow

1. User A sends message � INSERT into messages table (with connection_id, sender_id, text)
2. PostgreSQL triggers NOTIFY event
3. Supabase Realtime broadcasts to subscribed clients (User B's app listening on connection channel)
4. User B's app receives realtime event � displays message with push notification
5. If User B is offline � message persists in DB, retrieved on next app launch

### Alternatives Considered

- **WebSocket with Socket.IO**: More suitable for high-frequency chat (gaming, collaborative editing) but overkill for structured check-ins and sponsor communication
- **Polling (Check every 5-10 seconds)**: Simpler but higher battery/data usage and worse UX latency
- **Hybrid**: Selected Supabase Realtime as primary, with polling fallback for poor network conditions

### Evidence

- **Source**: Supabase Realtime achieves <5 second message delivery on mobile networks [supabase-realtime-benchmarks]
- **Source**: PostgreSQL LISTEN/NOTIFY efficiently handles moderate message volumes (1000s messages/sec) [postgres-notify-docs]

### Implementation Notes

- Subscribe to connection-specific channels: `connection:{connection_id}`
- Implement reconnection logic with exponential backoff for network interruptions
- Use optimistic UI updates (show sent message immediately, confirm with server ACK)
- Queue outgoing messages locally when offline, sync on reconnect
- Implement read receipts by updating message.read_at timestamp

---

## Decision 5: Offline-First Architecture

### Decision

**Chosen**: AsyncStorage + Redux Persist with Conflict Resolution

### Rationale

1. **Spec Requirement**: FR-065 mandates offline functionality for core features (viewing step work, reading messages, sobriety tracking)
2. **User Context**: Recovery support is critical; app must function during network disruptions (rural areas, poor coverage, airplane mode)
3. **React Native Standard**: AsyncStorage is built-in persistent key-value storage, Redux Persist provides automatic state hydration
4. **Conflict Resolution**: Last-write-wins strategy with server timestamps for most data; manual merge for critical entities (step work)

### Offline Capabilities

- **Read Operations**: View cached step work, message history, sobriety stats, profile data
- **Write Operations Queue**: Sobriety date updates, message sends, step work edits queued locally
- **Sync Strategy**: Background sync when network restored, optimistic UI updates with error rollback

### Sync Conflict Scenarios

- **Message Ordering**: Server timestamps provide canonical ordering
- **Step Work Edits**: Sponsee edits offline � merge with sponsor's comments on sync (both preserved)
- **Sobriety Date Changes**: Most recent timestamp wins
- **Connection State**: Server-side state is authoritative (prevent accepting disconnected sponsors)

### Alternatives Considered

- **Fully Online**: Simpler but violates spec requirement and degrades UX during network issues
- **Local Database (WatermelonDB/Realm)**: More sophisticated sync but adds significant complexity for MVP
- **Service Worker (PWA)**: Insufficient for native mobile app requirements

### Evidence

- **Source**: AsyncStorage provides 6MB+ storage limit on iOS/Android sufficient for local caching [react-native-async-storage]
- **Source**: Redux Persist handles state rehydration and selective persistence [redux-persist-docs]

### Implementation Notes

- Persist Redux slices selectively (user profile, messages, step work, sobriety data)
- Implement sync queue for offline writes with retry logic
- Use NetInfo to detect network state changes and trigger sync
- Display sync status indicator in UI (syncing/synced/offline)
- Implement conflict resolution UI for step work merge conflicts

---

## Decision 6: Push Notification Infrastructure

### Decision

**Chosen**: Firebase Cloud Messaging (FCM) for both iOS and Android

### Rationale

1. **Cross-Platform**: Single SDK (React Native Firebase) handles both iOS (via APNs) and Android (native FCM)
2. **High Delivery Rate**: FCM achieves 90%+ delivery success rate (meets spec SC-005)
3. **Rich Notifications**: Support for images, actions, data payloads
4. **Scheduling**: Can schedule check-in reminders server-side
5. **Cost**: Free tier sufficient for MVP scale (10K users)

### Notification Types

- **Connection Requests**: Sponsor receives notification when sponsee sends request
- **Request Accepted/Declined**: Sponsee notified of sponsor's decision
- **New Messages**: Both parties notified of new messages
- **Check-In Reminders**: Scheduled notifications for recurring check-ins
- **Milestone Celebrations**: Automatic notifications at 30/60/90 day milestones
- **Relapse Alerts**: Sponsor notified when sponsee logs relapse

### Implementation Flow

1. Mobile app registers FCM token on user login
2. Token stored in Supabase users table (fcm_token column)
3. Supabase Edge Function triggered by events (new message INSERT, milestone date reached)
4. Edge Function calls FCM API with user's token and notification payload
5. FCM delivers to device, app handles notification tap to deep link into relevant screen

### Alternatives Considered

- **Native Push Notifications Only**: Requires separate implementation for iOS (APNs) and Android (FCM)
- **OneSignal/Pusher**: Third-party services add cost and dependency; FCM is free and direct
- **In-App Polling**: Poor battery life and latency, not a replacement for system notifications

### Evidence

- **Source**: React Native Firebase provides unified API for FCM on both platforms [rnfirebase-messaging]
- **Source**: FCM free tier supports unlimited notifications [fcm-pricing]

### Implementation Notes

- Request notification permissions during onboarding
- Implement notification preference toggles (disable specific notification types)
- Support quiet hours (no notifications during user-defined sleep times)
- Handle notification taps with deep linking to relevant screens (message thread, connection request)
- Implement badge count updates for unread messages

---

## Decision 7: Row Level Security (RLS) Design

### Decision

**Chosen**: PostgreSQL RLS Policies for Fine-Grained Access Control

### Rationale

1. **Data Isolation**: Ensures users only access their own data and data from connected relationships
2. **Defense in Depth**: Even if application logic has bugs, database enforces access rules
3. **Spec Requirement**: FR-032 requires sponsee step work visible only to connected sponsors
4. **Audit Trail**: RLS policies provide clear, reviewable security rules in SQL

### RLS Policy Examples

**Users Table**:

- Users can read their own profile
- Users can read profiles of potential matches (sponsors with capacity, meeting preferences)
- Users cannot read profiles of unconnected users outside matching context

**Messages Table**:

- Users can only read messages where they are sender or recipient
- Messages must belong to an active connection
- Archived connections have 90-day read access (FR-061)

**StepWork Table**:

- Sponsees can read/write their own step work
- Sponsors can read step work of their connected sponsees
- Sponsors cannot read step work of non-connected users

**Connections Table**:

- Both sponsor and sponsee can read their own connections
- Connection requests visible only to sponsor before acceptance
- Disconnected relationships archived but accessible for 90 days

### Alternatives Considered

- **Application-Layer Authorization**: More flexible but error-prone, no database-level enforcement
- **Separate Databases per User**: Excessive infrastructure complexity
- **API Gateway Authorization**: Adds latency and doesn't protect against direct database access

### Evidence

- **Source**: PostgreSQL RLS provides row-level security without application code changes [postgres-rls-security]
- **Source**: Supabase Auth integrates with RLS using JWT claims for user_id [supabase-auth-rls]

### Implementation Notes

- Define RLS policies in Supabase migrations (version controlled)
- Use Supabase auth.uid() function in policies to reference current user
- Test RLS policies thoroughly with automated tests (attempt unauthorized access)
- Document RLS policies in data-model.md for developer reference

---

## Decision 8: Dark Mode Implementation

### Decision

**Chosen**: React Native Paper Theming with System Preference Support

### Rationale

1. **Spec Requirement**: FR-055 to FR-058 mandate light/dark mode with system preference option
2. **Library Support**: React Native Paper provides built-in theming with color schemes for both modes
3. **WCAG Compliance**: Material Design color schemes meet WCAG AA contrast standards (4.5:1 ratio)
4. **Persistence**: Theme preference stored in AsyncStorage and restored on app launch

### Theme System

- **Light Theme**: Default Material Design light color scheme
- **Dark Theme**: Material Design dark color scheme with elevated surfaces
- **System Default**: Follow device appearance setting (iOS Settings > Display > Appearance, Android Settings > Display > Dark theme)
- **Manual Override**: User can force light or dark regardless of system setting

### Accessibility Considerations

- All text meets WCAG AA contrast standards (4.5:1 ratio)
- Form inputs have visible focus indicators in both themes
- Buttons have sufficient touch target size (44x44pt minimum)
- Color is not the only indicator for interactive elements

### Alternatives Considered

- **Custom Theming System**: More control but requires manual WCAG testing and maintenance
- **Styled Components Theming**: Valid option but React Native Paper is more battle-tested for Material Design

### Evidence

- **Source**: React Native Paper supports theming with built-in light/dark schemes [rnpaper-theming]
- **Source**: Material Design color system meets WCAG AA standards [material-accessibility]

### Implementation Notes

- Define theme colors in theme/ directory with light and dark variants
- Use React context to provide theme throughout component tree
- Implement theme toggle in settings screen
- Test all screens in both themes during development
- Use design system tokens (colors.primary, colors.surface) instead of hard-coded hex values

---

## Open Questions & Risks

### Questions for Implementation Phase

1. **Age Restriction**: Does the platform require users to be 18+ for legal compliance, or is parental consent sufficient for minors? (Assumption 14 in spec)
   - **Impact**: Affects onboarding flow and user verification requirements
   - **Action**: Clarify legal requirements before implementing user registration

2. **Crisis Resource Internationalization**: FR-050 specifies US crisis hotlines (988, SAMHSA). Should international versions support localized resources?
   - **Impact**: Affects crisis support feature scope
   - **Action**: Define MVP scope as US-only or implement locale-based resource routing

3. **Matching Algorithm Weights**: Initial weights proposed (25/25/20/15/15) need validation. Should we A/B test different weight configurations?
   - **Impact**: Affects match quality and user satisfaction
   - **Action**: Implement analytics to measure connection success rates and iterate on weights

4. **Sponsor Verification**: Assumption 3 mentions "community reporting" for sponsor validation. How does this system work? When is it implemented?
   - **Impact**: Affects safety and trust in the platform
   - **Action**: Define reporting workflow and moderation process

5. **Profile Photo Moderation**: Users can upload profile photos. Is manual or automated content moderation required?
   - **Impact**: Affects safety, operational costs
   - **Action**: Define moderation policy and implementation timeline

### Technical Risks

1. **Realtime Scalability**: Supabase Realtime may face limitations at scale (10K+ concurrent users).
   - **Mitigation**: Monitor Realtime connection counts, implement connection pooling, prepare to migrate to dedicated WebSocket infrastructure if needed

2. **Offline Sync Conflicts**: Step work edited offline by sponsee while sponsor comments online creates merge complexity.
   - **Mitigation**: Implement clear conflict resolution UI, default to preserving both versions for manual merge

3. **Push Notification Reliability**: iOS and Android have different background behavior affecting notification delivery.
   - **Mitigation**: Implement in-app polling fallback for critical notifications (relapse alerts), test thoroughly on both platforms

4. **Matching Algorithm Performance**: Complex weighted scoring with geographic queries may be slow.
   - **Mitigation**: Implement database indexes on matching columns, consider caching match results, set realistic timeout expectations

5. **Data Privacy Compliance**: Handling sensitive recovery data may have regulatory implications (GDPR, CCPA).
   - **Mitigation**: Implement data export (FR-060), account deletion (FR-062), clearly define data retention policies

### Research Gaps

- **Step Work Content**: Spec mentions "structured digital worksheets" but doesn't provide actual 12-step AA worksheet content. Need to source official AA step work questions or consult with AA community.
- **Sobriety Calculation Logic**: How are multiple sobriety dates displayed? Priority order? How are milestone notifications handled for multiple substance tracking?
- **Geographic Matching Precision**: What radius is considered "nearby"? City-level? 50 miles? Configurable?

---

## Next Steps

1.  Research phase complete (this document)
2. **Phase 1**: Generate `data-model.md` with complete entity definitions
3. **Phase 1**: Create API contracts in `contracts/` directory (OpenAPI specifications)
4. **Phase 1**: Write `quickstart.md` developer setup guide
5. **Phase 1**: Update agent context with technology stack (TypeScript 5.x, React Native, PostgreSQL 15+)
6. **Phase 2**: Run `/spec-kitty.tasks` to generate work packages from user stories

---

## Evidence Log

See `research/evidence-log.csv` for detailed evidence tracking.
See `research/source-register.csv` for source catalog.

---

**Research Completed**: 2025-11-03
**Next Artifact**: data-model.md
