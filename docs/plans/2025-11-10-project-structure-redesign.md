# Project Structure Redesign

**Date**: 2025-11-10
**Status**: Approved Design
**Type**: Architectural Refactoring

## Overview

This document describes the migration from a layer-based architecture to a feature-based architecture for Volvox.Sober. The new structure improves code organization, maintainability, and developer experience by co-locating related code within feature modules.

## Goals

1. **Improve code discoverability** - Make it easy to find all code related to a feature
2. **Enhance maintainability** - Enable isolated feature development and testing
3. **Scale effectively** - Support project growth without increasing complexity
4. **Establish clear boundaries** - Define explicit interfaces between features and shared code

## Design Decisions

### Architectural Approach: Feature-Based

**Chosen**: Feature-based architecture with clear separation between features, shared code, core infrastructure, and external integrations.

**Rationale**:
- Features in this app (auth, messages, connections, sobriety) are well-defined domains
- Co-location reduces cognitive load and improves navigation
- Scales better than layer-based as project grows
- Aligns with modern React/React Native best practices

### Screen Layer Relationship: Thin Wrappers

**Chosen**: Expo Router screens in `app/` are minimal wrappers that import screen components from feature modules.

**Rationale**:
- Maximizes feature portability and reusability
- Clear separation between routing and business logic
- Features can be tested independently of routing
- Easier to migrate routing systems if needed

### Test Organization: Mixed Approach

**Chosen**: Unit tests co-located with source files, integration/E2E tests centralized in `__tests__/`.

**Rationale**:
- Co-located unit tests are easier to maintain
- Integration tests often span multiple features
- E2E tests test complete flows, not individual features
- Clear distinction between test types

### Shared Code Organization: Three-Tier

**Chosen**: Separate layers for shared components (`shared/`), core infrastructure (`core/`), and external integrations (`lib/`).

**Rationale**:
- Clear boundaries for different types of shared code
- Prevents "shared" from becoming a catch-all
- Makes dependencies explicit
- Easier to understand scope and purpose

### Migration Strategy: Big Bang

**Chosen**: Complete restructuring in a single migration effort.

**Rationale**:
- Avoids long period of mixed structure
- Easier to review as a complete change
- Project is in active development phase (Phase 10)
- No production users to impact

## New Structure

### Top-Level Directory Layout

```
volvox-sober/
├── app/                    # Expo Router screens (thin wrappers)
│   ├── (tabs)/
│   ├── (auth)/
│   ├── (onboarding)/
│   ├── _layout.tsx
│   └── index.tsx
│
├── src/
│   ├── features/           # Feature modules (self-contained)
│   │   ├── auth/
│   │   ├── messages/
│   │   ├── connections/
│   │   ├── matches/
│   │   ├── sobriety/
│   │   ├── profile/
│   │   ├── onboarding/
│   │   └── check-ins/
│   │
│   ├── shared/            # Cross-feature reusable code
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── core/              # App-wide infrastructure
│   │   ├── theme/
│   │   ├── config/
│   │   ├── navigation/
│   │   └── store/         # Root store configuration
│   │
│   └── lib/               # External service integrations
│       ├── supabase/
│       └── analytics/
│
├── __tests__/             # Integration & E2E tests only
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── helpers/
│
├── supabase/              # Backend
├── assets/                # Static resources
└── [config files]
```

### Feature Module Internal Structure

Each feature module follows this structure (using `messages` as example):

```
src/features/messages/
├── components/              # Feature-specific UI components
│   ├── MessageList.tsx
│   ├── MessageList.test.tsx
│   ├── MessageBubble.tsx
│   ├── MessageBubble.test.tsx
│   ├── MessageInput.tsx
│   ├── MessageInput.test.tsx
│   └── index.ts             # Barrel export
│
├── hooks/                   # Feature-specific hooks
│   ├── useMessages.ts
│   ├── useMessages.test.ts
│   ├── useMessageSubscription.ts
│   └── index.ts
│
├── services/                # Business logic & API calls
│   ├── messageService.ts
│   ├── messageService.test.ts
│   └── index.ts
│
├── store/                   # Redux state (if needed)
│   ├── messagesSlice.ts
│   ├── messagesSlice.test.ts
│   ├── messagesSelectors.ts
│   ├── messagesThunks.ts
│   └── index.ts
│
├── types/                   # Feature-specific types
│   ├── message.types.ts
│   ├── conversation.types.ts
│   └── index.ts
│
├── screens/                 # Screen components (exported to app/)
│   ├── MessagesScreen.tsx
│   ├── MessageDetailScreen.tsx
│   └── index.ts
│
├── utils/                   # Feature-specific utilities
│   ├── messageFormatter.ts
│   ├── messageFormatter.test.ts
│   └── index.ts
│
└── index.ts                 # Public API (exports only what app/ needs)
```

**Key patterns:**
- Co-located unit tests (`.test.tsx` files next to source)
- Barrel exports via `index.ts` control what's exposed
- `screens/` folder contains full screen components
- Root `index.ts` creates public API for the feature

### Shared Infrastructure

#### src/shared/ - Cross-feature Reusable Code

```
src/shared/
├── components/              # Reusable UI components
│   ├── buttons/
│   │   ├── AccessibleButton.tsx
│   │   ├── AccessibleButton.test.tsx
│   │   └── index.ts
│   ├── forms/
│   │   ├── FormField.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Container.tsx
│   │   ├── SafeArea.tsx
│   │   └── index.ts
│   └── index.ts
│
├── hooks/                   # Generic React hooks
│   ├── useDebounce.ts
│   ├── useDebounce.test.ts
│   ├── useAsync.ts
│   └── index.ts
│
├── utils/                   # Helper functions
│   ├── date.utils.ts
│   ├── date.utils.test.ts
│   ├── validation.utils.ts
│   └── index.ts
│
└── types/                   # Shared TypeScript types
    ├── common.types.ts
    ├── api.types.ts
    └── index.ts
```

**Usage criteria**: Code goes in `shared/` if used by 2+ features.

#### src/core/ - App-wide Infrastructure

```
src/core/
├── theme/                   # Design system
│   ├── ThemeContext.tsx
│   ├── ThemeProvider.tsx
│   ├── tokens.ts           # Colors, spacing, typography
│   └── index.ts
│
├── config/                  # App configuration
│   ├── env.ts              # Environment variables
│   ├── constants.ts        # App constants
│   └── index.ts
│
├── navigation/              # Navigation utilities
│   ├── linking.ts          # Deep linking config
│   ├── navigationRef.ts
│   └── index.ts
│
└── store/                   # Redux root configuration
    ├── rootReducer.ts
    ├── store.ts
    ├── persistConfig.ts
    └── index.ts
```

**Usage criteria**: Code goes in `core/` if it's app-wide infrastructure.

#### src/lib/ - External Service Wrappers

```
src/lib/
├── supabase/               # Supabase integration
│   ├── client.ts           # Configured client
│   ├── auth.ts             # Auth helpers
│   ├── realtime.ts         # Realtime helpers
│   ├── storage.ts          # Storage helpers
│   └── index.ts
│
└── analytics/              # Analytics integration (future)
    ├── client.ts
    ├── events.ts
    └── index.ts
```

**Usage criteria**: Code goes in `lib/` if it wraps an external service.

### Testing Organization

#### Test Types & Locations

```
# Unit Tests - Co-located with source files
src/features/messages/components/MessageBubble.test.tsx
src/features/messages/hooks/useMessages.test.ts
src/features/messages/services/messageService.test.ts
src/shared/hooks/useDebounce.test.ts

# Integration Tests - Centralized
__tests__/integration/
├── messages/
│   ├── messages-integration.test.tsx
│   └── realtime-subscription.test.tsx
├── auth/
│   └── auth-flow-integration.test.tsx
└── connections/
    └── connection-workflow.test.tsx

# E2E Tests - Centralized
__tests__/e2e/
├── accessibility.spec.ts
├── dark-mode.spec.ts
├── messaging-flow.spec.ts
├── connections-flow.spec.ts
├── matching-flow.spec.ts
├── onboarding-flow.spec.ts
├── profile-flow.spec.ts
├── sobriety-tracking.spec.ts
└── navigation-flow.spec.ts

# Test Utilities
__tests__/fixtures/         # Test data
__tests__/helpers/          # Test utilities
```

#### Test Type Definitions

**Unit Tests** (co-located `.test.tsx`):
- Test single component/function in isolation
- Fast, run on every save
- Mock all dependencies
- Example: Button renders correctly, hook returns expected value

**Integration Tests** (`__tests__/integration/`):
- Test multiple units working together
- Test Redux + Services + Components interaction
- Mock only external services (Supabase)
- Example: Sending a message updates store and UI

**E2E Tests** (`__tests__/e2e/*.spec.ts`):
- Test complete user flows in browser
- Playwright with real interactions
- No mocks (use test Supabase instance)
- Example: User logs in, sends message, receives response

## Migration Plan

### Phase 1: Preparation (Low Risk)

**Tasks:**
1. Create new directory structure (empty folders)
2. Set up path aliases in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/features/*": ["src/features/*"],
         "@/shared/*": ["src/shared/*"],
         "@/core/*": ["src/core/*"],
         "@/lib/*": ["src/lib/*"]
       }
     }
   }
   ```
3. Update Jest config for new paths
4. Update ESLint config for import rules
5. Create `index.ts` barrel files in each folder
6. Document the new structure in CLAUDE.md

**Validation**: TypeScript resolves new paths, no runtime changes yet.

### Phase 2: Move Shared Code (Foundation)

**Tasks:**
1. Move `src/theme/` → `src/core/theme/`
2. Move `src/constants/` → `src/core/config/`
3. Move `src/types/` → Split between `src/shared/types/` and feature-specific
4. Move `src/utils/` → `src/shared/utils/`
5. Create `src/lib/supabase/` and consolidate Supabase client config
6. Update imports with automated search/replace:
   ```bash
   # Example
   find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/theme|@/core/theme|g'
   ```

**Validation**: Run `pnpm typecheck` and `pnpm test` after each move.

### Phase 3: Move Features (Bulk Work)

**For each feature** (auth, messages, connections, matches, sobriety, profile, onboarding, check-ins):

1. Create `src/features/{feature}/` structure
2. Move components:
   - From: `src/components/{feature}/`
   - To: `src/features/{feature}/components/`
3. Move hooks:
   - From: `src/hooks/use{Feature}*.ts`
   - To: `src/features/{feature}/hooks/`
4. Move services:
   - From: `src/services/{feature}Service.ts`
   - To: `src/features/{feature}/services/`
5. Move store slices:
   - From: `src/store/{feature}/`
   - To: `src/features/{feature}/store/`
6. Co-locate unit tests with moved files
7. Create screen components in `screens/` folder
8. Create public API via root `index.ts`
9. Update imports

**Example for messages feature:**
```typescript
// src/features/messages/index.ts
export { MessagesScreen, MessageDetailScreen } from './screens';
export { useMessages, useMessageSubscription } from './hooks';
export type { Message, Conversation } from './types';
```

**Validation**: Run full test suite after each feature migration.

### Phase 4: Update App Router Screens (Final Integration)

**Tasks:**
1. Convert all `app/` screens to thin wrappers
2. Import screen components from features:
   ```typescript
   // app/(tabs)/messages.tsx
   import { MessagesScreen } from '@/features/messages';
   export default MessagesScreen;
   ```
3. Remove business logic from `app/` files
4. Update all remaining import paths
5. Verify all routes still work

**Validation**: Manual smoke test on iOS/Android/Web.

### Phase 5: Move Tests & Cleanup

**Tasks:**
1. Move E2E tests to `__tests__/e2e/`
2. Move integration tests to `__tests__/integration/`
3. Move test fixtures to `__tests__/fixtures/`
4. Move test helpers to `__tests__/helpers/`
5. Delete old empty directories:
   - `src/components/auth/`
   - `src/components/messages/`
   - `src/components/connections/`
   - etc.
6. Update all documentation:
   - CLAUDE.md
   - README.md
   - Contributing guidelines

**Validation**: Verify no old directories remain.

## Import Path Strategy

### TypeScript Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/core/*": ["src/core/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

### Usage Examples

```typescript
// Feature imports
import { MessagesScreen } from '@/features/messages';
import { useAuth } from '@/features/auth';

// Shared imports
import { AccessibleButton } from '@/shared/components';
import { useDebounce } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';

// Core imports
import { useAppTheme } from '@/core/theme';
import { ENV } from '@/core/config';

// Lib imports
import { supabase } from '@/lib/supabase';
```

### Import Rules

1. **Features should NOT import from other features** - Use shared code instead
2. **Features CAN import from shared, core, and lib**
3. **Shared CAN import from core and lib**
4. **Core is self-contained** (no feature/shared imports)
5. **Lib is self-contained** (only external dependencies)

## Quality Gates

All must pass before merging migration:

- ✅ **TypeScript**: `pnpm typecheck` - Zero errors
- ✅ **Linting**: `pnpm lint` - Zero errors
- ✅ **Unit Tests**: `pnpm test` - All passing
- ✅ **E2E Tests**: `pnpm test:e2e` - All passing
- ✅ **Manual Testing**: Smoke test on iOS/Android/Web
- ✅ **Bundle Size**: No significant increase (within 5%)
- ✅ **Cleanup**: All old directories deleted
- ✅ **Documentation**: CLAUDE.md and README.md updated

## Benefits

### Developer Experience
- **Find related code faster** - Everything for a feature in one place
- **Easier onboarding** - Clear feature boundaries
- **Better IDE navigation** - Shorter file paths
- **Reduced cognitive load** - Feature scope is clear

### Maintainability
- **Isolated features** - Develop and test features independently
- **Clear ownership** - Easy to identify feature owners
- **Easier refactoring** - Changes contained to feature
- **Better code reuse** - Explicit shared/ vs feature/

### Scalability
- **Add new features easily** - Follow established pattern
- **Extract features to packages** - Clear boundaries enable extraction
- **Clear pattern** - All future development follows same structure
- **Reduced merge conflicts** - Features are isolated

### Testing
- **Easy to find tests** - Co-located with source
- **Clear test types** - Unit/Integration/E2E distinction
- **Test mirrors code** - Same organization pattern
- **Better discoverability** - Tests next to implementation

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Import path breakage** | High | Medium | Automated search/replace, TypeScript catches errors, thorough testing |
| **Merge conflicts** | Medium | Low | Work in dedicated branch, communicate freeze period |
| **Tests fail after move** | Medium | Medium | Move tests with code, run suite after each feature |
| **Bundle size increase** | Low | Low | Verify bundle size, optimize barrel exports |
| **Team confusion** | Medium | Low | Clear documentation, provide examples, gradual onboarding |
| **Incomplete migration** | High | Low | Use detailed checklist, verify old directories deleted |

## Success Criteria

Migration is successful when:

1. ✅ All files moved to new structure
2. ✅ Zero TypeScript errors (`pnpm typecheck`)
3. ✅ All tests passing (unit + integration + E2E)
4. ✅ All old directories deleted
5. ✅ Documentation updated (CLAUDE.md, README.md)
6. ✅ All imports use new path aliases
7. ✅ Bundle size within 5% of pre-migration
8. ✅ Manual testing passes on all platforms (iOS/Android/Web)
9. ✅ No performance regressions
10. ✅ Team understands new structure

## Timeline Estimate

- **Phase 1 (Preparation)**: 2-3 hours
- **Phase 2 (Shared Code)**: 3-4 hours
- **Phase 3 (Features)**: 8-12 hours (1-2 hours per feature)
- **Phase 4 (App Screens)**: 2-3 hours
- **Phase 5 (Tests & Cleanup)**: 2-3 hours

**Total**: 17-25 hours of focused work

## Post-Migration

### Maintenance
- Update CLAUDE.md with new structure patterns
- Add examples of creating new features
- Document barrel export patterns
- Create feature template for new features

### Future Enhancements
- Consider extracting features to workspace packages
- Implement feature flags per feature
- Add feature-level documentation
- Create automated scaffolding for new features

## References

- [React Native Project Structure Best Practices](https://reactnative.dev/docs/next/project-structure)
- [Expo Router File-based Routing](https://docs.expo.dev/router/introduction/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- Current CLAUDE.md documentation
