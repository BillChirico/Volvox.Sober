# Task Completion Checklist

When completing any development task in Volvox.Sober, ensure all items are verified before marking as done.

## Pre-Implementation Checklist
- [ ] Read and understand the work package prompt in `kitty-specs/001-volvox-sober-recovery/tasks/`
- [ ] Verify prerequisite work packages are completed
- [ ] Review related documentation (spec.md, plan.md, data-model.md)
- [ ] Identify any dependencies or blockers

## Test-Driven Development (TDD) - MANDATORY
- [ ] **RED**: Write failing test first (before any implementation)
- [ ] **GREEN**: Implement minimal code to pass the test
- [ ] **REFACTOR**: Improve code quality while keeping tests green
- [ ] Verify 80%+ test coverage for business logic
- [ ] All tests pass: `npm test`
- [ ] No skipped or disabled tests (skipping tests is NOT allowed)

## Code Quality Gates
- [ ] No linting errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] No console.log or debugging statements left in code
- [ ] All imports are used (no unused imports)
- [ ] Functions have explicit return types
- [ ] All variables have explicit types (no implicit `any`)

## Accessibility Compliance (WCAG 2.1 Level AA)
- [ ] Interactive elements have `accessibilityLabel`
- [ ] Interactive elements have appropriate `accessibilityRole`
- [ ] Color contrast meets 4.5:1 ratio (use theme tokens)
- [ ] Component works with screen readers
- [ ] Keyboard navigation supported (where applicable)

## Documentation
- [ ] JSDoc comments for complex functions
- [ ] Type definitions exported where needed
- [ ] README updated if new scripts/commands added
- [ ] Environment variables documented in `.env.example`

## Integration Testing
- [ ] Component renders without crashing
- [ ] API calls are properly mocked in tests
- [ ] Navigation flows work as expected
- [ ] Error states are handled gracefully
- [ ] Loading states display correctly

## Performance Checks
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Images are optimized and cached
- [ ] API calls are debounced/throttled where appropriate
- [ ] Large lists use FlatList with proper virtualization
- [ ] No memory leaks (cleanup in useEffect)

## Database Changes (if applicable)
- [ ] Migration file created: `supabase migration new <name>`
- [ ] Migration tested locally: `supabase db push`
- [ ] Row Level Security (RLS) policies defined
- [ ] Indexes created for query performance
- [ ] TypeScript types generated: `supabase gen types typescript --local`

## Security Verification
- [ ] No sensitive data in logs or error messages
- [ ] API keys/secrets in environment variables (not hardcoded)
- [ ] Input validation implemented (using Zod schemas)
- [ ] Authentication guards in place where needed
- [ ] HTTPS enforced for API calls

## Cross-Platform Testing
- [ ] Tested on iOS simulator (if macOS available)
- [ ] Tested on Android emulator
- [ ] Responsive design works on different screen sizes
- [ ] Dark/light mode rendering verified
- [ ] Native features work on both platforms (if applicable)

## CI/CD Pipeline
- [ ] GitHub Actions workflow passes
- [ ] All automated tests pass in CI
- [ ] Code coverage meets 80% threshold
- [ ] No merge conflicts with main branch

## Git Best Practices
- [ ] Changes committed to feature branch (not main/master)
- [ ] Commit messages follow convention: `type(scope): description`
- [ ] No untracked files committed (.env, temp files, etc.)
- [ ] `.gitignore` updated if new files should be excluded

## Definition of Done
- [ ] Feature/task fully implemented (no TODOs or placeholders)
- [ ] All acceptance criteria met (from work package prompt)
- [ ] Code reviewed by peer (if team size > 1)
- [ ] Work package moved to `for_review` lane
- [ ] Ready for merge to main branch

## Commands to Run Before Task Completion
```bash
# Verify everything passes
npm run lint
npm test
npx tsc --noEmit

# If all pass, commit and push
git add .
git commit -m "feat(scope): description"
git push origin feature/your-branch
```

## Notes
- **Never skip tests to make builds pass** - investigate and fix failures
- **Never disable linting rules** - fix the code instead
- **TDD is non-negotiable** - tests must be written before implementation
- If you encounter blockers, document them and seek help before proceeding