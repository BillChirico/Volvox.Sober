# WP04: Reusable Auth Components

**Status**: 📋 Planned | **Priority**: Foundational | **Dependencies**: WP03 | **Effort**: 3-4 hours

## Objective
Create reusable authentication UI components with accessibility and theming support.

## Subtasks
- **T018** [P]: Create PasswordInput.tsx (visibility toggle, theme support, accessible)
- **T019** [P]: Create PasswordStrength.tsx (colored bar indicator, real-time feedback)
- **T020** [P]: Create AuthErrorMessage.tsx (accessibilityLiveRegion for screen readers)
- **T021** [P]: Write tests for PasswordInput
- **T022** [P]: Write tests for PasswordStrength
- **T023** [P]: Write tests for AuthErrorMessage

## Requirements
- React Native Paper for UI components
- Light/dark mode support (FR-017)
- WCAG 2.1 AA compliance (FR-018)
- Password strength feedback (FR-020)

## Files Created
- `src/components/auth/PasswordInput.tsx`
- `src/components/auth/PasswordStrength.tsx`
- `src/components/auth/AuthErrorMessage.tsx`
- `__tests__/components/auth/PasswordInput.test.tsx`
- `__tests__/components/auth/PasswordStrength.test.tsx`
- `__tests__/components/auth/AuthErrorMessage.test.tsx`
