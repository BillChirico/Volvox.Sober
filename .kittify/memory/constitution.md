<!--
SYNC IMPACT REPORT
==================
Version Change: (new constitution) → 1.0.0
Modified Principles: N/A (initial version)
Added Sections: All sections (initial creation)
Removed Sections: N/A

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section aligns with new principles
✅ spec-template.md - Requirements sections compatible with constitution constraints
✅ tasks-template.md - Task categorization reflects testing and quality principles
✅ commands/*.md - No updates required (generic guidance maintained)

Follow-up TODOs:
- Validate all future PRs against constitution principles
- Review constitution after first production deployment for refinement opportunities
-->

# Volvox.Sober Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**MUST Requirements**:
- All business logic MUST have unit tests written BEFORE implementation (TDD cycle: Red → Green → Refactor)
- All Supabase database operations MUST have integration tests validating Row Level Security policies
- All P1 user stories (matching, connections, sobriety tracking) MUST have E2E tests using Detox
- All Edge Function APIs MUST have contract tests validating OpenAPI specifications
- Test coverage MUST meet minimum thresholds: 80% for business logic, 100% for security-critical paths (RLS, authentication)

**Rationale**: Given the sensitive nature of recovery data and the critical importance of sponsor-sponsee connections, bugs in core functionality can cause real harm. Test-first development ensures correctness before deployment and provides regression protection as the system evolves.

**Tools & Skills**: Use `superpowers:test-driven-development` skill for TDD workflow guidance. Use MCP Playwright for E2E testing automation.

### II. Code Quality Standards

**MUST Requirements**:
- All TypeScript code MUST pass `eslint` and `prettier` checks with zero warnings
- All React components MUST follow functional component patterns with hooks (no class components)
- All Redux state management MUST use Redux Toolkit slices (no raw Redux)
- All API calls MUST use RTK Query (no manual fetch/axios calls in components)
- All database migrations MUST be versioned and forward-only (no schema rollbacks)
- All RLS policies MUST be documented inline with SQL comments explaining access rules

**Code Review Requirements**:
- All PRs MUST be reviewed by at least one other developer
- PRs > 500 lines MUST be split into smaller, reviewable chunks
- All PRs MUST pass automated CI checks (lint, typecheck, tests) before review

**Rationale**: Consistent code patterns reduce cognitive load, improve maintainability, and make onboarding new developers faster. Enforcing quality at PR time prevents technical debt accumulation.

**Tools & Skills**: Use `superpowers:code-reviewer` skill after major feature completion. Use MCP Serena for symbol-level code navigation and refactoring.

### III. User Experience Consistency

**MUST Requirements**:
- All UI components MUST use React Native Paper design system (no custom component libraries)
- All screens MUST support both light and dark themes with WCAG AA contrast ratios (4.5:1 minimum)
- All text MUST use theme-aware typography tokens (no hard-coded colors or font sizes)
- All touch targets MUST meet minimum size requirements (44x44pt iOS, 48x48dp Android)
- All forms MUST provide inline validation with clear error messages
- All loading states MUST show progress indicators (spinners, skeletons) with timeouts
- All network errors MUST display user-friendly messages with retry options

**Offline Experience**:
- Core features (sobriety tracking, step work viewing, message reading) MUST work offline
- Sync status MUST be visible in UI (syncing/synced/offline indicator)
- Queued actions MUST persist across app restarts
- Conflict resolution MUST present both versions for user decision on critical data (step work edits)

**Rationale**: Recovery support requires trust. Inconsistent UX erodes trust and causes confusion, especially for users in vulnerable states. Offline support ensures the app is reliable when network connectivity is poor.

**Tools & Skills**: Use MCP Magic for UI component generation following design system patterns. Use MCP Playwright for visual regression testing.

### IV. Performance Standards

**MUST Requirements**:
- Message delivery MUST complete in <5 seconds under normal network conditions (3G+)
- Matching algorithm MUST generate 3-5 matches in <60 seconds
- Dashboard screens MUST load initial data in <3 seconds (p95)
- Theme switching MUST complete in <1 second with no visual glitches
- App startup MUST show content in <2 seconds on mid-range devices
- Database queries MUST use appropriate indexes (no sequential scans on tables >1000 rows)
- Images MUST be optimized and lazy-loaded (no loading full resolution before display)

**Monitoring Requirements**:
- All Edge Functions MUST log execution time and include tracing IDs
- All API errors MUST be logged with context (user_id, request params, error stack)
- All slow queries (>1 second) MUST trigger alerts for optimization review

**Rationale**: Performance directly impacts user retention. Slow apps are abandoned, and in recovery support context, abandonment can mean loss of critical accountability.

**Tools & Skills**: Use MCP Sequential Thinking for performance bottleneck analysis. Use Supabase dashboard for query performance monitoring.

### V. Security & Privacy

**MUST Requirements**:
- User passwords MUST be handled exclusively by Supabase Auth (never stored in app code)
- All database tables with user data MUST have Row Level Security (RLS) policies defined
- RLS policies MUST be tested with automated tests attempting unauthorized access
- Private data (relapse notes, step work) MUST be filtered at application layer even if RLS permits read
- All external contact sharing (phone, email) MUST be opt-in only and clearly indicated in UI
- All JWT tokens MUST expire after reasonable duration (1 hour access tokens, refresh tokens revocable)
- All sensitive data transmission MUST use HTTPS (enforced by Supabase)

**Data Retention**:
- Disconnected relationships MUST archive messages for 90 days before deletion
- User's personal step work MUST be preserved indefinitely (even after disconnection)
- Account deletion MUST permanently remove all personal data within 30 days (except legal compliance data)

**Rationale**: Recovery data is extremely sensitive. Users must trust that their relapses, step work reflections, and personal struggles are protected. Security breaches would destroy user trust and potentially harm vulnerable individuals.

**Tools & Skills**: Use MCP Supabase for RLS policy management and testing. Use `superpowers:systematic-debugging` for security vulnerability investigation.

## Data Modeling Standards

**MUST Requirements**:
- All database tables MUST have `created_at` and `updated_at` timestamp columns
- All foreign keys MUST specify `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately
- All enum types MUST be defined at database level (not just TypeScript types)
- All user-generated content tables MUST have RLS policies enforcing data isolation
- All database triggers MUST have descriptive names and inline comments explaining purpose
- All migrations MUST be tested locally before merging to main branch

**Naming Conventions**:
- Table names: snake_case plural (e.g., `users`, `connection_requests`)
- Column names: snake_case (e.g., `sobriety_date`, `sponsor_id`)
- Indexes: `idx_tablename_columns` (e.g., `idx_messages_connection_id`)
- RLS policies: descriptive action (e.g., `"Users view own messages"`)

**Rationale**: Consistent data modeling reduces errors, improves query performance, and makes the schema self-documenting for new developers.

## API Contract Standards

**MUST Requirements**:
- All Edge Functions MUST have OpenAPI 3.0 specifications in `/contracts/` directory
- All endpoints MUST require JWT authentication (via `Authorization: Bearer <token>`) except `/auth/*` endpoints
- All error responses MUST follow standard format: `{error: string, error_description?: string, status_code: number}`
- All mutations MUST be idempotent where possible (repeated calls produce same result)
- All list endpoints MUST support pagination with `limit` and `cursor` parameters
- All timestamps MUST use ISO 8601 format with timezone (e.g., `2025-01-15T10:30:00Z`)

**Versioning**:
- API contracts MUST be versioned when breaking changes occur
- Breaking changes MUST be communicated in release notes with migration guidance
- Deprecated endpoints MUST remain functional for at least 30 days after deprecation notice

**Rationale**: Consistent API contracts make the backend predictable, simplify client development, and enable automated contract testing.

**Tools & Skills**: Use MCP Context7 for OpenAPI specification best practices. Use MCP Sequential Thinking for API design decisions.

## Development Workflow

**Feature Development Process**:
1. Create feature branch from main: `git checkout -b feature/<feature-name>`
2. Write tests first (TDD Red phase)
3. Implement minimum code to pass tests (TDD Green phase)
4. Refactor for quality and performance (TDD Refactor phase)
5. Run full test suite: `npm test`
6. Run lint and typecheck: `npm run lint && npm run typecheck`
7. Create PR with descriptive title and summary of changes
8. Address all PR feedback and re-request review
9. Squash and merge after approval

**Pre-Commit Checks** (Automated via Git Hooks):
- ESLint and Prettier formatting
- TypeScript type checking
- Unit tests for changed files
- No console.log statements (use proper logging)

**Code Review Standards**:
- Reviewers MUST verify constitution compliance (tests exist, quality standards met)
- Reviewers MUST check for security issues (RLS policies, input validation, XSS prevention)
- Reviewers MUST assess performance implications (unnecessary re-renders, N+1 queries, memory leaks)
- Reviewers MUST ensure UX consistency (design system usage, offline behavior, loading states)

**Rationale**: Systematic workflow ensures quality is built-in rather than inspected-in. Catching issues early (pre-commit, PR review) is faster and cheaper than catching them in production.

**Tools & Skills**: Use `superpowers:requesting-code-review` skill when completing features. Use MCP Morphllm for bulk code transformations during refactoring.

## Quality Gates

**Pre-Merge Gates** (All MUST Pass):
- All automated tests pass (unit, integration, contract)
- Code coverage meets minimum thresholds (80% business logic)
- ESLint/Prettier checks pass with zero warnings
- TypeScript compilation succeeds with no errors
- No TODO or FIXME comments in main code paths (allowed in non-critical areas with context)
- PR has been approved by at least one reviewer

**Pre-Release Gates** (All MUST Pass):
- All E2E tests pass on both iOS and Android
- Performance benchmarks meet defined thresholds (<3s dashboard load, <5s message delivery)
- All P1 user stories validated manually on real devices
- All database migrations tested on staging environment
- Security scan completed with no critical vulnerabilities
- Accessibility audit confirms WCAG AA compliance

**Production Monitoring** (Post-Release):
- Error rates monitored and alerts configured (>1% error rate triggers investigation)
- Performance metrics tracked (API response times, app startup time, database query times)
- User feedback reviewed weekly and prioritized by severity
- Incident response plan executed for any production issues

**Rationale**: Quality gates prevent regression and ensure that only production-ready code is deployed. Recovery support is critical infrastructure—failures can have real-world consequences for vulnerable users.

**Tools & Skills**: Use `superpowers:verification-before-completion` skill before claiming work is complete.

## Governance

**Constitution Authority**:
- This constitution supersedes all other development practices, style guides, and conventions
- When conflicts arise, constitution principles take precedence
- All PRs and code reviews MUST verify constitution compliance
- Deviation from constitution MUST be explicitly justified and documented in PR description

**Amendment Process**:
1. Propose amendment via GitHub issue with rationale and impact analysis
2. Discuss with team (minimum 3 working days for feedback)
3. Vote on amendment (requires 2/3 approval from core team)
4. Update constitution file with new version number (see versioning below)
5. Update all dependent templates and documentation
6. Communicate changes to all developers via team meeting and release notes

**Versioning Policy**:
- **MAJOR** (X.0.0): Backward-incompatible changes (principle removals, complete redefinitions)
- **MINOR** (x.Y.0): New principles added or existing principles significantly expanded
- **PATCH** (x.y.Z): Clarifications, wording improvements, typo fixes

**Compliance Review**:
- Constitution compliance MUST be part of every code review checklist
- Monthly retrospectives MUST include constitution effectiveness assessment
- Quarterly reviews MUST evaluate if constitution needs updates based on project evolution

**Runtime Guidance**:
- For agent-specific development guidance, refer to project root `CLAUDE.md` (auto-generated from feature plans)
- For immediate task context, refer to active feature's `plan.md` and `tasks.md` in `/kitty-specs/<feature>/`

**Rationale**: A living constitution maintains its relevance and prevents ossification. Regular review ensures principles evolve with the project while maintaining stability for day-to-day development.

**Version**: 1.0.0 | **Ratified**: 2025-11-03 | **Last Amended**: 2025-11-03
