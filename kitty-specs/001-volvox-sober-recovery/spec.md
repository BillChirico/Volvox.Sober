# Feature Specification: Volvox.Sober Recovery Platform

**Feature Branch**: `001-volvox-sober-recovery`
**Created**: 2025-11-03
**Status**: Draft
**Input**: User description: "Build an iOS and Android application for sobriety support that enables authentic peer accountability through curated sponsor/sponsee matching. Features include: mutual sobriety tracking with full transparency, algorithm-based matching using comprehensive criteria (recovery profile, preferences, demographics, values), structured 12-step AA worksheets that sponsors can edit, hybrid communication (in-app messaging + optional contact sharing) with structured check-ins, sponsor capacity management with request accept/deny/message capabilities, complete progress visibility for sponsors, and full dark/light mode support."

## Overview

Volvox.Sober is a cross-platform mobile application (iOS and Android) designed to facilitate authentic peer accountability in addiction recovery through the Alcoholics Anonymous 12-step program. The platform connects individuals in recovery (sponsees) with experienced mentors (sponsors) through intelligent matching, provides structured digital worksheets for step work, and enables ongoing communication and progress tracking. Both sponsors and sponsees maintain their own sobriety journeys with full mutual visibility, creating authentic peer-to-peer support rather than a hierarchical mentor relationship.

### Context

Traditional AA sponsorship relies on in-person meetings and phone calls, making it difficult for individuals in rural areas, with mobility constraints, or seeking anonymity to access quality sponsorship. Existing recovery apps focus primarily on sobriety tracking or community forums but lack the structured, personalized mentorship that makes AA's sponsor model effective. This platform bridges that gap by providing:

- Algorithm-based sponsor matching that considers compatibility factors beyond just availability
- Structured digital step work that maintains the rigor of traditional worksheet-based recovery
- Flexible communication supporting both quick check-ins and deeper conversations
- Mutual accountability where both parties track and share their recovery journeys

## User Scenarios & Testing

### User Story 1 - Sponsee Completes Initial Profile and Receives Sponsor Matches (Priority: P1)

A person in early recovery downloads Volvox.Sober, creates their profile including sobriety date, recovery background, and preferences, then receives 3-5 curated sponsor suggestions based on compatibility factors. They can view each sponsor's profile (sobriety time, communication style, capacity, bio) before sending a connection request with an optional introduction message.

**Why this priority**: This is the critical onboarding flow that determines if users can access the platform's core value. Without successful matching, no other features matter. This delivers immediate value by showing users they're not alone and quality mentorship is available.

**Independent Test**: Can be fully tested by creating a new sponsee account, completing the profile, and verifying that relevant sponsor matches appear with accurate compatibility information. Delivers standalone value by connecting users to potential sponsors.

**Acceptance Scenarios**:

1. **Given** a new user downloads the app, **When** they complete their profile with recovery background and preferences, **Then** they receive 3-5 sponsor matches ranked by compatibility within 60 seconds
2. **Given** a sponsee views a sponsor match, **When** they tap the sponsor's profile, **Then** they see sobriety time, bio, communication preferences, current sponsee count, and compatibility reasons
3. **Given** a sponsee selects a sponsor, **When** they send a connection request with an introduction message, **Then** the sponsor receives a notification and the request appears in their pending queue
4. **Given** a sponsee has sent connection requests, **When** they return to the matches screen, **Then** they see request status (pending, accepted, declined) and can send additional requests to other matches

---

### User Story 2 - Sponsor Reviews and Accepts Connection Requests (Priority: P1)

A sponsor receives notifications when sponsees send connection requests. They can review each request including the sponsee's profile (sobriety date, step progress, recovery background, introduction message), and choose to accept, decline with optional explanation, or send a message to learn more before deciding. Once accepted, the sponsee appears in the sponsor's dashboard and structured step work begins.

**Why this priority**: This completes the critical matching loop started in Story 1. Without sponsor acceptance flow, connections cannot form and the platform cannot function. This is the second half of the MVP matching experience.

**Independent Test**: Can be tested by creating a sponsor account, receiving mock connection requests, and verifying all response options work correctly. Delivers value by giving sponsors control over their mentorship commitments.

**Acceptance Scenarios**:

1. **Given** a sponsor receives a connection request, **When** they open the notification, **Then** they see the sponsee's profile, sobriety date, current step, introduction message, and compatibility score
2. **Given** a sponsor reviews a request, **When** they accept it, **Then** the sponsee receives acceptance notification, appears in sponsor's dashboard, and both can begin communication
3. **Given** a sponsor wants more information, **When** they send a message before deciding, **Then** an in-app conversation starts and the request remains pending until accepted or declined
4. **Given** a sponsor declines a request, **When** they provide an optional explanation, **Then** the sponsee receives a respectful notification and can see other matches
5. **Given** a sponsor is at capacity, **When** they receive new requests, **Then** the system displays a capacity warning and suggests updating preferences or declining requests

---

### User Story 3 - Users Track Sobriety Dates and Relapses with Mutual Visibility (Priority: P2)

Both sponsors and sponsees maintain their own sobriety journey with one or more sobriety dates (for different substances or recovery starts). Users can log their clean date, celebrate milestones (30 days, 90 days, 1 year), and honestly record relapses when they occur. When a relapse happens, users can reset their sobriety date and add an optional private note. Both sponsor and sponsee can view each other's sobriety dates and milestone progress, creating mutual accountability and authentic peer support.

**Why this priority**: This is the foundational accountability feature that differentiates Volvox.Sober from generic support apps. While not required for initial matching, it's essential for the ongoing relationship and must be available soon after connections form. It can be developed and tested independently of step work features.

**Independent Test**: Can be tested by creating connected sponsor/sponsee accounts, logging sobriety dates and relapses, and verifying mutual visibility and milestone celebrations. Delivers standalone value as an accountability tool even without step work tracking.

**Acceptance Scenarios**:

1. **Given** a new user completes onboarding, **When** they enter their sobriety date, **Then** the system calculates days sober and shows upcoming milestone dates
2. **Given** a user reaches a milestone (30, 60, 90 days, 6 months, 1 year), **When** the date arrives, **Then** they receive a celebration message and their sponsor/sponsees receive a notification to congratulate them
3. **Given** a sponsee experiences a relapse, **When** they log it by resetting their sobriety date, **Then** their sponsor receives a compassionate notification and can reach out for support
4. **Given** a sponsor views their sponsee's profile, **When** they check sobriety tracking, **Then** they see current days sober, relapse history (dates only, no private notes), and upcoming milestones
5. **Given** connected sponsor and sponsee, **When** either user views the other's profile, **Then** both see each other's sobriety dates, reinforcing mutual accountability and peer support
6. **Given** a user tracks multiple substances, **When** they add additional sobriety dates, **Then** each is tracked independently with separate milestone celebrations

---

### User Story 4 - Sponsee Works Through 12-Step Worksheets with Sponsor Guidance (Priority: P2)

Sponsees access structured digital worksheets for each of the 12 AA steps containing guided questions, reflection prompts, and space for written responses. As they complete step work, their responses are saved and visible to their sponsor. Sponsors can view responses, add comments, edit questions to personalize guidance, and mark steps as complete when they determine the sponsee is ready to progress. Progress is tracked on both sponsor and sponsee dashboards.

**Why this priority**: This is the core recovery work feature but ranks P2 because it requires an established sponsor/sponsee relationship (P1 stories) to be valuable. It's independently deliverable once matching works and provides the structured program work that defines AA sponsorship.

**Independent Test**: Can be tested with pre-connected sponsor/sponsee accounts by completing step worksheets, adding sponsor comments, and verifying progress tracking. Delivers standalone value as a digital 12-step workbook with mentor guidance.

**Acceptance Scenarios**:

1. **Given** a sponsee opens the 12-step section, **When** they select Step 1, **Then** they see a structured worksheet with guided questions and can begin writing responses
2. **Given** a sponsee completes responses to step questions, **When** they save their work, **Then** the responses are immediately visible to their sponsor and marked as "in progress"
3. **Given** a sponsor reviews their sponsee's step work, **When** they add comments or guidance to specific questions, **Then** the sponsee receives a notification and sees the sponsor's feedback in-line with their responses
4. **Given** a sponsor wants to personalize guidance, **When** they edit question text or add custom questions to a step, **Then** the sponsee sees the customized worksheet while other sponsees see standard questions
5. **Given** a sponsor determines the sponsee has completed a step, **When** they mark it complete, **Then** the step shows as completed on both dashboards and the next step becomes active
6. **Given** a sponsee is working on multiple steps, **When** they switch between steps, **Then** their progress is saved and they can return to any step without losing work
7. **Given** a sponsor has multiple sponsees, **When** they view step progress, **Then** they see a summary of where each sponsee is and can quickly identify who needs support

---

### User Story 5 - Hybrid Communication with In-App Messaging and Structured Check-Ins (Priority: P2)

Sponsors and connected sponsees can communicate through in-app messaging supporting text messages, with optional external contact sharing (phone number, email) based on sponsor preference. The system supports structured check-ins where sponsors can set recurring reminders (daily, weekly) for sponsees to answer specific questions (e.g., "How are you feeling today?", "Any cravings this week?"). Both parties receive notifications for new messages and check-in reminders, with all communication history accessible in-app.

**Why this priority**: Communication is essential for active relationships but requires established connections (P1) to be useful. It ranks P2 because it's independently valuable once matching works and enables the ongoing support that makes sponsorship effective. It can be developed separately from step work.

**Independent Test**: Can be tested with connected accounts by sending messages, setting up check-in schedules, and verifying notifications and communication history. Delivers standalone value as a dedicated communication channel for accountability partners.

**Acceptance Scenarios**:

1. **Given** two users are connected, **When** either sends an in-app message, **Then** the recipient receives a push notification and the message appears in their conversation thread
2. **Given** a sponsor enables external contact sharing, **When** a sponsee views the sponsor's profile, **Then** they see the option to view phone number or email and can initiate contact outside the app
3. **Given** a sponsor sets up a daily check-in, **When** the scheduled time arrives, **Then** the sponsee receives a notification with the check-in questions and can respond directly
4. **Given** a sponsee responds to a check-in, **When** they submit their answers, **Then** the sponsor receives a notification and the response is logged in the check-in history
5. **Given** users communicate over time, **When** they view conversation history, **Then** they see all messages and check-in responses in chronological order with timestamps
6. **Given** a sponsor has multiple sponsees, **When** they view their communications, **Then** they see separate threads for each sponsee with unread message indicators

---

### User Story 6 - Sponsor Manages Capacity and Preferences (Priority: P3)

Sponsors can configure their availability through preference settings including maximum number of sponsees they want to mentor (1-10), preferred communication frequency (daily, few times per week, weekly), preferred communication methods (in-app only, open to phone calls, open to video calls), and specific matching preferences (gender, sobriety time range, step experience). When approaching capacity, the system warns sponsors and can automatically limit incoming requests. Sponsors can update preferences at any time and view their current sponsee load.

**Why this priority**: While important for sponsor satisfaction, this is secondary to establishing connections and beginning recovery work. Sponsors can operate with default settings initially. This enhances the experience but isn't required for core functionality.

**Independent Test**: Can be tested by creating a sponsor account, modifying all preference settings, receiving requests at capacity, and verifying behavior matches preferences. Delivers standalone value by preventing sponsor burnout and improving match quality.

**Acceptance Scenarios**:

1. **Given** a new sponsor completes onboarding, **When** they set their capacity to 3 sponsees, **Then** the system stops showing their profile to sponsees after they accept 3 connections
2. **Given** a sponsor is approaching capacity, **When** they receive a new request, **Then** they see a warning that they're at 2/3 capacity and should consider declining if unable to commit
3. **Given** a sponsor updates communication preferences, **When** they change from "in-app only" to "open to phone calls", **Then** their phone number becomes visible to connected sponsees
4. **Given** a sponsor sets matching preferences, **When** sponsees search, **Then** only those meeting the criteria (e.g., same gender, sobriety time > 90 days) see this sponsor as a match
5. **Given** a sponsor wants to reduce load, **When** they lower their capacity setting below current sponsee count, **Then** existing relationships are maintained but no new requests are accepted until capacity opens

---

### User Story 7 - Dark Mode and Light Mode Support (Priority: P3)

Users can toggle between dark mode and light mode in app settings, or set the theme to follow their device's system preference. All screens, components, and visual elements adapt to the selected theme with appropriate contrast ratios for readability. The theme preference is saved and persists across app sessions.

**Why this priority**: Theme support is important for user comfort and accessibility but doesn't impact core functionality. Users can operate the app effectively with a single theme. This enhances experience and accessibility but is lower priority than recovery features.

**Independent Test**: Can be tested by toggling theme settings and verifying all screens render correctly in both modes with appropriate contrast. Delivers standalone value as an accessibility and preference feature that's independent of all other functionality.

**Acceptance Scenarios**:

1. **Given** a user opens app settings, **When** they toggle theme to dark mode, **Then** all screens immediately switch to dark theme with high contrast text and adjusted component colors
2. **Given** a user sets theme to "system default", **When** their device switches between light and dark mode, **Then** the app theme changes automatically to match
3. **Given** a user selects a theme preference, **When** they close and reopen the app, **Then** their theme choice persists without requiring reconfiguration
4. **Given** a user views any screen in dark mode, **When** they check text readability, **Then** all text meets WCAG AA contrast standards (4.5:1 ratio) for accessibility

---

### Edge Cases

- **What happens when a sponsee sends connection requests to multiple sponsors and receives multiple acceptances?** System allows multiple sponsor relationships (common in AA to have different sponsors for different steps or support areas) and tracks them separately on the dashboard.

- **What happens when a sponsor becomes inactive or needs to step away from sponsorship temporarily?** Sponsor can set their status to "on hiatus" which pauses incoming requests, notifies current sponsees of temporary unavailability, and provides options to connect with other sponsors if needed.

- **What happens when a sponsee stops responding to check-ins or communication?** After 3 missed check-ins or 2 weeks of inactivity, sponsor receives a notification suggesting they reach out. After 30 days of inactivity, system prompts both parties to confirm if they want to continue the relationship.

- **What happens when a user needs immediate crisis support?** All communication screens display a prominent crisis hotline button (National Suicide Prevention Lifeline, SAMHSA) that works even if the app is offline. This doesn't replace professional crisis services but makes them easily accessible.

- **How does the system handle timezone differences between sponsor and sponsee?** All dates, times, and check-in schedules automatically adjust to each user's local timezone. When scheduling check-ins, sponsors see the time in the sponsee's timezone to ensure reasonable scheduling.

- **What happens when a sponsor or sponsee wants to end the relationship?** Either party can disconnect with an optional private note explaining the reason (for personal reflection only). The disconnected user receives a respectful notification and is immediately shown new potential matches. All historical data (step work, messages) is archived and accessible to both parties for 90 days.

- **What happens if a user experiences multiple relapses in a short period?** The system doesn't penalize or limit functionality based on relapse frequency. Each relapse logs the date and allows for reflection notes. The sponsor is notified but the app maintains a supportive, non-judgmental tone. After 3 relapses in 30 days, the system gently suggests professional resources.

- **How does the system prevent fake sponsors or malicious users?** During sponsor onboarding, users must provide information about their sobriety time and recovery experience. While not verified initially, sponsors with low ratings or multiple reports are flagged for review. Sponsees can report inappropriate behavior, which triggers investigation and potential account suspension.

- **What happens when a sponsee completes all 12 steps?** The system celebrates the achievement with a milestone notification to both sponsor and sponsee. The step work remains accessible for review and reflection. The relationship can continue as ongoing support, or either party can choose to mark it as "maintenance mode" where check-ins reduce in frequency.

- **How does matching work if there are no compatible sponsors available in the system?** Sponsees receive a notification that matches are currently limited and they'll be notified when new sponsors join. They're offered the option to broaden their preference criteria or join a waitlist. The system prioritizes notifying them when compatible sponsors become available.

## Requirements

### Functional Requirements

#### User Management & Authentication

- **FR-001**: System MUST support two distinct user roles: Sponsor and Sponsee, with users able to create accounts as either role
- **FR-002**: System MUST allow users to create accounts using email and password with email verification required
- **FR-003**: System MUST support secure password reset via email verification link
- **FR-004**: System MUST enable Sponsors to toggle between Sponsor and Sponsee roles if they also want to seek sponsorship
- **FR-005**: System MUST persist user authentication state securely across app sessions

#### Profile & Preferences

- **FR-006**: System MUST collect core profile data during onboarding: sobriety date(s), recovery background (type of addiction, time in recovery), demographics (age, gender, location), and matching preferences
- **FR-007**: Sponsees MUST be able to specify matching preferences: preferred sponsor gender, age range, sobriety time minimum, communication style preferences, and optional special considerations
- **FR-008**: Sponsors MUST be able to set capacity settings: maximum number of sponsees (1-10), preferred communication frequency (daily/few times per week/weekly), communication methods (in-app only, phone, video), and availability status (active, on hiatus)
- **FR-009**: Users MUST be able to edit their profile and preferences at any time with changes taking effect immediately for future matches
- **FR-010**: System MUST support profile photos with optional anonymity (users can choose not to display photo)

#### Matching Algorithm

- **FR-011**: System MUST generate 3-5 curated sponsor matches for each sponsee based on comprehensive compatibility scoring including: geographic proximity, sobriety time compatibility, communication preference alignment, demographic preferences, availability, and declared values/approach to recovery
- **FR-012**: System MUST refresh sponsee match lists when sponsors update profiles or when new sponsors join that meet the sponsee's criteria
- **FR-013**: System MUST exclude sponsors who are at capacity, on hiatus, or don't meet the sponsee's stated preferences from match results
- **FR-014**: System MUST display compatibility reasoning for each match (e.g., "Similar recovery timeline", "Shared communication style", "Nearby location")
- **FR-015**: System MUST prevent sponsors from appearing in searches when they set status to "on hiatus"

#### Connection Management

- **FR-016**: Sponsees MUST be able to send connection requests to multiple sponsors simultaneously with an optional introduction message (max 500 characters)
- **FR-017**: Sponsors MUST receive push notifications when they receive connection requests
- **FR-018**: Sponsors MUST be able to view pending connection requests in a queue with full sponsee profile visibility including sobriety date, step progress, bio, and introduction message
- **FR-019**: Sponsors MUST be able to accept, decline, or message a sponsee before deciding on a connection request
- **FR-020**: System MUST notify sponsees immediately when their request is accepted or declined
- **FR-021**: System MUST support multiple active sponsor-sponsee relationships for a single sponsee (common in AA to have different sponsors for different purposes)
- **FR-022**: Either party MUST be able to disconnect from an active relationship with an optional private note, triggering archive of conversation history

#### Sobriety Tracking

- **FR-023**: Users MUST be able to log one or more sobriety dates (for different substances or recovery starts) with each tracked independently
- **FR-024**: System MUST calculate and display current days sober, upcoming milestones (30, 60, 90 days, 6 months, 1 year, yearly anniversaries), and progress toward next milestone
- **FR-025**: System MUST send celebration notifications to users and their sponsors/sponsees when milestones are reached
- **FR-026**: Users MUST be able to log relapses by resetting their sobriety date, with optional private note (max 1000 characters) for personal reflection
- **FR-027**: System MUST notify sponsors when their sponsees log a relapse, displaying the date but not the private note
- **FR-028**: System MUST display mutual sobriety visibility: connected sponsors and sponsees can view each other's sobriety dates, current streak, and relapse history (dates only, not notes)
- **FR-029**: System MUST maintain historical record of all sobriety dates and relapses for personal reflection but display only current active streak prominently

#### 12-Step Program Tracking

- **FR-030**: System MUST provide structured digital worksheets for all 12 AA steps containing guided questions and reflection prompts
- **FR-031**: Sponsees MUST be able to write and save responses to step questions with auto-save functionality to prevent data loss
- **FR-032**: System MUST make sponsee step work responses immediately visible to their connected sponsor(s)
- **FR-033**: Sponsors MUST be able to view all sponsees' step work progress, add comments and guidance to specific questions, and mark steps as complete when satisfied with the work
- **FR-034**: Sponsors MUST be able to edit question text and add custom questions to personalize guidance for individual sponsees without affecting other sponsees' worksheets
- **FR-035**: System MUST track step completion status (not started, in progress, completed) for each of the 12 steps
- **FR-036**: System MUST display step progress summary on both sponsor and sponsee dashboards showing which steps are active, completed, or pending
- **FR-037**: System MUST allow sponsees to work on multiple steps concurrently with progress saved independently for each step
- **FR-038**: System MUST preserve all step work and sponsor comments permanently in user history for future reflection

#### Communication

- **FR-039**: System MUST provide in-app text messaging between connected sponsors and sponsees with real-time delivery and push notifications
- **FR-040**: System MUST maintain separate conversation threads for each sponsor-sponsee relationship with full message history
- **FR-041**: Sponsors MUST be able to optionally share external contact information (phone number, email) in their profile settings, visible only to connected sponsees
- **FR-042**: Sponsors MUST be able to create recurring structured check-ins with custom questions that sponsees receive as scheduled notifications (daily, weekly, or custom interval)
- **FR-043**: Sponsees MUST be able to respond to check-in prompts directly from notifications, with responses logged in the conversation history
- **FR-044**: System MUST track check-in completion rates and notify sponsors when sponsees miss multiple consecutive check-ins (threshold: 3 missed check-ins)
- **FR-045**: System MUST support read receipts showing when messages are delivered and read
- **FR-046**: System MUST provide unread message indicators on conversation threads and dashboard for both sponsors and sponsees

#### Notifications

- **FR-047**: System MUST send push notifications for: new connection requests (sponsors), request accepted/declined (sponsees), new messages, check-in reminders, milestone celebrations, and sponsee relapses (sponsors)
- **FR-048**: Users MUST be able to configure notification preferences including enabling/disabling specific notification types and setting quiet hours
- **FR-049**: System MUST support in-app notification center displaying recent notifications with timestamps and read/unread status

#### Crisis Support

- **FR-050**: All communication screens MUST display a prominent crisis support button linking to National Suicide Prevention Lifeline (988) and SAMHSA National Helpline (1-800-662-4357)
- **FR-051**: Crisis support resources MUST be accessible even when app is offline or user is not logged in

#### Dashboard & Progress Visibility

- **FR-052**: Sponsees MUST have a dashboard displaying: current sobriety streak(s), active step work, upcoming check-ins, milestone countdown, and connected sponsors
- **FR-053**: Sponsors MUST have a dashboard displaying: all connected sponsees with quick status view (sobriety streak, current step, last contact date), pending connection requests, upcoming scheduled check-ins
- **FR-054**: Sponsors MUST be able to view detailed progress for each sponsee including: complete step work history with responses, sobriety tracking over time, check-in completion rates, and communication history

#### Theme Support

- **FR-055**: System MUST support light mode and dark mode themes affecting all screens and components
- **FR-056**: Users MUST be able to toggle theme manually or set to follow device system preference
- **FR-057**: All text and UI elements MUST meet WCAG AA contrast standards (4.5:1 ratio) in both light and dark modes
- **FR-058**: System MUST persist theme preference across app sessions

#### Data & Privacy

- **FR-059**: System MUST encrypt all personal data (messages, step work, sobriety data) at rest and in transit
- **FR-060**: Users MUST be able to export their complete data (step work, messages, sobriety history) in portable format
- **FR-061**: System MUST archive disconnected relationships for 90 days allowing both parties to access historical data, then permanently delete message history while preserving user's personal step work
- **FR-062**: Users MUST be able to delete their account with all personal data permanently removed within 30 days, except data required for legal compliance

#### Platform Support

- **FR-063**: System MUST support iOS devices running iOS 14 or higher
- **FR-064**: System MUST support Android devices running Android 8.0 (API level 26) or higher
- **FR-065**: Application MUST function offline for core features: viewing step work, reading messages, viewing sobriety tracking, with automatic sync when connectivity restores
- **FR-066**: System MUST handle timezone differences automatically for scheduled check-ins and milestone celebrations

### Key Entities

- **User**: Represents any registered individual on the platform. Core attributes include unique identifier, email, role(s) [Sponsor, Sponsee, or both], profile information (name, age, gender, location, bio, profile photo), account status (active, on hiatus, suspended), theme preference, notification settings, and created/updated timestamps. Users can have one or more sobriety dates and multiple active sponsor/sponsee relationships.

- **SobrietyDate**: Represents a tracked sobriety journey for a specific substance or recovery start. Attributes include unique identifier, user reference, substance type (alcohol, drugs, gambling, etc.), start date, current streak days, milestone dates (30/60/90/180/365 days), and relapse history (collection of relapse events with dates and optional private notes). Each user can have multiple sobriety dates tracked independently.

- **Relapse**: Represents a documented slip in sobriety. Attributes include unique identifier, sobriety date reference, relapse date/time, optional private note (max 1000 chars, visible only to the user), and whether sponsor was notified. Links to specific sobriety date and resets the streak calculation.

- **SponsorProfile**: Extends User for those in sponsor role. Attributes include current capacity (number of active sponsees), maximum capacity setting (1-10), communication preferences (in-app only, phone, video), communication frequency preference (daily, few times/week, weekly), availability status (active, on hiatus), matching preferences (gender, age range, sobriety time minimum), external contact info (optional phone, optional email), and sponsor bio. Influences match algorithm results.

- **SponseeProfile**: Extends User for those in sponsee role. Attributes include current step progress (status for each of 12 steps), matching preferences (preferred sponsor gender, age range, sobriety time, communication style), and search/matching history. Influences match algorithm inputs.

- **ConnectionRequest**: Represents a sponsee's request to connect with a sponsor. Attributes include unique identifier, sponsee reference, sponsor reference, introduction message (max 500 chars), request timestamp, status (pending, accepted, declined, expired), response timestamp, and optional decline reason. Pending requests appear in sponsor's queue; accepted requests create active Connection.

- **Connection**: Represents an active sponsor-sponsee relationship. Attributes include unique identifier, sponsor reference, sponsee reference, connection date, status (active, on hiatus, disconnected), disconnection reason (if applicable), disconnection date, and relationship metadata (first contact date, last contact date, total messages, check-in completion rate). Archive flag triggers after disconnection for 90-day retention.

- **Step**: Represents one of the 12 AA steps with standard structured questions. Attributes include step number (1-12), step title, default guided questions (array of question text), and step description. Standard template used across all users but can be customized per sponsee by sponsors.

- **StepWork**: Represents a sponsee's work on a specific step. Attributes include unique identifier, sponsee reference, sponsor reference (sponsor providing guidance), step reference, status (not started, in progress, completed), responses (array of question-answer pairs), sponsor comments (array of comments linked to specific questions), custom questions (sponsor-added questions for this sponsee), started date, completed date, and last updated timestamp. Each sponsee has separate step work for each of 12 steps.

- **Message**: Represents communication between sponsor and sponsee. Attributes include unique identifier, connection reference, sender reference, recipient reference, message text, timestamp, read status, read timestamp, message type (text, check-in response, system message), and archived flag. Messages are grouped by connection into conversation threads.

- **CheckIn**: Represents a scheduled recurring check-in created by sponsor. Attributes include unique identifier, connection reference, check-in questions (array of question text), recurrence schedule (daily, weekly, custom interval), active status, next scheduled time, and timezone. Generates notifications at scheduled times for sponsees to respond.

- **CheckInResponse**: Represents a sponsee's response to a scheduled check-in. Attributes include unique identifier, check-in reference, connection reference, response timestamp, answers (array of question-answer pairs), and response status (completed, missed). Linked to specific check-in instance and stored in conversation history.

- **Notification**: Represents system-generated alerts for users. Attributes include unique identifier, recipient reference, notification type (connection request, request accepted/declined, new message, check-in reminder, milestone celebration, relapse alert), subject, body text, related entity reference (connection, message, step, sobriety date), timestamp, read status, and action link (deep link into app). Users can configure which types they receive.

- **Match**: Represents a potential sponsor-sponsee pairing generated by matching algorithm. Attributes include unique identifier, sponsee reference, sponsor reference, compatibility score (0-100), compatibility reasons (array of matching factors like "similar timeline", "nearby location"), match timestamp, and viewed status. Refreshed when profiles update or new sponsors join.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Sponsees can find and send connection requests to compatible sponsors within 5 minutes of completing their profile
- **SC-002**: 80% of connection requests receive a response (accept, decline, or message) from sponsors within 48 hours
- **SC-003**: Users can log sobriety dates, relapses, and view mutual sobriety tracking without any data loss or sync errors
- **SC-004**: Sponsors can review and provide feedback on sponsee step work, with all comments visible to sponsees within 60 seconds
- **SC-005**: 90% of scheduled check-in notifications are delivered on time within 2-minute window of scheduled time
- **SC-006**: In-app messages are delivered and readable within 5 seconds under normal network conditions
- **SC-007**: Application supports 10,000 concurrent users without performance degradation
- **SC-008**: Theme switching (light/dark mode) completes within 1 second with no visual glitches
- **SC-009**: All text and UI elements meet WCAG AA accessibility standards (4.5:1 contrast ratio) in both themes
- **SC-010**: Application functions offline for core features (viewing step work, reading cached messages, viewing sobriety stats) with automatic sync when connection restores
- **SC-011**: 70% of sponsees who send connection requests successfully establish at least one active sponsor relationship within 7 days
- **SC-012**: Users can complete their initial profile and receive first sponsor matches within 10 minutes of account creation
- **SC-013**: Sponsor dashboard loads and displays all sponsee progress summaries within 3 seconds
- **SC-014**: System maintains 99.5% uptime excluding planned maintenance windows
- **SC-015**: 85% of users who reach 30-day sobriety milestone continue engaging with the platform for at least 90 days

## Assumptions

- **Assumption 1**: Users have reliable internet connectivity for real-time messaging and notifications, though core features (step work viewing, sobriety tracking) work offline with periodic sync
- **Assumption 2**: Users are familiar with AA's 12-step program or will learn through the app's structured worksheets (no prior AA meeting attendance required)
- **Assumption 3**: Sponsors are genuinely in recovery and have sponsorship experience, validated through self-reported profile data and community reporting rather than formal credentialing
- **Assumption 4**: Users are comfortable with mutual sobriety visibility and understand that full transparency is part of the platform's accountability model
- **Assumption 5**: The matching algorithm uses self-reported preferences and compatibility factors without requiring users to explicitly "like" or "reject" potential matches (curated suggestion model, not swiping)
- **Assumption 6**: Push notifications are critical for engagement, and users will grant notification permissions during onboarding
- **Assumption 7**: Users understand this app supplements but doesn't replace in-person AA meetings, professional therapy, or crisis intervention services
- **Assumption 8**: Geographic location is used only for matching proximity and timezone handling, not for enforcing regional restrictions
- **Assumption 9**: The 12-step worksheets follow standard AA step structure but allow sponsor customization for individual sponsee needs
- **Assumption 10**: Users will primarily access the app on personal devices (not shared devices) given the sensitive nature of recovery data
- **Assumption 11**: Both iOS and Android versions will have feature parity, with platform-specific UI following native design patterns (iOS Human Interface Guidelines, Android Material Design)
- **Assumption 12**: Sponsors set reasonable capacity limits (1-10 sponsees) based on their availability, with system warnings to prevent overcommitment
- **Assumption 13**: Message history and step work are preserved indefinitely while relationships are active, with 90-day archive period post-disconnection
- **Assumption 14**: Users under 18 require parental consent or the platform restricts to 18+ users (legal compliance varies by jurisdiction - implementation decision required during planning)
- **Assumption 15**: Crisis support links (988, SAMHSA hotline) are appropriate for US users; international versions may require localized crisis resources
