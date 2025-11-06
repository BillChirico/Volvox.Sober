# Research: Authentication Screens

**Date**: 2025-11-04
**Feature**: Authentication Screens
**Branch**: 001-auth-screens

## Research Overview

This document consolidates research findings for implementing authentication screens with Supabase Auth in an Expo/React Native universal app. Research focused on Supabase Auth best practices, React Native form handling, accessibility compliance, and session management.

---

## Decision 1: Supabase Auth Integration Pattern

**Decision**: Use `@supabase/supabase-js` SDK with Redux Toolkit for state management and Redux Persist for session persistence.

**Rationale**:

- Supabase Auth SDK provides built-in email/password authentication, email verification, and password reset
- SDK handles token refresh automatically (access tokens expire after 1 hour by default)
- Redux Toolkit provides predictable state management with TypeScript support
- Redux Persist enables session persistence across app restarts (requirement FR-007)
- Separation of concerns: Supabase handles authentication, Redux handles application state

**Alternatives Considered**:

- **Direct Supabase calls without Redux**: Would require manual state management and session persistence logic
  - **Rejected because**: Increases complexity, violates DRY principle, harder to test
- **React Context only**: Would work for auth state but lacks built-in persistence
  - **Rejected because**: Would need custom persistence logic, Redux Persist is battle-tested
- **Custom auth service**: Would require implementing password hashing, token management, etc.
  - **Rejected because**: Violates FR-016 (must use Supabase Auth), introduces security risks

**Implementation Notes**:

- Initialize Supabase client in `src/services/authService.ts`
- Store auth state in `src/store/auth/authSlice.ts` (user, session, loading states)
- Use Redux Persist to save auth tokens to AsyncStorage
- Use Redux Thunks for async operations (login, signup, logout, password reset)

**References**:

- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Redux Toolkit best practices: https://redux-toolkit.js.org/usage/usage-guide

---

## Decision 2: Email Verification Flow

**Decision**: Use Supabase Auth's built-in email confirmation with magic link redirect to app.

**Rationale**:

- Supabase Auth automatically sends verification emails when `emailConfirm` is enabled
- Magic link in email redirects to app via deep link (Expo handles deep linking automatically)
- Prevents unauthorized access before email verification (security best practice)
- Aligns with FR-004 (send verification emails) and FR-005 (prevent unverified user access)

**Alternatives Considered**:

- **OTP (One-Time Password) verification**: User enters 6-digit code from email
  - **Rejected because**: More friction for users, requires additional UI, Supabase default is magic link
- **No email verification**: Allow immediate access after signup
  - **Rejected because**: Security risk (email enumeration, fake accounts), violates FR-005
- **Custom verification logic**: Build own email sending and verification system
  - **Rejected because**: Violates FR-016 (must use Supabase Auth), adds unnecessary complexity

**Implementation Notes**:

- Configure Supabase project with email templates for verification emails
- Set up deep linking in `app.json` (Expo config) with custom URL scheme
- Create `app/(auth)/verify-email.tsx` screen to handle magic link landing
- Display "Check your email" message after signup
- Provide "Resend verification email" option on login screen for unverified users

**References**:

- Supabase email confirmation: https://supabase.com/docs/guides/auth/auth-email
- Expo deep linking: https://docs.expo.dev/guides/linking/

---

## Decision 3: Password Reset Flow

**Decision**: Use Supabase Auth's password reset with magic link redirect to password update screen.

**Rationale**:

- Supabase Auth generates secure, time-limited reset tokens (24-hour expiry, FR-009)
- Magic link redirects to app where user can set new password securely
- No need to send password in email (security best practice)
- Prevents email enumeration attacks by showing generic message (FR-011)

**Alternatives Considered**:

- **Email with temporary password**: Send random password to user's email
  - **Rejected because**: Security risk (password sent in plain text via email), poor UX
- **OTP for password reset**: Send code, user enters code + new password
  - **Rejected because**: More friction, Supabase default is magic link
- **Security questions**: Ask security questions before allowing password reset
  - **Rejected because**: Security questions are weak, not required for MVP, adds complexity

**Implementation Notes**:

- Use `supabase.auth.resetPasswordForEmail()` to send reset email
- Magic link redirects to `app/(auth)/forgot-password.tsx` with reset token
- Show password input form to set new password
- Validate password strength (8+ characters, letter + number, FR-003)
- Show generic success message regardless of whether email exists (security, FR-011)

**References**:

- Supabase password reset: https://supabase.com/docs/guides/auth/auth-password-reset

---

## Decision 4: Form Validation Strategy

**Decision**: Use Yup for client-side validation schemas + Supabase constraints for server-side validation.

**Rationale**:

- Yup integrates seamlessly with React Native forms (used by Formik, React Hook Form)
- Provides reusable validation schemas with clear error messages
- Client-side validation gives immediate feedback (better UX)
- Server-side validation (Supabase) prevents malicious requests (security)
- Aligns with constitution requirement for dual validation

**Alternatives Considered**:

- **Custom validation functions**: Write manual validation logic for each field
  - **Rejected because**: Violates DRY principle, harder to maintain, less testable
- **Client-side only validation**: Skip server-side validation
  - **Rejected because**: Security risk (client can bypass validation), violates constitution
- **Zod instead of Yup**: Alternative schema validation library
  - **Rejected because**: Yup has more React Native ecosystem support, team familiarity

**Implementation Notes**:

- Create validation schemas in `src/services/validationSchemas.ts`:

  ```typescript
  export const loginSchema = yup.object({
    email: yup.string().email('Invalid email').required('Email required'),
    password: yup.string().required('Password required'),
  });

  export const signupSchema = yup.object({
    email: yup.string().email('Invalid email').required('Email required'),
    password: yup
      .string()
      .min(8, 'Minimum 8 characters')
      .matches(/[a-zA-Z]/, 'Must contain letter')
      .matches(/[0-9]/, 'Must contain number')
      .required('Password required'),
  });
  ```

- Use schemas in form components for real-time validation
- Supabase Auth validates email format and password requirements on server

**References**:

- Yup documentation: https://github.com/jquense/yup

---

## Decision 5: Session Persistence Pattern

**Decision**: Store Supabase auth tokens in Redux Persist with AsyncStorage backend.

**Rationale**:

- Redux Persist automatically saves Redux state to AsyncStorage
- Supabase SDK can rehydrate session from stored tokens on app restart
- Aligns with FR-007 (session persistence) and SC-007 (100% persistence reliability)
- AsyncStorage is secure for auth tokens on mobile devices

**Alternatives Considered**:

- **SecureStore (Expo)**: More secure storage using device keychain
  - **Rejected because**: Adds complexity, AsyncStorage sufficient for MVP, tokens expire hourly
- **Session cookie**: Store session in HTTP-only cookie
  - **Rejected because**: Doesn't work well in React Native (no browser cookies)
- **Manual storage management**: Use AsyncStorage directly without Redux Persist
  - **Rejected because**: Redux Persist is battle-tested, handles edge cases (corruption, migration)

**Implementation Notes**:

- Configure Redux Persist to whitelist `auth` slice
- Store `access_token`, `refresh_token`, `user` object in persisted state
- On app launch, rehydrate Redux state and validate session with Supabase
- If tokens expired, trigger refresh or logout flow
- Clear persisted auth state on logout

**References**:

- Redux Persist: https://github.com/rt2zz/redux-persist
- Supabase session management: https://supabase.com/docs/guides/auth/sessions

---

## Decision 6: Password Strength Indicator Implementation

**Decision**: Use custom utility function with visual indicator (weak/medium/strong) based on multiple criteria.

**Rationale**:

- Improves UX by providing real-time feedback on password quality (FR-020)
- Encourages users to create stronger passwords (security benefit)
- Custom implementation allows control over criteria and UI
- Lightweight (no external library needed)

**Alternatives Considered**:

- **zxcvbn library**: Advanced password strength estimator
  - **Rejected because**: Adds 800KB to bundle size (violates performance constraints), overkill for MVP
- **Simple length-only indicator**: Show strength based on character count only
  - **Rejected because**: Doesn't account for complexity (letters, numbers, symbols)
- **No indicator**: Just validate minimum requirements
  - **Rejected because**: Violates FR-020, poor UX, users don't know if password is strong

**Implementation Notes**:

- Create `src/utils/passwordStrength.ts` utility:

  ```typescript
  export type PasswordStrength = 'weak' | 'medium' | 'strong';

  export function calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }
  ```

- Create `src/components/auth/PasswordStrength.tsx` visual component
- Show colored bar (red/weak, yellow/medium, green/strong) below password input

**References**:

- Password strength best practices: OWASP guidelines

---

## Decision 7: Error Message Pattern

**Decision**: Use centralized error mapping function to convert Supabase errors to user-friendly messages.

**Rationale**:

- Supabase errors are technical (e.g., "Invalid login credentials")
- Need to avoid revealing security details (e.g., "User not found" reveals email exists, FR-011)
- Centralized mapping ensures consistency across all auth screens
- Easier to maintain and update error messages

**Alternatives Considered**:

- **Show Supabase errors directly**: Display raw error messages from SDK
  - **Rejected because**: Technical jargon confuses users, can reveal security information
- **Generic error for everything**: "Something went wrong" for all failures
  - **Rejected because**: Violates SC-009 (error messages must clearly communicate problem)
- **Inline error handling**: Map errors in each component
  - **Rejected because**: Violates DRY, inconsistent messaging

**Implementation Notes**:

- Create error mapping utility in `src/utils/authErrors.ts`:
  ```typescript
  export function mapAuthError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Incorrect email or password';
      case 'User already registered':
        return 'This email is already registered. Please login instead.';
      case 'Email not confirmed':
        return 'Please verify your email address before logging in';
      default:
        return 'Unable to complete request. Please try again.';
    }
  }
  ```
- Use generic messages for security-sensitive errors (password reset, email enumeration)
- Create `src/components/auth/AuthErrorMessage.tsx` for consistent error display

**References**:

- OWASP error handling: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html

---

## Decision 8: Accessibility Implementation

**Decision**: Use existing `AccessibleButton` and `AccessibleTextInput` components from codebase, ensure all auth screens meet WCAG 2.1 AA.

**Rationale**:

- Project already has accessible components (per docs/ACCESSIBILITY.md)
- Components enforce minimum touch targets (44x44pt iOS, 48x48dp Android)
- Built-in screen reader support and proper labeling
- Aligns with FR-018 (WCAG AA compliance) and constitution principle III

**Alternatives Considered**:

- **Build new accessible components**: Create auth-specific accessible components
  - **Rejected because**: Unnecessary duplication, existing components already meet requirements
- **Use vanilla React Native components**: Use basic TextInput, Button components
  - **Rejected because**: Violates constitution accessibility requirements, manual accessibility work
- **Third-party accessibility library**: Use react-native-a11y or similar
  - **Rejected because**: Project already has solution, adds dependency

**Implementation Notes**:

- Import `AccessibleButton` and `AccessibleTextInput` from `src/components/common/`
- Ensure all interactive elements have `accessibilityLabel` and `accessibilityHint`
- Use semantic roles (`button`, `text`, etc.) for screen reader navigation
- Test with VoiceOver (iOS) and TalkBack (Android) before deployment
- Verify color contrast ratios meet 4.5:1 for normal text, 3:1 for large text
- Use live regions for error announcements (`accessibilityLiveRegion="polite"`)

**References**:

- Project docs: docs/ACCESSIBILITY.md
- WCAG 2.1 AA guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

## Decision 9: Dark Mode Support

**Decision**: Use existing theme context (`useAppTheme` hook) from project, ensure all auth screens work in both light and dark modes.

**Rationale**:

- Project already has theme system with dark mode support (per docs/ACCESSIBILITY.md)
- Theme provides WCAG AA compliant colors for both light and dark modes
- Aligns with FR-017 (dark mode support) and constitution principle III
- No need to reinvent theme system

**Alternatives Considered**:

- **Build custom theme for auth**: Create separate theme system for auth screens
  - **Rejected because**: Inconsistent with rest of app, unnecessary duplication
- **Light mode only**: Skip dark mode for auth screens
  - **Rejected because**: Violates FR-017 and constitution, poor UX (jarring for dark mode users)
- **System preference only**: Only follow device theme setting
  - **Rejected because**: Project supports manual theme override, should be consistent

**Implementation Notes**:

- Import `useAppTheme` hook from `src/theme/ThemeContext`
- Use theme colors from `theme.colors` object (background, onBackground, primary, error, etc.)
- Never hard-code colors - always use theme tokens
- Test all screens in both light and dark modes
- Verify text contrast meets WCAG AA in both modes
- Use theme-aware icons if needed (e.g., eye icon for password visibility toggle)

**References**:

- Project docs: docs/ACCESSIBILITY.md (Dark Mode Implementation section)

---

## Decision 10: Navigation Pattern

**Decision**: Use Expo Router's stack navigation within `(auth)` group, with programmatic navigation after auth success.

**Rationale**:

- Expo Router provides type-safe file-based routing
- Stack navigation allows back button navigation between auth screens (US4)
- Programmatic navigation (`router.replace()`) prevents back navigation to auth after login
- Aligns with project's existing routing approach

**Alternatives Considered**:

- **Tab navigation for auth**: Use tabs to switch between login/signup
  - **Rejected because**: Auth flows are sequential (login → forgot password), not parallel
- **Manual stack navigator**: Use React Navigation directly
  - **Rejected because**: Project uses Expo Router, should be consistent
- **Single screen with conditional rendering**: Show login/signup/forgot password in one screen
  - **Rejected because**: Harder to maintain, unclear navigation, violates Single Responsibility

**Implementation Notes**:

- Create `app/(auth)/_layout.tsx` with stack navigator configuration
- Use `<Link>` components for navigation between auth screens (US4, acceptance scenarios)
- After successful login: `router.replace('/(tabs)')` to main app (prevents back navigation)
- After signup: Show "Check your email" message, allow navigation back to login
- After password reset request: Show success message, allow back to login
- Clear form state on navigation (FR-014)

**References**:

- Expo Router: https://docs.expo.dev/router/introduction/
- Stack Navigator: https://docs.expo.dev/router/advanced/stack/

---

## Research Summary

All technical decisions have been made with clear rationale and alternatives considered. No remaining clarifications needed. Implementation can proceed to Phase 1 (Design & Contracts) with confidence in the chosen approach.

**Key Technologies**:

- Supabase Auth SDK for authentication
- Redux Toolkit + Redux Persist for state management
- Yup for form validation
- Expo Router for navigation
- React Native Paper for UI components
- Existing accessibility components

**Risks Mitigated**:

- Security: Using Supabase Auth (no custom auth logic), dual validation, generic error messages
- Performance: Minimal bundle size impact, efficient session persistence
- Accessibility: WCAG AA compliance via existing components
- Cross-platform: Universal Expo components, no platform-specific code needed
- Maintainability: Centralized validation schemas, error mapping, reusable components
