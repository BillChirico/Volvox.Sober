---
work_package_id: 'WP03'
subtasks:
  - 'T045'
  - 'T046'
  - 'T047'
  - 'T048'
  - 'T049'
  - 'T050'
  - 'T051'
  - 'T052'
  - 'T053'
  - 'T054'
  - 'T055'
  - 'T056'
  - 'T057'
  - 'T058'
title: 'User Onboarding & Profile Management'
phase: 'Phase 1 - MVP'
lane: "for_review"
assignee: ''
agent: "claude"
shell_pid: "82652"
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
---

# Work Package Prompt: WP03 – User Onboarding & Profile Management

## Objectives & Success Criteria

**Primary Objective**: Implement complete user onboarding flow with role selection, profile creation, and email verification.

**Success Criteria**:

- New users can signup, select role (sponsor/sponsee/both), complete profile
- Email verification flow works end-to-end (send, verify, resend)
- Profile photos upload to Supabase Storage with image optimization
- Profile editing updates database and reflects in UI immediately
- All profile screens follow React Native Paper design system
- Offline profile viewing works with AsyncStorage caching

## Context & Constraints

**Related Documents**:

- Constitution: UX Consistency (React Native Paper, WCAG AA), Security (RLS policies)
- User Stories: US1 (sponsee matching requires profile), US2 (sponsor connection management)
- Contracts: `contracts/auth.yaml` (signup/login), `contracts/users.yaml` (profile management)

**Dependencies**:

- WP02 complete: users table, auth integration, profile tables exist
- Supabase Storage bucket configured for profile photos

**Technical Requirements**:

- React Navigation stack for onboarding screens
- Redux slices for user state management
- AsyncStorage for offline profile caching
- Image picker with compression (< 1MB uploads)

## Subtasks & Detailed Guidance

### Onboarding Screens (T045-T048)

**T045: Welcome screen with role selection**

- Three options: "I need a sponsor" (sponsee), "I want to sponsor" (sponsor), "Both"
- Radio buttons using React Native Paper RadioButton component
- Store selection in Redux: `onboardingSlice.setRole(role)`

**T046: Sponsee profile form**

- Fields: name, location (city, state), program_type (AA), sobriety_date, step_progress, bio
- Location picker: react-native-geolocation-service for city/state
- Date picker: @react-native-community/datetimepicker for sobriety_date
- Validation: required fields, sobriety_date cannot be future

**T047: Sponsor profile form**

- Fields: name, location, program_type, years_sober, max_sponsees, availability, approach, bio
- Availability: dropdown with "1-2 days", "3-5 days", "Daily" options
- Approach: multiline text input (200 char max)
- Capacity calculation: max_sponsees - current_sponsees (tracked by trigger in WP02)

**T048: Email verification screen**

- Display: "Check your email at {email} to verify"
- Resend button (disabled 60s after send): calls `supabase.auth.resend()`
- Poll verification status every 5s using `supabase.auth.getSession()`
- Navigate to dashboard on verified

### Profile Management (T049-T052)

**T049: Profile photo upload**

- Image picker: react-native-image-picker with quality: 0.7, maxWidth: 800
- Compression: react-native-image-resizer before upload
- Upload flow:
  ```typescript
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(`${userId}.jpg`, photoFile);
  ```
- Update users.profile_photo_url with public URL

**T050: View profile screen**

- Display all profile fields in read-only mode
- Edit button (top-right) navigates to edit screen
- Show connection stats: "X sponsees" or "Connected with Y sponsors"
- Accessibility: VoiceOver support for all text fields

**T051: Edit profile screen**

- Pre-populate form with existing profile data
- Save button: validate → update database → navigate back
- RLS policy allows: `UPDATE users WHERE id = auth.uid()`
- Optimistic UI update: update Redux immediately, rollback on error

**T052: Offline profile caching**

- Cache profile data in AsyncStorage on successful fetch:
  ```typescript
  await AsyncStorage.setItem(`profile:${userId}`, JSON.stringify(profile));
  ```
- Load from cache on app start if no network
- Sync indicator in UI: "Offline - data may be stale"

### Profile API Integration (T053-T058)

**T053: Users API slice (RTK Query)**

- Endpoints: `getProfile`, `updateProfile`, `uploadPhoto`
- Use Supabase client in base query
- Tag invalidation: profile updates invalidate cache

**T054: Redux user slice**

- State: `{ user: User | null, loading: boolean, error: string | null }`
- Actions: `setUser`, `updateUser`, `clearUser`
- Selectors: `selectCurrentUser`, `selectUserRole`

**T055: Profile photo optimization**

- Image compression on client (react-native-image-resizer)
- Progressive upload with progress indicator
- Fallback to default avatar on upload failure

**T056: Form validation**

- Yup schema for profile fields
- Inline validation with error messages below inputs
- Required fields marked with asterisk

**T057: Navigation setup**

- Onboarding stack: Welcome → Role selection → Profile form → Email verification
- Conditional navigation: if verified → Dashboard, else → Email verification
- Deep linking: email verification link opens app to verification screen

**T058: Unit tests for onboarding flows**

- Test role selection updates Redux state
- Test profile form validation (required fields, date constraints)
- Test photo upload success/failure handling
- Test offline profile loading from AsyncStorage

## Test Strategy

**Unit Tests**:

- Redux slices: user state updates correctly
- Form validation: Yup schema catches invalid inputs
- Photo compression: images reduced below 1MB threshold

**Integration Tests**:

- Profile creation: form submission → database insert → RLS allows
- Photo upload: image picker → compression → Supabase Storage → URL update
- Offline caching: profile fetch → AsyncStorage save → load from cache

**E2E Tests** (Detox):

- Complete onboarding flow: role selection → profile form → email verification
- Edit profile: update bio → save → changes reflected in view screen

## Risks & Mitigations

**Risk**: Email verification delays causing user drop-off

- **Mitigation**: Resend button, clear instructions, polling for auto-navigation

**Risk**: Large photo uploads failing on slow networks

- **Mitigation**: Compression (< 1MB), progress indicator, retry logic

**Risk**: AsyncStorage cache desync with database

- **Mitigation**: Timestamp cache entries, show "syncing" indicator, auto-refresh on reconnect

## Definition of Done Checklist

- [ ] All 14 subtasks (T045-T058) completed
- [ ] Onboarding flow tested on iOS and Android
- [ ] Profile photos upload and display correctly
- [ ] Email verification works end-to-end
- [ ] Offline profile viewing functional
- [ ] All screens follow React Native Paper design system
- [ ] Unit and integration tests pass
- [ ] Constitution compliance: UX consistency, security (RLS)

## Review Guidance

**Key Review Points**:

- Onboarding UX is intuitive and accessible (WCAG AA)
- Profile forms have clear validation and error messages
- Photo upload handles edge cases (large files, network errors)
- Offline caching prevents blank screens when disconnected
- RLS policies tested: users can only edit own profiles

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T00:29:50Z – claude – shell_pid=82652 – lane=doing – Started WP03 implementation: User onboarding and profile management
- 2025-11-04T01:42:15Z – claude – shell_pid=82652 – lane=for_review – WP03 complete: All 14 subtasks implemented. Created comprehensive onboarding flow (role selection, profile forms, email verification), profile management (photo upload, view/edit, offline caching), and API integration (RTK Query, Redux slices, Yup validation). Added 5 dependencies, created 21 files with 2,873 additions, 18 unit tests passing.
