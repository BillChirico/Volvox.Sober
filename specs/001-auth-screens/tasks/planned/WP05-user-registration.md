# WP05: User Registration (US1)

**Status**: 📋 Planned | **Priority**: P1 | **Dependencies**: WP04 | **Effort**: 6-8 hours

## Objective

Implement user registration flow with email verification (US1).

## User Story (from spec.md)

**US1**: As a new user, I want to create an account with my email and password so that I can access the Volvox.Sober platform.

## Subtasks

- **T024**: Create app/(auth)/\_layout.tsx (Stack navigator for auth screens)
- **T025**: Create app/(auth)/signup.tsx (signup screen, "Check your email" message)
- **T026**: Create SignupForm.tsx (email, password, confirm password, PasswordStrength)
- **T027**: Implement signup validation/submission (Yup schema, signupThunk dispatch)
- **T028**: Implement email verification flow (Supabase sends verification email)
- **T029**: Add "Check your email" confirmation message
- **T030** [P]: Write component tests for SignupForm
- **T031** [P]: Write E2E tests for signup flow (all US1 scenarios)

## Acceptance Criteria (from spec.md)

- FR-001: User can create account with email/password (SC-001: 100% signup success)
- FR-003: Password requirements enforced (8+ chars, letter + number, SC-003: 100% validation)
- FR-004: Verification email sent (SC-002: 100% email delivery)
- FR-012: Duplicate email prevented
- FR-020: Password strength indicator visible

## Files Created

- `app/(auth)/_layout.tsx`
- `app/(auth)/signup.tsx`
- `src/components/auth/SignupForm.tsx`
- `__tests__/components/auth/SignupForm.test.tsx`
- `e2e/auth/signup.spec.ts`
