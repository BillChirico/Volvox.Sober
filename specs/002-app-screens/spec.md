# Feature Specification: All Application Screens

**Feature Branch**: `002-app-screens`
**Created**: 2025-11-05
**Status**: Draft
**Input**: User description: "Create all of the apps screens"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Onboarding New Users (Priority: P1)

A newly registered user needs to complete their profile setup to start using the app effectively. After email verification, they go through a welcome flow that explains the app's purpose, collects their role preference (sponsor/sponsee), and gathers essential profile information needed for matching.

**Why this priority**: Onboarding is the critical first experience that determines whether users understand the app's value and complete their profile setup. Without proper onboarding, users may abandon the app before experiencing its core benefits.

**Independent Test**: Can be fully tested by creating a new account, completing email verification, progressing through the welcome screen, selecting a role (sponsor or sponsee), filling out the role-specific profile form, and verifying the user is redirected to the main app with their profile completed.

**Acceptance Scenarios**:

1. **Given** I am a newly verified user, **When** I first login, **Then** I am shown the welcome screen explaining Volvox.Sober's purpose and sponsor/sponsee matching
2. **Given** I am on the welcome screen, **When** I proceed, **Then** I am asked to choose my primary role: "I'm looking for a sponsor" or "I want to be a sponsor"
3. **Given** I select "I'm looking for a sponsor" (sponsee), **When** I proceed, **Then** I see a sponsee-specific profile form requesting my sobriety journey details, recovery program, and what I'm looking for in a sponsor
4. **Given** I select "I want to be a sponsor" (sponsor), **When** I proceed, **Then** I see a sponsor-specific profile form requesting my experience, recovery program, availability, and sponsee preferences
5. **Given** I complete the role-specific profile, **When** I submit, **Then** my profile is saved and I am redirected to the main app (Sobriety tab by default)
6. **Given** I have completed onboarding, **When** I login again in the future, **Then** I skip onboarding and go directly to the main app

---

### User Story 2 - Tracking Sobriety Progress (Priority: P1)

Users need a central place to track their sobriety journey, including their sober date, days count, milestones, and personal reflections. This serves as motivation and provides context for sponsor/sponsee relationships.

**Why this priority**: Sobriety tracking is a core feature that provides daily value and motivation. It's the foundation for accountability relationships and must be available immediately after onboarding.

**Independent Test**: Can be fully tested by setting a sobriety start date, viewing the calculated days count, adding a personal reflection or milestone, and verifying the data persists across sessions.

**Acceptance Scenarios**:

1. **Given** I am on the Sobriety tab, **When** I view the screen, **Then** I see my current streak (days sober) prominently displayed
2. **Given** I have not set a sobriety date, **When** I first access the Sobriety tab, **Then** I am prompted to set my sober date
3. **Given** I set my sobriety start date, **When** I submit, **Then** my days count is automatically calculated and displayed
4. **Given** I am on the Sobriety tab, **When** I add a daily reflection or milestone, **Then** it is saved and displayed in my sobriety timeline
5. **Given** I have milestones configured (30 days, 90 days, 1 year), **When** I reach a milestone, **Then** I receive a congratulatory notification
6. **Given** I am on the Sobriety tab, **When** I view my history, **Then** I see a timeline of reflections and milestones

---

### User Story 3 - Finding Compatible Matches (Priority: P2)

Sponsors and sponsees need to discover compatible matches based on recovery program, location, availability, and preferences. The matching system suggests potential connections while allowing users to browse and filter candidates.

**Why this priority**: Matching is a key differentiator but requires existing users and profiles to be valuable. It's essential but can be added after core sobriety tracking and profile setup work.

**Independent Test**: Can be fully tested by creating sponsor and sponsee profiles, viewing suggested matches based on compatibility criteria, filtering matches by program/location, and verifying match quality improves with better profile completion.

**Acceptance Scenarios**:

1. **Given** I am a sponsee on the Matches tab, **When** I view the screen, **Then** I see suggested sponsors ranked by compatibility
2. **Given** I am a sponsor on the Matches tab, **When** I view the screen, **Then** I see potential sponsees ranked by compatibility
3. **Given** I am viewing matches, **When** I filter by recovery program (AA, NA, CA, etc.), **Then** only matches following that program are shown
4. **Given** I am viewing matches, **When** I filter by availability (weekends, evenings, anytime), **Then** only matches with compatible availability are shown
5. **Given** I view a match profile, **When** I read their details, **Then** I see their recovery program, sobriety length, location, availability, and what they're looking for
6. **Given** I find a compatible match, **When** I send a connection request, **Then** the match receives a notification and can accept/decline

---

### User Story 4 - Managing Connections (Priority: P2)

Users need to view and manage their active sponsor/sponsee relationships, see connection status (pending, active, past), and access quick actions for communication.

**Why this priority**: Connections management is important for maintaining relationships but requires matches to exist first. It's a key feature but depends on the matching system.

**Independent Test**: Can be fully tested by sending a connection request, accepting a connection, viewing the connection in the Connections tab, and accessing quick communication options from the connection card.

**Acceptance Scenarios**:

1. **Given** I am on the Connections tab, **When** I view the screen, **Then** I see three sections: Pending Requests, Active Connections, and Past Connections
2. **Given** I have pending connection requests, **When** I view them, **Then** I can accept or decline each request with a tap
3. **Given** I have active connections, **When** I view them, **Then** I see their name, role, days connected, and last interaction date
4. **Given** I select an active connection, **When** I tap on their card, **Then** I can view their full profile, send a message, or schedule a check-in
5. **Given** I have ended a connection, **When** I view Past Connections, **Then** I see a history of previous sponsor/sponsee relationships
6. **Given** I am viewing an active connection, **When** I choose to end the connection, **Then** I'm asked to confirm and optionally provide feedback before the connection is moved to Past

---

### User Story 5 - Communicating via Messages (Priority: P2)

Users need a secure messaging system to communicate with their sponsors or sponsees, share updates, ask questions, and provide accountability check-ins.

**Why this priority**: Messaging is critical for sponsor/sponsee relationships but requires active connections to be useful. It's essential but can be implemented after basic connection management works.

**Independent Test**: Can be fully tested by sending a message to an active connection, receiving a reply, viewing message history, and verifying real-time message delivery.

**Acceptance Scenarios**:

1. **Given** I am on the Messages tab, **When** I view the screen, **Then** I see a list of message threads with my connections sorted by most recent activity
2. **Given** I have unread messages, **When** I view the Messages tab, **Then** unread threads are highlighted with a badge showing unread count
3. **Given** I select a message thread, **When** I open it, **Then** I see the full conversation history with timestamps
4. **Given** I am in a message thread, **When** I type and send a message, **Then** it appears in the thread and is delivered to my connection in real-time
5. **Given** I receive a new message while using the app, **When** it arrives, **Then** I see a notification badge and the Messages tab indicator updates
6. **Given** I receive a new message while not using the app, **When** it arrives, **Then** I receive a push notification (if enabled)

---

### User Story 6 - Managing Personal Profile (Priority: P3)

Users need to view and update their profile information, preferences, notification settings, and account details to maintain accuracy and control their experience.

**Why this priority**: Profile management is important for long-term engagement but not critical for MVP. Users can set up profiles during onboarding and update them later as needed.

**Independent Test**: Can be fully tested by accessing the Profile tab, updating personal information, changing notification preferences, and verifying changes persist and affect app behavior.

**Acceptance Scenarios**:

1. **Given** I am on the Profile tab, **When** I view the screen, **Then** I see my profile photo, name, role (sponsor/sponsee), sobriety date, and bio
2. **Given** I am viewing my profile, **When** I tap edit, **Then** I can update my bio, recovery program, availability, and preferences
3. **Given** I am editing my profile, **When** I change my role from sponsee to sponsor (or vice versa), **Then** I am prompted to fill out role-specific information
4. **Given** I am on the Profile tab, **When** I access settings, **Then** I can manage notification preferences, privacy settings, and account options
5. **Given** I am in settings, **When** I toggle notifications (messages, milestones, connection requests), **Then** my preferences are saved and respected
6. **Given** I am viewing my profile, **When** I access Account settings, **Then** I can change my email, update password, or delete my account

---

### User Story 7 - Handling Navigation and App Shell (Priority: P1)

Users need a consistent, accessible navigation system to move between core app features (Sobriety, Matches, Messages, Connections, Profile) with clear visual indicators of current location.

**Why this priority**: Navigation is fundamental infrastructure required for all other features to be accessible. Without proper navigation, users cannot use any app functionality.

**Independent Test**: Can be fully tested by tapping each tab, verifying the correct screen loads, checking that the active tab is highlighted, and confirming navigation state persists when returning to the app.

**Acceptance Scenarios**:

1. **Given** I am in the main app, **When** I view the bottom navigation, **Then** I see five tabs: Sobriety, Matches, Connections, Messages, Profile
2. **Given** I am on any tab, **When** I tap a different tab, **Then** the screen transitions smoothly and the new tab is highlighted as active
3. **Given** I have unread messages, **When** I view the navigation, **Then** the Messages tab shows a notification badge with the count
4. **Given** I have pending connection requests, **When** I view the navigation, **Then** the Connections tab shows a notification badge
5. **Given** I am navigating between tabs, **When** I switch tabs, **Then** each tab retains its scroll position and state when I return to it
6. **Given** I am on any screen, **When** I navigate, **Then** all tab icons and labels meet accessibility standards (sufficient contrast, touch target size)

---

### Edge Cases

- What happens when a user tries to access the main app without completing onboarding? (Redirect to onboarding flow with current progress preserved)
- What happens when a user's sobriety date is in the future? (Show validation error: "Sobriety date cannot be in the future")
- What happens when a user has no matches available? (Show empty state with message: "No matches found. Complete your profile for better matches" and tips to improve profile)
- What happens when a connection request is declined? (Sender sees "Request declined" status, match is removed from their suggestions for 30 days to avoid spam)
- What happens when both users in a connection end it simultaneously? (First action wins, second user sees "This connection has already been ended")
- What happens when a user sends a message to a connection that was just ended? (Message fails with error: "This connection has ended. Messages cannot be sent.")
- What happens when network is unavailable while loading a screen? (Show cached data if available, otherwise show error: "Unable to load. Please check your connection")
- What happens when a user tries to set multiple sobriety dates? (Only the most recent date is used, previous dates are saved in history for relapse tracking)
- What happens when a user receives a message from a blocked connection? (Message is silently dropped, sender doesn't know they're blocked)
- What happens when a user's profile is incomplete (<50% filled)? (Show warning banner on relevant screens: "Complete your profile for better matches")

## Requirements *(mandatory)*

### Functional Requirements

#### Onboarding Screens

- **FR-001**: System MUST display a welcome screen to first-time users explaining the app's purpose and sponsor/sponsee matching concept
- **FR-002**: System MUST allow users to select their primary role during onboarding: sponsor or sponsee
- **FR-003**: System MUST present role-specific profile forms based on user's chosen role
- **FR-004**: System MUST collect essential profile information: recovery program, sobriety start date, location, availability, and preferences
- **FR-005**: System MUST validate all required profile fields before allowing users to complete onboarding
- **FR-006**: System MUST redirect users to the main app (Sobriety tab) after completing onboarding
- **FR-007**: System MUST skip onboarding for users who have already completed it

#### Sobriety Tracking Screen

- **FR-008**: System MUST display the user's current sobriety streak in days prominently
- **FR-009**: System MUST allow users to set or update their sobriety start date
- **FR-010**: System MUST automatically calculate days sober from the start date
- **FR-011**: System MUST allow users to add daily reflections and milestone notes
- **FR-012**: System MUST display a timeline of past reflections and milestones
- **FR-013**: System MUST recognize and celebrate common sobriety milestones (30, 60, 90 days, 6 months, 1 year)
- **FR-014**: System MUST support relapse tracking by allowing users to reset their sobriety date while preserving history

#### Matches Screen

- **FR-015**: System MUST display suggested matches based on compatibility criteria (program, location, availability)
- **FR-016**: System MUST show different match pools for sponsors vs sponsees
- **FR-017**: System MUST allow filtering matches by recovery program (AA, NA, CA, Smart Recovery, etc.)
- **FR-018**: System MUST allow filtering matches by availability (weekends, evenings, flexible)
- **FR-019**: System MUST display match profiles with key information: program, sobriety length, location, availability, bio
- **FR-020**: System MUST allow users to send connection requests to matches
- **FR-021**: System MUST show match compatibility score or ranking
- **FR-022**: System MUST prevent showing the same declined match for 30 days

#### Connections Screen

- **FR-023**: System MUST display three sections: Pending Requests, Active Connections, Past Connections
- **FR-024**: System MUST allow users to accept or decline pending connection requests
- **FR-025**: System MUST display active connections with name, role, connection duration, and last interaction
- **FR-026**: System MUST allow users to view full profiles of their connections
- **FR-027**: System MUST provide quick access to messaging from connection cards
- **FR-028**: System MUST allow users to end active connections with optional feedback
- **FR-029**: System MUST move ended connections to Past Connections for historical reference
- **FR-030**: System MUST show notification badges for pending requests

#### Messages Screen

- **FR-031**: System MUST display message threads sorted by most recent activity
- **FR-032**: System MUST show unread message counts and highlight unread threads
- **FR-033**: System MUST display full conversation history with timestamps
- **FR-034**: System MUST support real-time message delivery using Supabase Realtime
- **FR-035**: System MUST send push notifications for new messages (when app is backgrounded)
- **FR-036**: System MUST allow users to send text messages to their connections
- **FR-037**: System MUST prevent messaging users who are not active connections
- **FR-038**: System MUST handle message delivery failures gracefully with retry options

#### Profile Screen

- **FR-039**: System MUST display user's profile information: photo, name, role, sobriety date, bio
- **FR-040**: System MUST allow users to edit their profile information
- **FR-041**: System MUST allow users to change their role (sponsor ↔ sponsee) with appropriate profile updates
- **FR-042**: System MUST provide access to notification settings (messages, milestones, connection requests)
- **FR-043**: System MUST provide access to privacy settings and account management
- **FR-044**: System MUST allow users to change their email address (with verification)
- **FR-045**: System MUST allow users to update their password
- **FR-046**: System MUST allow users to delete their account with confirmation
- **FR-047**: System MUST show profile completion percentage to encourage full profile setup

#### Navigation and App Shell

- **FR-048**: System MUST provide bottom tab navigation with 5 tabs: Sobriety, Matches, Connections, Messages, Profile
- **FR-049**: System MUST highlight the currently active tab
- **FR-050**: System MUST show notification badges on Connections tab (pending requests) and Messages tab (unread count)
- **FR-051**: System MUST preserve tab state and scroll position when switching between tabs
- **FR-052**: System MUST work consistently across iOS, Android, and Web platforms
- **FR-053**: System MUST meet WCAG 2.1 AA accessibility standards for navigation elements

#### Cross-Screen Requirements

- **FR-054**: All screens MUST support dark mode with appropriate theme switching
- **FR-055**: All screens MUST handle loading states with skeleton screens or spinners
- **FR-056**: All screens MUST handle error states with user-friendly messages and retry options
- **FR-057**: All screens MUST handle empty states with helpful guidance
- **FR-058**: All screens MUST implement pull-to-refresh for data updates
- **FR-059**: All screens MUST cache data locally for offline viewing where possible
- **FR-060**: All screens MUST render within 2 seconds on mid-range devices

### Key Entities

- **User Profile**: Complete profile information for a user
  - User ID (unique identifier)
  - Name
  - Email address
  - Role (sponsor/sponsee/both)
  - Profile photo
  - Bio/description
  - Recovery program (AA, NA, CA, etc.)
  - Sobriety start date
  - Location (city/state or region)
  - Availability preferences
  - Profile completion percentage
  - Account creation date

- **Onboarding Progress**: Tracks user's onboarding completion
  - User ID
  - Welcome screen completed (boolean)
  - Role selected (boolean)
  - Profile form completed (boolean)
  - Onboarding completed (boolean)
  - Last step completed

- **Sobriety Record**: Tracks user's sobriety journey
  - User ID
  - Current sobriety start date
  - Days sober (calculated)
  - Milestone history (30, 60, 90 days, etc.)
  - Relapse history (previous start dates)
  - Daily reflections (text entries with timestamps)

- **Match**: Represents a potential sponsor/sponsee pairing
  - Match ID
  - User ID (viewer)
  - Candidate ID (potential match)
  - Compatibility score
  - Last shown timestamp
  - Match status (suggested/requested/declined/connected)
  - Decline cooldown expiration (30 days from decline)

- **Connection**: Represents an active or past sponsor/sponsee relationship
  - Connection ID
  - Sponsor user ID
  - Sponsee user ID
  - Connection status (pending/active/ended)
  - Request timestamp
  - Acceptance/decline timestamp
  - End timestamp (if ended)
  - Feedback (optional, from ending user)
  - Last interaction timestamp

- **Message**: Represents a message between connections
  - Message ID
  - Connection ID
  - Sender user ID
  - Message text
  - Timestamp
  - Read status (boolean)
  - Delivery status (sent/delivered/failed)

- **Notification Preferences**: User's notification settings
  - User ID
  - New message notifications (boolean)
  - Milestone notifications (boolean)
  - Connection request notifications (boolean)
  - Push notification enabled (boolean)
  - Email notification enabled (boolean)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 85% of new users complete the onboarding flow within 5 minutes of registration
- **SC-002**: Users can navigate to any tab from any other tab in under 1 second
- **SC-003**: Sobriety tracking screen loads in under 2 seconds on mid-range devices
- **SC-004**: Match suggestions appear within 3 seconds of opening the Matches tab
- **SC-005**: Messages are delivered to recipients within 2 seconds (when both users are online)
- **SC-006**: 90% of users successfully send their first message within 3 taps from the Connections screen
- **SC-007**: Profile updates are saved and reflected across all screens within 1 second
- **SC-008**: All screens maintain 60 FPS during scrolling and animations
- **SC-009**: Users with complete profiles receive 3x more match suggestions than users with incomplete profiles
- **SC-010**: 95% of connection requests are accepted or declined within 48 hours
- **SC-011**: Active connections send at least one message per week on average
- **SC-012**: Users who complete onboarding return to the app within 7 days at a rate of 70%
- **SC-013**: All navigation actions are accessible via screen reader with descriptive labels
- **SC-014**: App continues to function with cached data when offline, with 80% of screens viewable
- **SC-015**: Zero crashes occur during normal tab navigation and screen transitions

## Assumptions

1. **Authentication Prerequisite**: Users have already completed authentication (login/signup) before accessing these screens (handled by feature 001-auth-screens)
2. **Email Verification**: Email verification is complete or in progress when users reach onboarding (non-blocking per FR-005 in auth spec)
3. **Recovery Program Defaults**: The app supports common 12-step programs (AA, NA, CA) and non-12-step options (Smart Recovery, Refuge Recovery, secular programs)
4. **Location Handling**: Location is collected as city/state or general region (not precise GPS coordinates) for privacy
5. **Photo Upload**: Profile photo upload functionality exists or will be implemented separately (can use default avatars initially)
6. **Push Notifications**: Push notification infrastructure is configured or will be configured separately
7. **Matching Algorithm**: A basic matching algorithm exists or will be implemented to rank matches by compatibility (can start with simple criteria: same program, similar location)
8. **Real-time Infrastructure**: Supabase Realtime is configured for message delivery
9. **Content Moderation**: Basic content moderation for messages and profiles is handled separately (can start with user reporting)
10. **Data Privacy**: All user data handling complies with relevant privacy laws (GDPR, CCPA) through Supabase RLS and proper data policies

## Dependencies

- **Feature 001-auth-screens**: Authentication screens must be complete and functional before onboarding can work
- **Supabase Database Schema**: Database tables for profiles, connections, messages, matches must exist
- **Supabase Realtime**: Real-time subscriptions must be configured for live message delivery
- **Redux Store**: Auth state and user profile state must be available from Redux
- **React Native Paper Components**: UI component library must be set up for consistent design
- **Theme System**: Dark mode and theme switching infrastructure must be configured
- **Accessibility Testing**: WCAG 2.1 AA compliance testing framework must be available

## Out of Scope

The following items are explicitly NOT included in this feature and will be addressed separately:

- **Push Notification Configuration**: Setting up iOS/Android push notification certificates and Firebase/APNs integration
- **Profile Photo Upload**: Image upload, storage, and processing infrastructure
- **Advanced Matching Algorithm**: Machine learning or sophisticated compatibility scoring (starting with basic rule-based matching)
- **Group Messaging**: Multi-user chat rooms or group conversations
- **Video/Audio Calls**: Real-time voice or video communication between connections
- **Content Moderation Tools**: Automated content filtering, user reporting system, admin moderation dashboard
- **Analytics Dashboard**: User engagement metrics, app usage analytics, business intelligence
- **Internationalization**: Multi-language support and localization
- **Advanced Search**: Full-text search across profiles, filtering by multiple criteria simultaneously
- **Calendar Integration**: Scheduling check-ins with calendar events and reminders
- **Third-Party Integrations**: Integration with other recovery apps or platforms
