# WP09: Navigation and Screen Transitions (US4)

**Status**: 📋 Planned | **Priority**: P3 | **Dependencies**: WP05, WP06, WP07 | **Effort**: 2-3 hours

## Objective
Implement navigation links between auth screens and form state clearing (US4).

## User Story (from spec.md)
**US4**: As a user navigating auth screens, I want to easily switch between login, signup, and password reset so that I can complete my desired action without confusion.

## Subtasks
- **T053**: Add navigation links between auth screens
  - "Already have an account? Login" on signup
  - "Don't have an account? Sign up" on login
  - "Forgot password?" on login
  - "Back to login" on password reset
- **T054**: Implement form state clearing on navigation (FR-014)
- **T055**: Add "Go back" functionality (stack navigator back button)
- **T056** [P]: Write navigation flow tests (all US4 scenarios)

## Acceptance Criteria
- All navigation links functional (US4 acceptance scenarios)
- Forms clear on navigation (FR-014)
- Back button works correctly on all platforms

## Files Modified
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`
- `app/(auth)/forgot-password.tsx`

## Files Created
- `e2e/auth/navigation.spec.ts`
