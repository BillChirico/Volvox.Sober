# Implementation Plan: Authentication Screens

**Branch**: `001-auth-screens` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-screens/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement email/password authentication screens (login, signup, forgot password) using Supabase Auth. The feature provides secure user registration with email verification, session-based authentication with persistence across app restarts, and password reset functionality via email. All screens must render consistently across iOS, Android, and Web platforms while meeting WCAG 2.1 AA accessibility standards and maintaining 60 FPS performance.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**:

- Expo 54.x (universal app platform)
- React Native 0.81+
- Expo Router 4.x (file-based routing)
- Supabase Auth (authentication service)
- @supabase/supabase-js (Supabase client SDK)
- React Native Paper (Material Design UI components with theme system)
- Redux Toolkit + Redux Persist (state management with persistence)
- Yup (client-side form validation)

**Storage**:

- Supabase PostgreSQL 15+ (user accounts, auth tokens managed by Supabase Auth)
- AsyncStorage via Redux Persist (session token persistence on device)

**Testing**:

- Jest + React Native Testing Library (unit and component tests)
- Playwright (E2E tests for critical auth flows)
- Target: 80% code coverage for business logic

**Target Platform**: iOS 15+, Android 10+ (API level 29+), Web (modern browsers: Chrome, Firefox, Safari, Edge)

**Project Type**: Universal mobile app (Expo) with file-based routing

**Performance Goals**:

- Screen load time: < 2 seconds on mid-range devices
- Screen transitions: 60 FPS (16.67ms per frame)
- Authentication response: < 3 seconds for login/signup
- Email delivery: < 1 minute for verification/reset emails

**Constraints**:

- Bundle size: iOS/Android < 50MB, Web < 500KB (gzipped)
- Network dependency: Requires internet connectivity for auth operations (no offline mode)
- Supabase Auth service availability required
- Email verification mandatory before app access
- Session persistence required across app restarts

**Scale/Scope**:

- 3 authentication screens (Login, Signup, Forgot Password)
- 4 user stories (P1: Registration, P1: Login, P2: Password Recovery, P3: Navigation)
- ~15-20 components (screens, forms, inputs, buttons, error displays)
- Cross-platform: Single codebase for iOS, Android, Web
- Expected initial user base: 100-1000 users (MVP)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**I. Type Safety & Code Quality**

- [x] TypeScript strict mode enabled (`strict: true` in tsconfig.json) - Project already configured
- [x] No `any` types - use `unknown` or proper types - Planned for all auth code
- [x] All exported functions have explicit return types - Planned for all services and hooks
- [x] File naming conventions followed (PascalCase components, camelCase services/hooks) - Will follow existing patterns

**II. Test-Driven Development**

- [x] TDD workflow planned: Write tests → Verify failure → Implement → Verify pass → Refactor - Documented in tasks.md
- [x] 80% code coverage target for business logic - Auth services will be tested thoroughly
- [x] Testing pyramid: Unit tests → Integration tests → E2E tests - Planned for all auth flows
- [x] Tests co-located in `__tests__/` directories - Following project structure

**III. Cross-Platform UX Consistency**

- [x] UI components render consistently on iOS, Android, Web - Using Expo universal components
- [x] Platform-specific overrides justified and documented - None needed for auth screens (universal)
- [x] React Native Paper theme system used - All auth components will use Paper
- [x] Accessibility requirements met (labels, contrast, touch targets, screen readers) - FR-018 mandates WCAG AA
- [x] Dark mode supported via theme provider - Using existing theme context

**IV. Performance Standards**

- [x] App startup < 3 seconds on mid-range devices - Auth screens are lightweight
- [x] Screen transitions maintain 60 FPS - Simple form-based screens, no heavy animations
- [x] Real-time messaging latency < 500ms - N/A for auth screens (applies to messaging feature)
- [x] Bundle size within targets (iOS/Android < 50MB, Web < 500KB gzipped) - Auth adds minimal bundle size
- [x] Images optimized (WebP with JPEG fallback, lazy loading) - N/A for auth screens (no images)
- [x] Database queries optimized (indexes, pagination, caching) - Supabase Auth handles optimization

**V. Component Architecture**

- [x] Functional components only (no class components) - All React Native components will be functional
- [x] Consistent hooks order: useState → useEffect → custom hooks → handlers - Will follow pattern
- [x] Named exports preferred over default exports - Will use named exports
- [x] Single Responsibility Principle enforced - Each component has one purpose (LoginForm, SignupForm, etc.)
- [x] State management hierarchy followed (local → Redux → Supabase) - Auth state in Redux, server state from Supabase

**VI. Security & Privacy**

- [x] Row Level Security (RLS) enabled for all Supabase tables - Supabase Auth manages user table with RLS
- [x] Supabase Auth used (no custom auth logic) - FR-016 mandates Supabase Auth only
- [x] Sensitive data access properly restricted - Email verification required before app access (FR-005)
- [x] Environment variables not committed - .env.example provided, .env in .gitignore
- [x] Form inputs validated client-side (Yup) and server-side (Supabase) - Planned for all forms

**Constitution Compliance**: ✅ **PASSED** - All requirements met, no violations

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (auth)/                    # Expo Router group for auth screens
│   ├── _layout.tsx            # Auth group layout (stack navigator)
│   ├── login.tsx              # Login screen (US2: Existing User Login)
│   ├── signup.tsx             # Signup screen (US1: New User Registration)
│   ├── forgot-password.tsx    # Password recovery screen (US3: Password Recovery)
│   └── verify-email.tsx       # Email verification landing page
│
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx            # Login form component
│   │   ├── SignupForm.tsx           # Signup form component
│   │   ├── ForgotPasswordForm.tsx   # Password reset request form
│   │   ├── PasswordInput.tsx        # Password input with visibility toggle
│   │   ├── PasswordStrength.tsx     # Password strength indicator (US1)
│   │   └── AuthErrorMessage.tsx     # Error message display component
│   └── common/
│       ├── AccessibleButton.tsx     # Already exists for touch targets
│       └── AccessibleTextInput.tsx  # Already exists for accessibility
│
├── services/
│   ├── authService.ts         # Supabase Auth integration service
│   └── validationSchemas.ts   # Yup validation schemas for auth forms
│
├── store/
│   └── auth/
│       ├── authSlice.ts       # Redux slice for auth state
│       ├── authSelectors.ts   # Selectors for auth state
│       └── authThunks.ts      # Async thunks for auth operations
│
├── types/
│   └── auth.ts                # TypeScript interfaces for auth
│
├── hooks/
│   ├── useAuth.ts             # Custom hook for auth operations
│   └── useAuthRedirect.ts     # Custom hook for auth-based navigation
│
└── utils/
    └── passwordStrength.ts    # Password strength calculation utility

__tests__/
├── components/
│   └── auth/
│       ├── LoginForm.test.tsx
│       ├── SignupForm.test.tsx
│       ├── ForgotPasswordForm.test.tsx
│       └── PasswordStrength.test.tsx
│
├── services/
│   ├── authService.test.ts
│   └── validationSchemas.test.ts
│
├── store/
│   └── auth/
│       └── authSlice.test.ts
│
└── utils/
    └── passwordStrength.test.ts

e2e/
└── auth/
    ├── login.spec.ts          # E2E: Login flow
    ├── signup.spec.ts         # E2E: Signup + verification
    └── password-reset.spec.ts # E2E: Password recovery
```

**Structure Decision**: Using Expo's file-based routing with an `(auth)` route group for authentication screens. This aligns with the existing project structure where `app/` contains routes and `src/` contains reusable components, services, and business logic. Auth screens are grouped together for easy navigation and maintain separation from the main app screens (tabs, onboarding, etc.).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - Constitution compliance check passed. All requirements met without exceptions.
