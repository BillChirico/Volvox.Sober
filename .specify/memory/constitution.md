# Volvox.Sober Project Constitution

<!--
SYNC IMPACT REPORT - Version 1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version Change: Initial constitution (0.0.0 → 1.0.0)
Rationale: Initial constitution establishing core governance for Volvox.Sober

Modified Principles:
- N/A (initial version)

Added Sections:
- I. Type Safety & Code Quality
- II. Test-Driven Development (NON-NEGOTIABLE)
- III. Cross-Platform UX Consistency
- IV. Performance Standards
- V. Component Architecture
- VI. Security & Privacy
- Development Workflow
- Quality Gates
- Governance

Removed Sections:
- N/A (initial version)

Templates Requiring Updates:
✅ .specify/templates/plan-template.md - Updated with constitution alignment checks
✅ .specify/templates/spec-template.md - Aligned with UX consistency and testing requirements
✅ .specify/templates/tasks-template.md - Aligned with TDD and parallel execution principles

Follow-up TODOs:
- None
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->

## Core Principles

### I. Type Safety & Code Quality

**Requirements**:

- TypeScript strict mode MUST be enabled at all times (`strict: true` in tsconfig.json)
- NO `any` types permitted - use `unknown` or proper type definitions
- ALL exported functions MUST have explicit return types
- ALL component props MUST be defined via TypeScript interfaces
- Interfaces MUST be preferred over type aliases for object shapes
- File naming MUST follow conventions:
  - Components: PascalCase (`UserProfile.tsx`)
  - Hooks: camelCase with `use` prefix (`useAuth.ts`)
  - Services: camelCase (`authService.ts`)
  - Types: PascalCase (`User.ts`)

**Rationale**: Type safety prevents runtime errors, improves code maintainability, and provides superior developer experience through IntelliSense. Strict TypeScript catches bugs at compile-time rather than in production. Consistent naming conventions reduce cognitive load and improve codebase navigation.

---

### II. Test-Driven Development (NON-NEGOTIABLE)

**Requirements**:

- TDD cycle MUST be followed: Write test → Verify failure → Implement → Verify pass → Refactor
- Tests MUST be written BEFORE implementation for all new features
- Minimum 80% code coverage REQUIRED for business logic
- Testing pyramid MUST be respected:
  - **Unit tests** (Jest + React Native Testing Library): Component logic, utilities, services
  - **Integration tests** (Jest): Feature workflows, service interactions
  - **E2E tests** (Playwright): Critical user journeys, cross-platform validation
- Tests MUST be co-located in `__tests__/` directories
- Test file naming MUST mirror source files with `.test.tsx` or `.test.ts` suffix
- NO skipping tests to make builds pass - investigate and fix failures

**Rationale**: TDD ensures features are testable by design, catches regressions early, and provides living documentation of system behavior. The testing pyramid balances thoroughness with execution speed. Test-first development forces clear requirements before implementation.

---

### III. Cross-Platform UX Consistency

**Requirements**:

- UI components MUST render consistently across iOS, Android, and Web platforms
- Platform-specific overrides ONLY when native behavior is critical:
  - Use `Component.ios.tsx`, `Component.android.tsx`, `Component.web.tsx` for platform-specific implementations
  - Default `Component.tsx` MUST provide universal fallback
- React Native Paper theme system MUST be used for all UI components
- Accessibility MUST be first-class:
  - All interactive elements MUST have accessible labels
  - Color contrast MUST meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
  - Touch targets MUST be minimum 44x44 points (iOS) / 48x48 dp (Android)
  - Screen reader support MUST be verified with VoiceOver (iOS) and TalkBack (Android)
- Dark mode MUST be supported across all platforms via theme provider

**Rationale**: Volvox.Sober users expect consistent experience regardless of platform. Recovery tools must be accessible to all users including those with disabilities. Platform-specific overrides allow native optimizations while maintaining baseline consistency.

---

### IV. Performance Standards

**Requirements**:

- App startup MUST complete in < 3 seconds on mid-range devices
- Screen transitions MUST maintain 60 FPS (16.67ms per frame)
- Real-time messaging latency MUST be < 500ms (Supabase Realtime)
- Bundle size targets:
  - iOS/Android: < 50MB total app size
  - Web: < 500KB initial bundle (gzipped)
- Images MUST be optimized:
  - Use WebP format with JPEG fallback
  - Lazy load off-screen images
  - Responsive image sizes for different screen densities
- Database queries MUST be optimized:
  - Use indexes for frequent queries
  - Limit result sets with pagination
  - Cache frequently accessed data with Redux Persist

**Rationale**: Mobile users have limited bandwidth and device capabilities. Recovery apps must be reliable and responsive in critical moments. Poor performance erodes trust in the platform.

---

### V. Component Architecture

**Requirements**:

- Functional components ONLY - NO class components
- Hooks order MUST be consistent: `useState` → `useEffect` → custom hooks → event handlers
- Component structure MUST follow pattern:

  ```typescript
  // 1. Props interface
  interface ComponentProps { ... }

  // 2. Component implementation
  export function Component({ prop1, prop2 }: ComponentProps) {
    // Hooks
    // Handlers
    // Render
  }

  // 3. Styles (if using StyleSheet)
  const styles = StyleSheet.create({ ... });
  ```

- Named exports MUST be preferred over default exports
- Single Responsibility Principle: Each component has ONE clear purpose
- State management hierarchy:
  - Local state: `useState` for component-specific state
  - Shared state: Redux Toolkit for global app state
  - Server state: Supabase real-time subscriptions with Redux normalization

**Rationale**: Consistent component structure reduces cognitive overhead and makes code reviews faster. Functional components with hooks are the React standard. Clear state management hierarchy prevents prop-drilling and state duplication.

---

### VI. Security & Privacy

**Requirements**:

- Row Level Security (RLS) MUST be enabled for ALL Supabase tables
- Authentication MUST use Supabase Auth (no custom auth logic)
- Sensitive data (sobriety dates, worksheet content) MUST only be visible to authorized users:
  - Sponsors see sponsee data via explicit connection
  - Sponsees see sponsor data via explicit connection
  - No public access to personal recovery information
- Environment variables MUST NEVER be committed to repository
- API keys MUST be stored in `.env` (local) or secure environment (production)
- Form inputs MUST be validated on both client (Yup) and server (Supabase constraints)

**Rationale**: Recovery data is highly sensitive. Users must trust the platform to protect their privacy. RLS provides database-level security that cannot be bypassed by client-side code.

---

## Development Workflow

**Branch Strategy**:

- Main branch: `main` (protected, production-ready)
- Feature branches: `###-feature-name` format (e.g., `001-volvox-sober-recovery`)
- Feature branches MUST branch from `main`
- NO direct commits to `main` - all changes via pull requests

**Commit Standards**:

- Conventional Commits format MUST be used:
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring without behavior change
  - `test:` - Adding or updating tests
  - `perf:` - Performance improvements
  - `chore:` - Build/tooling changes

**Pre-Commit Checklist**:

1. Run `pnpm test` - all tests pass
2. Run `pnpm typecheck` - no TypeScript errors
3. Run `pnpm lint` - no linting errors
4. Run `pnpm format` - code is formatted
5. Verify tests were written BEFORE implementation (TDD compliance)
6. Check code coverage meets 80% minimum for new/modified code

---

## Quality Gates

**Before Implementation**:

- [ ] Feature specification exists in `/specs/[###-feature]/spec.md`
- [ ] User stories are prioritized and independently testable
- [ ] Implementation plan exists in `/specs/[###-feature]/plan.md`
- [ ] Constitution compliance verified (no violations or violations justified)

**During Implementation**:

- [ ] Tests written and failing before implementation
- [ ] TypeScript strict mode compliance verified
- [ ] Accessibility requirements met (labels, contrast, touch targets)
- [ ] Performance budgets not exceeded
- [ ] Platform-specific overrides justified and documented

**Before Merge**:

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage ≥ 80% for business logic
- [ ] TypeScript compilation successful with no errors
- [ ] Linting passes with no errors
- [ ] Code formatted with Prettier
- [ ] Pull request reviewed and approved
- [ ] Feature tested on iOS, Android, and Web platforms

---

## Governance

**Amendment Process**:

1. Proposed changes MUST be documented with rationale
2. Changes MUST be reviewed by project maintainer (Bill Chirico)
3. Breaking changes require migration plan for existing code
4. Constitution version MUST be incremented per semantic versioning:
   - MAJOR: Backward incompatible changes (removing/redefining principles)
   - MINOR: New principles or material expansions
   - PATCH: Clarifications, wording improvements, non-semantic refinements

**Compliance**:

- ALL pull requests MUST verify constitution compliance
- Violations MUST be justified in implementation plan (`Complexity Tracking` section)
- Use `CLAUDE.md` for AI-specific development guidance that complements this constitution

**Enforcement**:

- Constitution supersedes all other practices and conventions
- When conflicts arise, constitution principles take precedence
- Unjustified violations block pull request approval

**Version**: 1.0.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
