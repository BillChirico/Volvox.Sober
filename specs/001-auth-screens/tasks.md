# Tasks: Authentication Screens

**Feature**: Authentication Screens
**Branch**: `001-auth-screens`
**Date Generated**: 2025-11-04
**Spec**: [spec.md](./spec.md) | [Plan](./plan.md) | [Data Model](./data-model.md)

---

## Overview

This document defines the work packages and subtasks for implementing authentication screens with Supabase Auth in the Volvox.Sober universal Expo app. Tasks are organized by priority and dependency, enabling efficient parallel execution where possible.

**Total Work Packages**: 10
**Total Subtasks**: 64
**Parallelizable Tasks**: 32 (50%)
**Priority Breakdown**: P1 (5 WPs), P2 (1 WP), P3 (1 WP), Foundational (3 WPs)

---

## Work Package Summary

| WP | Title | Priority | Subtasks | Status | Dependencies |
|----|-------|----------|----------|--------|--------------|
| WP01 | Project Setup and Environment Configuration | Setup | 4 | ✅ Done | None |
| WP02 | Authentication Service Foundation | Foundational | 7 | ✅ Done | WP01 |
| WP03 | Redux State Management | Foundational | 6 | ✅ Done | WP02 |
| WP04 | Reusable Auth Components | Foundational | 6 | ✅ Done | WP03 |
| WP05 | User Registration (US1) | P1 | 8 | 📋 Planned | WP04 |
| WP06 | User Login (US2) | P1 | 8 | 📋 Planned | WP04 |
| WP07 | Password Recovery (US3) | P2 | 8 | 📋 Planned | WP04 |
| WP08 | Email Verification Landing (US1) | P1 | 5 | 📋 Planned | WP05 |
| WP09 | Navigation and Screen Transitions (US4) | P3 | 4 | 📋 Planned | WP05, WP06, WP07 |
| WP10 | Accessibility and Polish | Cross-cutting | 8 | 📋 Planned | WP05, WP06, WP07, WP08, WP09 |

**Status Legend**: 📋 Planned | 🔨 In Progress | 👀 For Review | ✅ Done

---

## WP01: Project Setup and Environment Configuration

**Priority**: Setup
**Dependencies**: None
**Estimated Effort**: 2-3 hours
**Parallelization**: High (all tasks can run in parallel)

### Subtasks

- **T001** [P]: Configure Supabase project and environment variables
  - Create/verify Supabase project
  - Set up `.env` file with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Verify environment variables load correctly in Expo
  - **Success Criteria**: Environment variables accessible via `process.env`

- **T002** [P]: Set up deep linking configuration (app.json)
  - Add `scheme: "volvoxsober"` to app.json
  - Configure iOS associatedDomains
  - Configure Android intentFilters
  - Test deep link handling with `npx uri-scheme open volvoxsober://auth/verify --ios`
  - **Success Criteria**: Deep links redirect to app correctly

- **T003**: Configure email templates in Supabase dashboard
  - Enable email confirmations in Supabase Auth settings
  - Set verification email template with redirect URL `volvoxsober://auth/verify`
  - Set password reset email template with redirect URL `volvoxsober://auth/forgot-password`
  - Configure email confirmation expiry (24 hours)
  - **Success Criteria**: Email templates configured, test emails send successfully

- **T004** [P]: Set up Redux store with Redux Persist configuration
  - Install `@reduxjs/toolkit`, `react-redux`, `redux-persist`, `@react-native-async-storage/async-storage`
  - Create `src/store/index.ts` with store configuration
  - Configure Redux Persist with AsyncStorage
  - Wrap app with `<Provider>` and `<PersistGate>` in `app/_layout.tsx`
  - **Success Criteria**: Redux store initializes, persistence working

**Acceptance Criteria**:
- All environment variables configured and accessible
- Deep linking tested on iOS/Android/Web
- Email templates functional in Supabase dashboard
- Redux store with persistence operational

**Files Created/Modified**:
- `.env` (created)
- `app.json` (modified)
- `src/store/index.ts` (created)
- `app/_layout.tsx` (modified)

---

## WP02: Authentication Service Foundation

**Priority**: Foundational
**Dependencies**: WP01
**Estimated Effort**: 4-6 hours
**Parallelization**: High (service, schemas, utilities can be developed in parallel)

### Subtasks

- **T005** [P]: Implement authService.ts with Supabase SDK wrapper
  - Create `src/services/authService.ts`
  - Initialize Supabase client with environment variables
  - Implement `signUp(email, password)` method
  - Implement `signIn(email, password)` method
  - Implement `resetPasswordRequest(email)` method
  - Implement `updatePassword(newPassword)` method
  - Implement `signOut()` method
  - Implement `getSession()` method
  - Implement `onAuthStateChange(callback)` listener
  - **Success Criteria**: All auth methods functional, TypeScript types correct

- **T006** [P]: Create Yup validation schemas (login, signup, password reset)
  - Create `src/services/validationSchemas.ts`
  - Implement `loginSchema` (email, password validation)
  - Implement `signupSchema` (email, password with strength requirements)
  - Implement `passwordResetSchema` (email validation)
  - Export schemas for use in form components
  - **Success Criteria**: All schemas validate correctly per FR-003

- **T007** [P]: Implement password strength utility function
  - Create `src/utils/passwordStrength.ts`
  - Implement `calculatePasswordStrength(password: string): PasswordStrength`
  - Score based on length, uppercase, lowercase, numbers, symbols
  - Return 'weak' | 'medium' | 'strong'
  - **Success Criteria**: Utility returns correct strength levels

- **T008** [P]: Create authErrors.ts error mapping utility
  - Create `src/utils/authErrors.ts`
  - Implement `mapAuthError(error: AuthError): string`
  - Map Supabase errors to user-friendly messages
  - Handle security-sensitive errors with generic messages (FR-011)
  - **Success Criteria**: All common errors mapped appropriately

- **T009** [P]: Write unit tests for authService
  - Create `__tests__/services/authService.test.ts`
  - Mock Supabase client
  - Test all authService methods (signUp, signIn, resetPassword, etc.)
  - Test error handling scenarios
  - **Success Criteria**: 100% coverage of authService methods

- **T010** [P]: Write unit tests for validation schemas
  - Create `__tests__/services/validationSchemas.test.ts`
  - Test valid inputs for all schemas
  - Test invalid inputs (bad email, weak password, etc.)
  - Test edge cases
  - **Success Criteria**: All validation rules tested

- **T011** [P]: Write unit tests for password strength utility
  - Create `__tests__/utils/passwordStrength.test.ts`
  - Test weak, medium, strong password scenarios
  - Test edge cases (empty, very long passwords)
  - **Success Criteria**: All strength levels validated

**Acceptance Criteria**:
- authService.ts implements all Supabase Auth operations
- Validation schemas enforce requirements from spec (FR-003)
- Password strength utility functional and tested
- Error mapping provides user-friendly messages
- All services have 100% test coverage

**Files Created/Modified**:
- `src/services/authService.ts` (created)
- `src/services/validationSchemas.ts` (created)
- `src/utils/passwordStrength.ts` (created)
- `src/utils/authErrors.ts` (created)
- `__tests__/services/authService.test.ts` (created)
- `__tests__/services/validationSchemas.test.ts` (created)
- `__tests__/utils/passwordStrength.test.ts` (created)

---

## WP03: Redux State Management

**Priority**: Foundational
**Dependencies**: WP02
**Estimated Effort**: 4-5 hours
**Parallelization**: Medium (slice must exist before thunks, but tests can be parallel)

### Subtasks

- **T012**: Create authSlice.ts with initial state and reducers
  - Create `src/store/auth/authSlice.ts`
  - Define `AuthState` interface (session, user, loading, error)
  - Implement initial state
  - Add reducers for auth operations (login, logout, session update)
  - Export actions and reducer
  - **Success Criteria**: Slice compiles, reducer handles all actions

- **T013**: Implement authThunks.ts (signup, login, logout, resetPassword)
  - Create `src/store/auth/authThunks.ts`
  - Implement `signupThunk` using authService
  - Implement `loginThunk` using authService
  - Implement `logoutThunk` using authService
  - Implement `resetPasswordRequestThunk` using authService
  - Implement `updatePasswordThunk` using authService
  - Handle loading states and errors
  - **Success Criteria**: All thunks dispatch correct actions, handle errors

- **T014**: Create authSelectors.ts for state selection
  - Create `src/store/auth/authSelectors.ts`
  - Implement `selectSession` selector
  - Implement `selectUser` selector
  - Implement `selectAuthLoading` selector
  - Implement `selectAuthError` selector
  - Implement `selectIsAuthenticated` selector
  - **Success Criteria**: All selectors return correct values

- **T015**: Configure Redux Persist for auth slice
  - Update `src/store/index.ts` with persist configuration
  - Whitelist `auth` slice for persistence
  - Exclude `loading` and `error` from persistence
  - Configure AsyncStorage as storage backend
  - **Success Criteria**: Auth state persists across app restarts (FR-007)

- **T016** [P]: Write unit tests for authSlice reducers
  - Create `__tests__/store/auth/authSlice.test.ts`
  - Test initial state
  - Test all reducer actions
  - Test state transitions
  - **Success Criteria**: All reducers tested

- **T017** [P]: Write unit tests for authThunks
  - Create `__tests__/store/auth/authThunks.test.ts`
  - Mock authService
  - Test all thunks (success and failure scenarios)
  - Test loading state management
  - **Success Criteria**: All thunks tested with mocks

**Acceptance Criteria**:
- Redux auth slice manages session, user, loading, error states
- Thunks integrate with authService correctly
- Selectors provide typed access to auth state
- Redux Persist maintains session across app restarts (SC-007)
- 100% test coverage for slice and thunks

**Files Created/Modified**:
- `src/store/auth/authSlice.ts` (created)
- `src/store/auth/authThunks.ts` (created)
- `src/store/auth/authSelectors.ts` (created)
- `src/store/index.ts` (modified)
- `__tests__/store/auth/authSlice.test.ts` (created)
- `__tests__/store/auth/authThunks.test.ts` (created)

---

## WP04: Reusable Auth Components

**Priority**: Foundational
**Dependencies**: WP03
**Estimated Effort**: 3-4 hours
**Parallelization**: High (all components can be developed in parallel)

### Subtasks

- **T018** [P]: Create PasswordInput.tsx component with visibility toggle
  - Create `src/components/auth/PasswordInput.tsx`
  - Implement password visibility toggle (eye icon)
  - Use React Native Paper TextInput
  - Support theme (light/dark mode)
  - Add proper accessibility labels
  - **Success Criteria**: Component renders, toggle works, accessible

- **T019** [P]: Create PasswordStrength.tsx visual indicator component
  - Create `src/components/auth/PasswordStrength.tsx`
  - Integrate with `passwordStrength` utility
  - Display colored bar (red/yellow/green)
  - Show strength label (weak/medium/strong)
  - Support theme colors
  - **Success Criteria**: Indicator updates in real-time, accessible

- **T020** [P]: Create AuthErrorMessage.tsx component
  - Create `src/components/auth/AuthErrorMessage.tsx`
  - Display error messages with appropriate styling
  - Support `accessibilityLiveRegion` for screen readers
  - Use theme error colors
  - **Success Criteria**: Errors displayed clearly, announced to screen readers

- **T021** [P]: Write component tests for PasswordInput
  - Create `__tests__/components/auth/PasswordInput.test.tsx`
  - Test visibility toggle functionality
  - Test keyboard input
  - Test accessibility props
  - **Success Criteria**: All component behaviors tested

- **T022** [P]: Write component tests for PasswordStrength
  - Create `__tests__/components/auth/PasswordStrength.test.tsx`
  - Test strength calculation display
  - Test color changes for different strengths
  - Test accessibility
  - **Success Criteria**: All strength levels tested

- **T023** [P]: Write component tests for AuthErrorMessage
  - Create `__tests__/components/auth/AuthErrorMessage.test.tsx`
  - Test error message display
  - Test accessibility live region
  - Test theme support
  - **Success Criteria**: Error display and accessibility tested

**Acceptance Criteria**:
- All auth components support light/dark mode (FR-017)
- Components meet WCAG 2.1 AA standards (FR-018)
- Password input has functional visibility toggle
- Password strength indicator shows real-time feedback (FR-020)
- Error messages accessible to screen readers
- 100% component test coverage

**Files Created/Modified**:
- `src/components/auth/PasswordInput.tsx` (created)
- `src/components/auth/PasswordStrength.tsx` (created)
- `src/components/auth/AuthErrorMessage.tsx` (created)
- `__tests__/components/auth/PasswordInput.test.tsx` (created)
- `__tests__/components/auth/PasswordStrength.test.tsx` (created)
- `__tests__/components/auth/AuthErrorMessage.test.tsx` (created)

---

## WP05: User Registration (US1)

**Priority**: P1
**Dependencies**: WP04
**Estimated Effort**: 6-8 hours
**Parallelization**: Medium (screen/form implementation sequential, tests parallel)

### Subtasks

- **T024**: Create app/(auth)/_layout.tsx stack navigator
  - Create `app/(auth)/_layout.tsx`
  - Configure Stack navigator for auth screens
  - Set header options (title, back button)
  - **Success Criteria**: Stack navigation renders auth screens

- **T025**: Create app/(auth)/signup.tsx screen
  - Create `app/(auth)/signup.tsx`
  - Import SignupForm component
  - Handle navigation after successful signup
  - Display "Check your email" message after signup
  - Add link to login screen
  - **Success Criteria**: Screen renders, navigation works

- **T026**: Create SignupForm.tsx component
  - Create `src/components/auth/SignupForm.tsx`
  - Add email input field
  - Add password input (using PasswordInput component)
  - Add confirm password field
  - Include PasswordStrength indicator
  - Add signup button
  - **Success Criteria**: Form renders with all fields

- **T027**: Implement signup form validation and submission
  - Integrate Yup `signupSchema` validation
  - Validate on blur and on submit
  - Dispatch `signupThunk` on form submit
  - Display AuthErrorMessage for errors
  - Handle loading state (disable button)
  - **Success Criteria**: Validation works, form submits to Supabase (SC-001)

- **T028**: Implement email verification flow
  - Configure Supabase to send verification email (FR-004)
  - Handle verification email redirect to app
  - Display verification pending message
  - **Success Criteria**: Verification email sent (SC-002)

- **T029**: Add "Check your email" confirmation message
  - Show success message after signup
  - Provide instruction to check email
  - Add option to resend verification email
  - **Success Criteria**: User sees clear next steps (SC-009)

- **T030** [P]: Write component tests for SignupForm
  - Create `__tests__/components/auth/SignupForm.test.tsx`
  - Test form validation (valid/invalid inputs)
  - Test signup submission
  - Test error display
  - Test password strength integration
  - **Success Criteria**: All form behaviors tested

- **T031** [P]: Write E2E tests for signup flow with Playwright
  - Create `e2e/auth/signup.spec.ts`
  - Test complete signup flow (US1 acceptance scenarios)
  - Test duplicate email error (FR-012)
  - Test weak password error (FR-003)
  - **Success Criteria**: All US1 scenarios automated

**Acceptance Criteria**:
- User can create account with email and password (FR-001, SC-001)
- Password requirements enforced (FR-003, SC-003)
- Duplicate email prevented (FR-012)
- Verification email sent automatically (FR-004, SC-002)
- "Check your email" message displayed (SC-009)
- Password strength indicator functional (FR-020)
- All US1 acceptance scenarios pass

**Files Created/Modified**:
- `app/(auth)/_layout.tsx` (created)
- `app/(auth)/signup.tsx` (created)
- `src/components/auth/SignupForm.tsx` (created)
- `__tests__/components/auth/SignupForm.test.tsx` (created)
- `e2e/auth/signup.spec.ts` (created)

---

## WP06: User Login (US2)

**Priority**: P1
**Dependencies**: WP04
**Estimated Effort**: 6-8 hours
**Parallelization**: Medium (screen/form implementation sequential, tests parallel)

### Subtasks

- **T032**: Create app/(auth)/login.tsx screen
  - Create `app/(auth)/login.tsx`
  - Import LoginForm component
  - Handle navigation after successful login
  - Redirect to main app (replace navigation stack)
  - Add links to signup and forgot password screens
  - **Success Criteria**: Screen renders, navigation works

- **T033**: Create LoginForm.tsx component
  - Create `src/components/auth/LoginForm.tsx`
  - Add email input field
  - Add password input (using PasswordInput component)
  - Add login button
  - Add "Forgot password?" link
  - **Success Criteria**: Form renders with all fields

- **T034**: Implement login form validation and submission
  - Integrate Yup `loginSchema` validation
  - Validate on blur and on submit
  - Dispatch `loginThunk` on form submit
  - Display AuthErrorMessage for errors (FR-013)
  - Handle loading state
  - **Success Criteria**: Validation works, form submits to Supabase (SC-004)

- **T035**: Implement session persistence with Redux Persist
  - Ensure Redux Persist saves auth tokens
  - Test session rehydration on app restart
  - Validate session on app launch
  - **Success Criteria**: Sessions persist across restarts (FR-007, SC-007)

- **T036**: Implement auth redirect logic (useAuthRedirect hook)
  - Create `src/hooks/useAuthRedirect.ts`
  - Check auth state and email verification status
  - Redirect to main app if authenticated and verified
  - Prevent unverified users from accessing main app (FR-005)
  - **Success Criteria**: Verified users redirected, unverified blocked (SC-005)

- **T037**: Add "Resend verification" option for unverified users
  - Detect unverified email error from Supabase
  - Display "Resend verification email" button
  - Implement resend functionality
  - **Success Criteria**: Unverified users can resend email

- **T038** [P]: Write component tests for LoginForm
  - Create `__tests__/components/auth/LoginForm.test.tsx`
  - Test form validation
  - Test login submission
  - Test error display (wrong password, unverified email)
  - **Success Criteria**: All form behaviors tested

- **T039** [P]: Write E2E tests for login flow with Playwright
  - Create `e2e/auth/login.spec.ts`
  - Test complete login flow (US2 acceptance scenarios)
  - Test wrong password error (FR-013)
  - Test unverified email error (FR-005)
  - Test session persistence
  - **Success Criteria**: All US2 scenarios automated

**Acceptance Criteria**:
- User can login with email and password (FR-006, SC-004)
- Wrong password shows clear error (FR-013)
- Unverified users blocked from main app (FR-005, SC-005)
- Sessions persist across app restarts (FR-007, SC-007)
- Auth redirect works correctly
- All US2 acceptance scenarios pass

**Files Created/Modified**:
- `app/(auth)/login.tsx` (created)
- `src/components/auth/LoginForm.tsx` (created)
- `src/hooks/useAuthRedirect.ts` (created)
- `__tests__/components/auth/LoginForm.test.tsx` (created)
- `e2e/auth/login.spec.ts` (created)

---

## WP07: Password Recovery (US3)

**Priority**: P2
**Dependencies**: WP04
**Estimated Effort**: 5-7 hours
**Parallelization**: Medium (screen/form implementation sequential, tests parallel)

### Subtasks

- **T040**: Create app/(auth)/forgot-password.tsx screen
  - Create `app/(auth)/forgot-password.tsx`
  - Import ForgotPasswordForm component
  - Handle reset token from deep link
  - Show password reset form when token present
  - Show email request form when no token
  - **Success Criteria**: Screen handles both reset request and password update

- **T041**: Create ForgotPasswordForm.tsx component
  - Create `src/components/auth/ForgotPasswordForm.tsx`
  - Add email input field (for reset request)
  - Add new password fields (for password update)
  - Add submit button
  - **Success Criteria**: Form renders for both flows

- **T042**: Implement password reset request flow
  - Integrate Yup `passwordResetSchema` validation
  - Dispatch `resetPasswordRequestThunk` on submit
  - Show generic success message (FR-011 security)
  - Handle errors gracefully
  - **Success Criteria**: Reset email sent (FR-008, SC-006)

- **T043**: Implement password update flow with token validation
  - Parse reset token from deep link
  - Validate token with Supabase
  - Dispatch `updatePasswordThunk` with new password
  - Show success message and redirect to login
  - **Success Criteria**: Password updated successfully (SC-008)

- **T044**: Add generic success messaging (FR-011 security)
  - Show "If an account exists, reset email sent" message
  - Don't reveal whether email exists
  - **Success Criteria**: No email enumeration vulnerability (FR-011)

- **T045**: Handle expired/invalid token edge cases
  - Detect expired token (>24 hours, FR-009)
  - Show "Reset link expired" error
  - Allow user to request new reset email
  - **Success Criteria**: Expired tokens handled gracefully

- **T046** [P]: Write component tests for ForgotPasswordForm
  - Create `__tests__/components/auth/ForgotPasswordForm.test.tsx`
  - Test email request form
  - Test password update form
  - Test token validation
  - **Success Criteria**: Both flows tested

- **T047** [P]: Write E2E tests for password recovery flow with Playwright
  - Create `e2e/auth/password-recovery.spec.ts`
  - Test reset request flow (US3 acceptance scenarios)
  - Test password update flow
  - Test expired token handling
  - **Success Criteria**: All US3 scenarios automated

**Acceptance Criteria**:
- User can request password reset (FR-008, SC-006)
- User can set new password with valid token (SC-008)
- Generic success message prevents email enumeration (FR-011)
- Expired tokens rejected (FR-009)
- Old password invalidated after reset (FR-003)
- All US3 acceptance scenarios pass

**Files Created/Modified**:
- `app/(auth)/forgot-password.tsx` (created)
- `src/components/auth/ForgotPasswordForm.tsx` (created)
- `__tests__/components/auth/ForgotPasswordForm.test.tsx` (created)
- `e2e/auth/password-recovery.spec.ts` (created)

---

## WP08: Email Verification Landing (US1)

**Priority**: P1
**Dependencies**: WP05
**Estimated Effort**: 2-3 hours
**Parallelization**: High (implementation and tests can be done in parallel)

### Subtasks

- **T048**: Create app/(auth)/verify-email.tsx screen
  - Create `app/(auth)/verify-email.tsx`
  - Parse verification token from deep link
  - Display loading state during verification
  - **Success Criteria**: Screen handles deep link tokens

- **T049**: Implement deep link token handling
  - Extract token from URL parameters
  - Call Supabase Auth to verify token
  - Handle token verification response
  - **Success Criteria**: Token verification works (FR-004)

- **T050**: Implement verification success/failure messaging
  - Show success message when verified
  - Show error message for invalid/expired tokens
  - Handle already verified case gracefully
  - **Success Criteria**: Clear messaging for all states (SC-009)

- **T051**: Add navigation to login after verification
  - Show "Go to Login" button after verification
  - Auto-redirect to login after 3 seconds (optional)
  - **Success Criteria**: User can proceed to login

- **T052** [P]: Write E2E tests for email verification flow
  - Create `e2e/auth/email-verification.spec.ts`
  - Test valid token verification
  - Test invalid token error
  - Test already verified handling
  - **Success Criteria**: All verification scenarios tested

**Acceptance Criteria**:
- Email verification completes successfully (FR-004)
- Invalid tokens show appropriate errors
- User redirected to login after verification
- All edge cases handled gracefully

**Files Created/Modified**:
- `app/(auth)/verify-email.tsx` (created)
- `e2e/auth/email-verification.spec.ts` (created)

---

## WP09: Navigation and Screen Transitions (US4)

**Priority**: P3
**Dependencies**: WP05, WP06, WP07
**Estimated Effort**: 2-3 hours
**Parallelization**: Low (navigation must be implemented before testing)

### Subtasks

- **T053**: Add navigation links between auth screens
  - Add "Already have an account? Login" link on signup screen
  - Add "Don't have an account? Sign up" link on login screen
  - Add "Forgot password?" link on login screen
  - Add "Back to login" link on password reset screens
  - **Success Criteria**: All navigation links functional (US4 scenarios)

- **T054**: Implement form state clearing on navigation (FR-014)
  - Reset form fields when navigating away from auth screens
  - Clear error messages on navigation
  - Clear password fields for security
  - **Success Criteria**: Forms clear on navigation (FR-014)

- **T055**: Add "Go back" functionality where appropriate
  - Enable back button in stack navigator
  - Handle Android hardware back button
  - Test back navigation flow
  - **Success Criteria**: Back navigation works on all platforms

- **T056** [P]: Write navigation flow tests
  - Create `e2e/auth/navigation.spec.ts`
  - Test all US4 acceptance scenarios
  - Test form clearing on navigation
  - Test back button behavior
  - **Success Criteria**: All US4 scenarios automated

**Acceptance Criteria**:
- User can navigate between all auth screens (US4)
- Form state clears on navigation (FR-014)
- Back button works correctly
- All US4 acceptance scenarios pass

**Files Created/Modified**:
- `app/(auth)/login.tsx` (modified)
- `app/(auth)/signup.tsx` (modified)
- `app/(auth)/forgot-password.tsx` (modified)
- `e2e/auth/navigation.spec.ts` (created)

---

## WP10: Accessibility and Polish

**Priority**: Cross-cutting
**Dependencies**: WP05, WP06, WP07, WP08, WP09
**Estimated Effort**: 4-6 hours
**Parallelization**: High (all verification tasks can run in parallel)

### Subtasks

- **T057** [P]: Ensure WCAG 2.1 AA compliance (FR-018)
  - Review all auth screens for accessibility
  - Ensure proper heading hierarchy
  - Verify focus management
  - Test keyboard navigation
  - **Success Criteria**: All screens meet WCAG 2.1 AA (SC-010)

- **T058** [P]: Add proper accessibilityLabel and accessibilityHint to all elements
  - Add labels to all form inputs
  - Add hints to buttons
  - Add roles to interactive elements
  - Set accessibilityLiveRegion for errors
  - **Success Criteria**: All elements properly labeled

- **T059** [P]: Verify dark mode support (FR-017)
  - Test all screens in dark mode
  - Verify color contrast ratios in dark mode
  - Ensure theme colors applied correctly
  - **Success Criteria**: Dark mode functional (FR-017)

- **T060** [P]: Test with VoiceOver (iOS) and TalkBack (Android)
  - Test all auth flows with VoiceOver
  - Test all auth flows with TalkBack
  - Verify announcements for errors and success
  - **Success Criteria**: Screen readers work correctly (SC-011)

- **T061** [P]: Verify color contrast ratios meet standards
  - Check text contrast (4.5:1 for normal, 3:1 for large)
  - Check error message contrast
  - Check button contrast
  - **Success Criteria**: All contrast ratios pass WCAG AA

- **T062** [P]: Test on iOS simulator
  - Test all auth flows on iOS
  - Verify deep linking works
  - Test with different iOS versions
  - **Success Criteria**: All flows work on iOS (SC-012)

- **T063** [P]: Test on Android emulator
  - Test all auth flows on Android
  - Verify deep linking works
  - Test with different Android versions
  - **Success Criteria**: All flows work on Android (SC-012)

- **T064** [P]: Test on web browser
  - Test all auth flows in Chrome, Firefox, Safari, Edge
  - Verify responsive design
  - Test keyboard navigation
  - **Success Criteria**: All flows work on web (SC-012)

**Acceptance Criteria**:
- All screens meet WCAG 2.1 AA standards (FR-018, SC-010)
- Dark mode fully functional (FR-017)
- Screen readers announce all content correctly (SC-011)
- All auth flows work on iOS, Android, Web (SC-012)
- Color contrast ratios meet WCAG AA standards

**Files Created/Modified**:
- All `app/(auth)/*.tsx` files (modified for accessibility)
- All `src/components/auth/*.tsx` files (modified for accessibility)

---

## Task Dependencies Graph

```
WP01 (Setup)
  ↓
WP02 (Auth Service Foundation)
  ↓
WP03 (Redux State Management)
  ↓
WP04 (Reusable Components)
  ↓
  ├── WP05 (User Registration) → WP08 (Email Verification)
  ├── WP06 (User Login)
  └── WP07 (Password Recovery)
       ↓
     WP09 (Navigation)
       ↓
     WP10 (Accessibility & Polish)
```

---

## Parallelization Opportunities

**High Parallelization (Can Start Simultaneously)**:
- WP01: All 4 tasks can run in parallel
- WP02: Tasks T005-T008 can run in parallel, T009-T011 after completion
- WP04: All 3 components (T018-T020) can be built in parallel

**Medium Parallelization (Some Dependencies)**:
- WP03: Slice first, then thunks/selectors in parallel
- WP05-WP07: Screen setup sequential, but tests can run in parallel

**Sequential (Must Complete in Order)**:
- WP01 → WP02 → WP03 → WP04
- WP05 → WP08
- WP05/WP06/WP07 → WP09 → WP10

**Recommended Execution Strategy**:
1. Complete WP01-WP04 in sequence (foundational work)
2. Execute WP05, WP06, WP07 in parallel (3 independent user stories)
3. Complete WP08 after WP05
4. Complete WP09 after WP05/WP06/WP07
5. Execute WP10 tasks in parallel (all verification tasks)

---

## MVP Scope Recommendation

**Minimum Viable Product (MVP)** for initial deployment:
- ✅ WP01: Project Setup (required for everything)
- ✅ WP02: Auth Service Foundation (required for auth)
- ✅ WP03: Redux State Management (required for state)
- ✅ WP04: Reusable Components (required for UI)
- ✅ WP05: User Registration (P1 - core feature)
- ✅ WP06: User Login (P1 - core feature)
- ⚠️ WP07: Password Recovery (P2 - nice to have, can defer)
- ✅ WP08: Email Verification (P1 - security requirement)
- ⚠️ WP09: Navigation (P3 - usability, can be basic initially)
- ✅ WP10: Accessibility & Polish (required for compliance)

**Post-MVP Enhancements**:
- WP07: Password Recovery (add in next sprint)
- Enhanced WP09: Advanced navigation features

---

## Testing Strategy

**Unit Tests** (Jest + React Native Testing Library):
- All services, utilities, Redux slices (WP02, WP03)
- All components (WP04, WP05, WP06, WP07)
- Target: 80% coverage minimum

**Component Tests**:
- All form components (LoginForm, SignupForm, ForgotPasswordForm)
- All reusable components (PasswordInput, PasswordStrength, AuthErrorMessage)

**E2E Tests** (Playwright):
- Complete user flows for US1, US2, US3, US4
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Cross-platform testing (iOS, Android, Web)

**Accessibility Tests**:
- VoiceOver testing (iOS)
- TalkBack testing (Android)
- Keyboard navigation testing (Web)
- Color contrast validation

---

## Success Metrics

**Completion Criteria**:
- ✅ All 64 subtasks completed
- ✅ All 20 functional requirements (FR-001 to FR-020) implemented
- ✅ All 12 success criteria (SC-001 to SC-012) met
- ✅ All 4 user stories (US1-US4) acceptance scenarios pass
- ✅ Test coverage ≥80% for all business logic
- ✅ WCAG 2.1 AA compliance achieved
- ✅ All E2E tests pass on iOS, Android, Web

**Quality Gates**:
- No TypeScript errors (`pnpm typecheck` passes)
- No linting errors (`pnpm lint` passes)
- All unit tests pass (`pnpm test`)
- All E2E tests pass (`pnpm test:e2e`)
- Code formatted (`pnpm format`)

---

## Notes

- All file paths are absolute from project root
- TypeScript strict mode enforced throughout
- TDD workflow mandatory for all tasks
- Accessibility compliance non-negotiable (WCAG 2.1 AA)
- Cross-platform testing required for all user flows
- Supabase Auth used exclusively (no custom auth logic per FR-016)
- Session persistence via Redux Persist + AsyncStorage (FR-007)
- Password requirements: 8+ chars, letter + number minimum (FR-003)
- Email verification required before main app access (FR-005)
- Generic error messages for security-sensitive operations (FR-011)

---

**Last Updated**: 2025-11-04
**Generated By**: `/spec-kitty.tasks` command
