# Feature-Based Architecture Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Volvox.Sober from layer-based architecture to feature-based architecture with co-located tests and clear boundaries between features, shared code, core infrastructure, and external integrations.

**Architecture:** Feature modules are self-contained with components, hooks, services, store, types, and screens. Shared code split into shared/ (reusable), core/ (infrastructure), and lib/ (external integrations). Unit tests co-located, integration/E2E centralized.

**Tech Stack:** TypeScript 5.x, React Native 0.81+, Expo Router 4.x, Redux Toolkit, React Native Paper, Supabase

---

## Phase 1: Preparation (Setup Foundation)

### Task 1: Create Directory Structure

**Files:**

- Create: `src/features/` (empty directory)
- Create: `src/shared/` (empty directory)
- Create: `src/core/` (empty directory)
- Create: `src/lib/` (empty directory)
- Create: `__tests__/integration/` (empty directory)
- Create: `__tests__/e2e/` (empty directory)
- Create: `__tests__/fixtures/` (empty directory)
- Create: `__tests__/helpers/` (empty directory)

**Step 1: Create all new directories**

```bash
mkdir -p src/features
mkdir -p src/shared/{components,hooks,utils,types}
mkdir -p src/core/{theme,config,navigation,store}
mkdir -p src/lib/supabase
mkdir -p __tests__/{integration,e2e,fixtures,helpers}
```

**Step 2: Verify directory structure**

```bash
ls -la src/ | grep -E "(features|shared|core|lib)"
ls -la __tests__/ | grep -E "(integration|e2e|fixtures|helpers)"
```

Expected: All directories exist

**Step 3: Commit structure**

```bash
git add src/ __tests__/
git commit -m "chore: create feature-based directory structure"
```

---

### Task 2: Configure TypeScript Path Aliases

**Files:**

- Modify: `tsconfig.json` (add paths configuration)

**Step 1: Update tsconfig.json with path aliases**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/core/*": ["src/core/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

**Step 2: Verify TypeScript resolves new paths**

```bash
pnpm typecheck
```

Expected: No new errors (existing errors OK per CLAUDE.md)

**Step 3: Commit configuration**

```bash
git add tsconfig.json
git commit -m "chore: add TypeScript path aliases for new structure"
```

---

### Task 3: Update Jest Configuration

**Files:**

- Modify: `jest.config.js` (add moduleNameMapper for new paths)

**Step 1: Add path mappings to Jest config**

```javascript
module.exports = {
  // ... existing config
  moduleNameMapper: {
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    // ... existing mappings
  },
};
```

**Step 2: Verify Jest resolves paths**

```bash
pnpm test -- --listTests | head -10
```

Expected: No errors loading configuration

**Step 3: Commit configuration**

```bash
git add jest.config.js
git commit -m "chore: add Jest module mappings for new structure"
```

---

## Phase 2: Move Shared Code (Foundation)

### Task 4: Move Core Theme

**Files:**

- Move: `src/theme/` → `src/core/theme/`
- Modify: All imports of `@/theme` → `@/core/theme`

**Step 1: Move theme directory**

```bash
mv src/theme src/core/theme
```

**Step 2: Update imports using find/replace**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/theme|from "@/core/theme|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/theme|from '@/core/theme|g" {} +
```

**Step 3: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 4: Run tests**

```bash
pnpm test
```

Expected: Same baseline (256 passing, 27 failing)

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(core): move theme to core/theme"
```

---

### Task 5: Move Core Constants to Config

**Files:**

- Move: `src/constants/` → `src/core/config/`
- Modify: All imports of `@/constants` → `@/core/config`

**Step 1: Move constants directory**

```bash
mv src/constants src/core/config
```

**Step 2: Update imports**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/constants|from "@/core/config|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/constants|from '@/core/config|g" {} +
```

**Step 3: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 4: Run tests**

```bash
pnpm test
```

Expected: Same baseline

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(core): move constants to core/config"
```

---

### Task 6: Create Supabase Library Wrapper

**Files:**

- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/auth.ts`
- Create: `src/lib/supabase/index.ts`
- Modify: `src/services/supabase.ts` (use new wrapper)

**Step 1: Create client wrapper**

Create `src/lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
```

**Step 2: Create auth helpers**

Create `src/lib/supabase/auth.ts`:

```typescript
import { supabase } from './client';

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}
```

**Step 3: Create barrel export**

Create `src/lib/supabase/index.ts`:

```typescript
export { supabase } from './client';
export * from './auth';
```

**Step 4: Update service to use wrapper**

Modify `src/services/supabase.ts`:

```typescript
export { supabase } from '@/lib/supabase';
```

**Step 5: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 6: Commit**

```bash
git add src/lib/supabase/
git add src/services/supabase.ts
git commit -m "feat(lib): create Supabase library wrapper"
```

---

### Task 7: Move Shared Utils

**Files:**

- Move: `src/utils/` → `src/shared/utils/`
- Modify: All imports of `@/utils` → `@/shared/utils`

**Step 1: Move utils directory**

```bash
mv src/utils src/shared/utils
```

**Step 2: Update imports**

```bash
find src app __tests__ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/utils|from "@/shared/utils|g' {} +
find src app __tests__ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/utils|from '@/shared/utils|g" {} +
```

**Step 3: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 4: Run tests**

```bash
pnpm test
```

Expected: Same baseline

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(shared): move utils to shared/utils"
```

---

### Task 8: Move Shared Types

**Files:**

- Move: `src/types/` → Split between `src/shared/types/` and prepare for feature-specific
- Create: `src/shared/types/index.ts` (common types)

**Step 1: Create shared types directory and move common types**

```bash
mkdir -p src/shared/types
cp src/types/database.types.ts src/shared/types/
cp src/types/navigation.ts src/shared/types/
```

**Step 2: Create shared types index**

Create `src/shared/types/index.ts`:

```typescript
export * from './database.types';
export * from './navigation';
```

**Step 3: Update imports for shared types**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/types/database.types"|from "@/shared/types"|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/types/navigation"|from "@/shared/types"|g' {} +
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add src/shared/types/
git commit -m "refactor(shared): create shared types structure"
```

---

## Phase 3: Move Features (Messages Feature Example)

### Task 9: Create Messages Feature Structure

**Files:**

- Create: `src/features/messages/components/`
- Create: `src/features/messages/hooks/`
- Create: `src/features/messages/services/`
- Create: `src/features/messages/store/`
- Create: `src/features/messages/types/`
- Create: `src/features/messages/screens/`
- Create: `src/features/messages/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/features/messages/{components,hooks,services,store,types,screens}
touch src/features/messages/index.ts
```

**Step 2: Verify structure**

```bash
ls -la src/features/messages/
```

Expected: All subdirectories exist

**Step 3: Commit structure**

```bash
git add src/features/messages/
git commit -m "feat(messages): create feature structure"
```

---

### Task 10: Move Messages Components

**Files:**

- Move: `src/components/messages/MessageBubble.tsx` → `src/features/messages/components/`
- Move: `src/components/messages/MessageInput.tsx` → `src/features/messages/components/`
- Move: `src/components/messages/MessageThread.tsx` → `src/features/messages/components/`
- Move: `src/components/MessageBubble.tsx` → `src/features/messages/components/` (duplicate)
- Move: `src/components/MessageInput.tsx` → `src/features/messages/components/` (duplicate)

**Step 1: Move messages components**

```bash
mv src/components/messages/*.tsx src/features/messages/components/
# Handle duplicates at root level
mv src/components/MessageBubble.tsx src/features/messages/components/ 2>/dev/null || true
mv src/components/MessageInput.tsx src/features/messages/components/ 2>/dev/null || true
```

**Step 2: Create component index**

Create `src/features/messages/components/index.ts`:

```typescript
export { MessageBubble } from './MessageBubble';
export { MessageInput } from './MessageInput';
export { MessageThread } from './MessageThread';
```

**Step 3: Update imports**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/components/messages|from "@/features/messages/components|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/components/MessageBubble"|from "@/features/messages/components"|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/components/MessageInput"|from "@/features/messages/components"|g' {} +
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Run tests**

```bash
pnpm test
```

Expected: Same baseline

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor(messages): move components to feature"
```

---

### Task 11: Move Messages Hooks

**Files:**

- Move: `src/hooks/useMessages.ts` → `src/features/messages/hooks/`

**Step 1: Move hook file**

```bash
mv src/hooks/useMessages.ts src/features/messages/hooks/
```

**Step 2: Create hooks index**

Create `src/features/messages/hooks/index.ts`:

```typescript
export { useMessages } from './useMessages';
```

**Step 3: Update imports**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/hooks/useMessages"|from "@/features/messages/hooks"|g' {} +
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(messages): move hooks to feature"
```

---

### Task 12: Move Messages Services

**Files:**

- Move: `src/services/messageService.ts` → `src/features/messages/services/`
- Move: `src/services/messageServiceV2.ts` → `src/features/messages/services/`
- Move: `src/services/messagesApi.ts` → `src/features/messages/services/`
- Move: `src/services/offlineMessageQueue.ts` → `src/features/messages/services/`

**Step 1: Move service files**

```bash
mv src/services/messageService.ts src/features/messages/services/
mv src/services/messageServiceV2.ts src/features/messages/services/
mv src/services/messagesApi.ts src/features/messages/services/
mv src/services/offlineMessageQueue.ts src/features/messages/services/
```

**Step 2: Create services index**

Create `src/features/messages/services/index.ts`:

```typescript
export * from './messageService';
export * from './messageServiceV2';
export * from './messagesApi';
export * from './offlineMessageQueue';
```

**Step 3: Update imports**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/services/messageService"|from "@/features/messages/services"|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/services/messageServiceV2"|from "@/features/messages/services"|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/services/messagesApi"|from "@/features/messages/services"|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/services/offlineMessageQueue"|from "@/features/messages/services"|g' {} +
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(messages): move services to feature"
```

---

### Task 13: Move Messages Store

**Files:**

- Move: `src/store/messages/` → `src/features/messages/store/`

**Step 1: Move store directory**

```bash
mv src/store/messages src/features/messages/store
```

**Step 2: Update imports**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/store/messages|from "@/features/messages/store|g' {} +
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/store/messages|from '@/features/messages/store|g" {} +
```

**Step 3: Update root reducer**

Modify `src/core/store/rootReducer.ts`:

```typescript
import { messagesReducer } from '@/features/messages/store';
// ... keep existing imports
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(messages): move store to feature"
```

---

### Task 14: Move Messages Types

**Files:**

- Move: `src/types/message.ts` → `src/features/messages/types/`

**Step 1: Move types file**

```bash
mv src/types/message.ts src/features/messages/types/
```

**Step 2: Create types index**

Create `src/features/messages/types/index.ts`:

```typescript
export * from './message';
```

**Step 3: Update imports**

```bash
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|from "@/types/message"|from "@/features/messages/types"|g' {} +
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(messages): move types to feature"
```

---

### Task 15: Create Messages Screens

**Files:**

- Create: `src/features/messages/screens/MessagesScreen.tsx`
- Create: `src/features/messages/screens/MessageDetailScreen.tsx`
- Create: `src/features/messages/screens/index.ts`

**Step 1: Extract MessagesScreen from app**

Create `src/features/messages/screens/MessagesScreen.tsx` by extracting logic from `app/(tabs)/messages.tsx`:

```typescript
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useMessages } from '../hooks';
import { MessageBubble, MessageInput } from '../components';
import { useAppTheme } from '@/core/theme/ThemeContext';

export function MessagesScreen() {
  const { theme } = useAppTheme();
  const { messages, sendMessage, loading } = useMessages();

  // ... Extract existing logic from app/(tabs)/messages.tsx

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ... existing JSX */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Step 2: Extract MessageDetailScreen**

Create `src/features/messages/screens/MessageDetailScreen.tsx` by extracting logic from `app/(tabs)/messages/[id].tsx`:

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MessageThread, MessageInput } from '../components';
import { useMessages } from '../hooks';
import { useAppTheme } from '@/core/theme/ThemeContext';

export function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const { messages, sendMessage } = useMessages();

  // ... Extract existing logic

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ... existing JSX */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Step 3: Create screens index**

Create `src/features/messages/screens/index.ts`:

```typescript
export { MessagesScreen } from './MessagesScreen';
export { MessageDetailScreen } from './MessageDetailScreen';
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add src/features/messages/screens/
git commit -m "feat(messages): create screen components"
```

---

### Task 16: Create Messages Public API

**Files:**

- Create: `src/features/messages/index.ts` (public API)

**Step 1: Create public API**

Update `src/features/messages/index.ts`:

```typescript
// Public API for messages feature
export { MessagesScreen, MessageDetailScreen } from './screens';
export { useMessages } from './hooks';
export type { Message, Conversation, MessageStatus } from './types';
```

**Step 2: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 3: Commit**

```bash
git add src/features/messages/index.ts
git commit -m "feat(messages): create public API"
```

---

### Task 17-24: Repeat for Remaining Features

**NOTE:** Repeat Tasks 9-16 pattern for each remaining feature:

- Task 17-18: Auth feature (components, hooks, services, store, types, screens)
- Task 19-20: Connections feature
- Task 21-22: Matches feature
- Task 23-24: Sobriety feature
- Task 25-26: Profile feature
- Task 27-28: Onboarding feature
- Task 29-30: Check-ins feature

Each feature follows the same pattern:

1. Create structure
2. Move components (with tests)
3. Move hooks
4. Move services
5. Move store slices
6. Move types
7. Create screens
8. Create public API

---

## Phase 4: Update App Router Screens

### Task 31: Convert Messages Screens to Thin Wrappers

**Files:**

- Modify: `app/(tabs)/messages.tsx`
- Modify: `app/(tabs)/messages/[id].tsx`

**Step 1: Update messages index screen**

Replace `app/(tabs)/messages.tsx`:

```typescript
import { MessagesScreen } from '@/features/messages';

export default MessagesScreen;
```

**Step 2: Update message detail screen**

Replace `app/(tabs)/messages/[id].tsx`:

```typescript
import { MessageDetailScreen } from '@/features/messages';

export default MessageDetailScreen;
```

**Step 3: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 4: Test navigation**

```bash
pnpm web
```

Navigate to messages screen manually

Expected: Screen renders correctly

**Step 5: Commit**

```bash
git add app/(tabs)/messages.tsx app/(tabs)/messages/[id].tsx
git commit -m "refactor(app): convert messages screens to thin wrappers"
```

---

### Task 32-38: Convert Remaining Screen Wrappers

**NOTE:** Repeat Task 31 pattern for:

- Task 32: Connections screens
- Task 33: Matches screen
- Task 34: Profile screens
- Task 35: Sobriety screens
- Task 36: Auth screens
- Task 37: Onboarding screens
- Task 38: Check-ins screens

---

## Phase 5: Move Tests & Cleanup

### Task 39: Move E2E Tests

**Files:**

- Move: All `__tests__/*.spec.ts` → `__tests__/e2e/`

**Step 1: Move E2E tests**

```bash
mv __tests__/*.spec.ts __tests__/e2e/
```

**Step 2: Update Playwright config**

Modify `playwright.config.ts` (if it references old paths):

```typescript
testDir: './__tests__/e2e',
```

**Step 3: Run E2E tests**

```bash
pnpm test:e2e
```

Expected: Same results as before

**Step 4: Commit**

```bash
git add __tests__/e2e/ playwright.config.ts
git commit -m "test: move E2E tests to centralized location"
```

---

### Task 40: Create Test Helpers

**Files:**

- Create: `__tests__/helpers/login.ts`
- Create: `__tests__/helpers/navigation.ts`
- Create: `__tests__/helpers/index.ts`

**Step 1: Extract login helper**

Create `__tests__/helpers/login.ts`:

```typescript
import { Page } from '@playwright/test';

export async function login(page: Page, email = 'test@example.com', password = 'password123') {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/');
}
```

**Step 2: Create navigation helper**

Create `__tests__/helpers/navigation.ts`:

```typescript
import { Page } from '@playwright/test';

export async function navigateToTab(page: Page, tab: string) {
  await page.click(`[data-testid="tab-${tab}"]`);
  await page.waitForURL(`/${tab}`);
}
```

**Step 3: Create helpers index**

Create `__tests__/helpers/index.ts`:

```typescript
export * from './login';
export * from './navigation';
```

**Step 4: Update E2E tests to use helpers**

Update imports in E2E tests:

```typescript
import { login, navigateToTab } from '../helpers';
```

**Step 5: Run E2E tests**

```bash
pnpm test:e2e
```

Expected: All tests pass

**Step 6: Commit**

```bash
git add __tests__/helpers/
git commit -m "test: create centralized test helpers"
```

---

### Task 41: Delete Old Directories

**Files:**

- Delete: `src/components/auth/`
- Delete: `src/components/messages/`
- Delete: `src/components/connections/`
- Delete: `src/components/matches/`
- Delete: `src/components/sobriety/`
- Delete: `src/components/profile/`
- Delete: `src/components/onboarding/`
- Delete: `src/hooks/` (if empty)
- Delete: `src/store/auth/`, `src/store/messages/`, etc.
- Delete: `src/types/` (if empty)

**Step 1: Remove old component directories**

```bash
rm -rf src/components/auth
rm -rf src/components/messages
rm -rf src/components/connections
rm -rf src/components/matches
rm -rf src/components/sobriety
rm -rf src/components/profile
rm -rf src/components/onboarding
```

**Step 2: Remove old store directories**

```bash
rm -rf src/store/auth
rm -rf src/store/messages
rm -rf src/store/connections
rm -rf src/store/matches
rm -rf src/store/sobriety
rm -rf src/store/profile
rm -rf src/store/onboarding
```

**Step 3: Clean up empty directories**

```bash
find src -type d -empty -delete
```

**Step 4: Verify TypeScript**

```bash
pnpm typecheck
```

Expected: No new errors

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old directory structure"
```

---

### Task 42: Update CLAUDE.md Documentation

**Files:**

- Modify: `CLAUDE.md` (update Project Structure section)

**Step 1: Update project structure section**

Replace the Project Structure section in CLAUDE.md with the new structure from the design document.

**Step 2: Add MCP usage note**

Add note about using Serena MCP for symbol operations instead of grep when working with new structure.

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new project structure"
```

---

### Task 43: Update README.md

**Files:**

- Modify: `README.md` (update structure documentation if present)

**Step 1: Update any structure references in README**

Update README.md to reflect new structure.

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with new project structure"
```

---

## Final Verification

### Task 44: Run All Quality Checks

**Files:**

- None (verification only)

**Step 1: Run TypeScript check**

```bash
pnpm typecheck
```

Expected: No new errors compared to baseline

**Step 2: Run linter**

```bash
pnpm lint
```

Expected: No new errors

**Step 3: Run unit tests**

```bash
pnpm test
```

Expected: Same baseline (256 passing, 27 failing)

**Step 4: Run E2E tests**

```bash
pnpm test:e2e
```

Expected: All E2E tests pass

**Step 5: Manual smoke test**

```bash
pnpm web
```

Test each major flow:

- Auth: Login/Signup
- Onboarding: Role selection, profile setup
- Messages: View conversations, send message
- Connections: View connections, send request
- Profile: View profile, edit profile

Expected: All flows work correctly

---

### Task 45: Create Completion Summary

**Files:**

- Create: `docs/migration-summary.md`

**Step 1: Create migration summary**

Document:

- Total files moved: X
- New directory structure established
- All tests passing (baseline maintained)
- Bundle size comparison
- Any issues encountered

**Step 2: Commit**

```bash
git add docs/migration-summary.md
git commit -m "docs: add migration completion summary"
```

---

## Success Criteria Checklist

Before marking migration complete, verify:

- [ ] All files moved to new structure
- [ ] Zero TypeScript errors (or same baseline as before)
- [ ] All tests passing (unit + integration + E2E, same baseline)
- [ ] All old directories deleted
- [ ] Documentation updated (CLAUDE.md, README.md)
- [ ] All imports use new path aliases
- [ ] Bundle size within 5% of pre-migration
- [ ] Manual testing passes on all platforms

---

## Notes

**Parallelization:** Tasks within a phase can be done in parallel if they're independent (e.g., moving different features in Phase 3).

**Rollback Strategy:** Each task is atomic with a commit. Can rollback to any previous commit if issues arise.

**Testing Strategy:** Maintain same test baseline throughout. Any new failures must be investigated immediately.

**Import Updates:** Use sed for bulk updates, but verify with TypeScript after each change.

**Feature Priority:** Start with Messages feature as the example, then parallelize remaining features.
