# WP07: Password Recovery (US3)

**Status**: 📋 Planned | **Priority**: P2 | **Dependencies**: WP04 | **Effort**: 5-7 hours

## Objective

Implement password reset flow with email-based token verification (US3).

## User Story (from spec.md)

**US3**: As a user who forgot their password, I want to reset my password via email so that I can regain access to my account.

## Subtasks

- **T040**: Create app/(auth)/forgot-password.tsx (handles both reset request and password update)
- **T041**: Create ForgotPasswordForm.tsx (email field OR new password fields)
- **T042**: Implement password reset request flow (generic success message per FR-011)
- **T043**: Implement password update flow with token validation
- **T044**: Add generic success messaging (security - don't reveal email existence)
- **T045**: Handle expired/invalid token edge cases (>24 hours per FR-009)
- **T046** [P]: Write component tests for ForgotPasswordForm
- **T047** [P]: Write E2E tests for password recovery (all US3 scenarios)

## Acceptance Criteria

- FR-008: User can request password reset (SC-006: 100% email delivery)
- FR-009: Reset tokens expire after 24 hours
- FR-011: Generic messages prevent email enumeration
- FR-003: Old password invalidated after reset (SC-008: 100% reset success)

## Files Created

- `app/(auth)/forgot-password.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`
- `__tests__/components/auth/ForgotPasswordForm.test.tsx`
- `e2e/auth/password-recovery.spec.ts`
