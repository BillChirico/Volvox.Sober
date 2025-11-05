# WP06: User Login (US2)

**Status**: 📋 Planned | **Priority**: P1 | **Dependencies**: WP04 | **Effort**: 6-8 hours

## Objective
Implement user login flow with session persistence and auth redirect (US2).

## User Story (from spec.md)
**US2**: As an existing user, I want to login with my email and password so that I can access my account and connect with my sponsor/sponsee.

## Subtasks
- **T032**: Create app/(auth)/login.tsx (login screen, links to signup/forgot password)
- **T033**: Create LoginForm.tsx (email, password fields, login button)
- **T034**: Implement login validation/submission (Yup schema, loginThunk)
- **T035**: Verify session persistence with Redux Persist
- **T036**: Implement useAuthRedirect hook (redirect verified users, block unverified)
- **T037**: Add "Resend verification" for unverified users
- **T038** [P]: Write component tests for LoginForm
- **T039** [P]: Write E2E tests for login flow (all US2 scenarios)

## Acceptance Criteria
- FR-006: User can login with correct credentials (SC-004: 100% login success)
- FR-005: Unverified users blocked from main app (SC-005: 100% block rate)
- FR-007: Sessions persist across app restarts (SC-007: 100% persistence reliability)
- FR-013: Wrong password shows clear error message

## Files Created
- `app/(auth)/login.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/hooks/useAuthRedirect.ts`
- `__tests__/components/auth/LoginForm.test.tsx`
- `e2e/auth/login.spec.ts`
