---
work_package_id: "WP01"
subtasks:
  - "T001"
  - "T002"
  - "T003"
  - "T004"
  - "T005"
title: "Project Setup & Infrastructure"
phase: "Phase 0 - Setup & Infrastructure"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
history:
  - timestamp: "2025-11-03"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP01 – Project Setup & Infrastructure

## Objectives & Success Criteria

**Goal**: Establish React Native + Supabase development environment with CI/CD pipeline

**Success Criteria**:
- `pnpm install && pnpm test` passes with 100% pass rate
- `pnpm ios` and `pnpm android` launch successfully
- Supabase local instance starts with `supabase start`
- CI pipeline runs on every commit
- Theme provider supports light/dark mode with system preference

## Context & Constraints

**Prerequisite Work**: None (foundational work package)

**Supporting Documentation**:
- [plan.md](../../plan.md) - Technical stack decisions
- [quickstart.md](../../quickstart.md) - Development environment setup guide
- [constitution.md](../../../../../.kittify/memory/constitution.md) - Code quality standards

**Key Architectural Decisions**:
- React Native 0.73+ with TypeScript 5.x
- Supabase for backend (PostgreSQL 15+, Auth, Realtime, Edge Functions)
- ESLint + Prettier + Jest per constitution
- TDD workflow mandatory (Red-Green-Refactor)
- 80% test coverage requirement

**Constraints**:
- Must support both iOS and Android platforms
- Docker required for Supabase local development
- React Native environment varies by platform (Xcode for iOS, Android Studio for Android)

## Subtasks & Detailed Guidance

### Subtask T001 – Initialize React Native project with TypeScript

**Purpose**: Create base React Native application structure with TypeScript configuration

**Steps**:
1. Run `npx react-native@latest init VolvoxSober --template react-native-template-typescript`
2. Move project contents to `/mobile` directory
3. Create folder structure:
   ```
   mobile/
   ├── src/
   │   ├── screens/
   │   ├── components/
   │   ├── services/
   │   ├── types/
   │   ├── hooks/
   │   └── utils/
   ├── tests/
   └── __tests__/
   ```
4. Configure `tsconfig.json` with strict mode:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
5. Install base dependencies:
   ```bash
   pnpm add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   pnpm add react-native-screens react-native-safe-area-context
   pnpm add @supabase/supabase-js
   pnpm add zustand react-query
   pnpm add react-hook-form zod @hookform/resolvers
   ```

**Files**:
- Create `/mobile/package.json`
- Create `/mobile/tsconfig.json`
- Create `/mobile/src/App.tsx`
- Create `/mobile/src/types/index.ts`

**Parallel**: Can run independently (first task)

**Test Strategy**:
- Write test: `mobile/__tests__/App.test.tsx` that renders App component without crashing
- Red: Test fails (App not created yet)
- Green: Create minimal App.tsx to pass test
- Refactor: Add proper TypeScript types

### Subtask T002 – Configure Supabase local development

**Purpose**: Set up Supabase CLI and create initial database schema migration

**Steps**:
1. Install Supabase CLI: `pnpm add -g supabase`
2. Initialize Supabase in project root:
   ```bash
   supabase init
   ```
3. Create initial migration:
   ```bash
   supabase migration new initial_schema
   ```
4. Start local Supabase services:
   ```bash
   supabase start
   ```
5. Copy output keys (anon key, service_role key) to `.env` file
6. Create `.env.example` template for team
7. Configure Supabase client in mobile app:
   ```typescript
   // mobile/src/services/supabase/supabaseClient.ts
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.SUPABASE_URL!
   const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

**Files**:
- Create `/supabase/config.toml`
- Create `/supabase/migrations/001_initial_schema.sql` (placeholder)
- Create `/supabase/seed.sql` (placeholder)
- Create `.env` and `.env.example`
- Create `/mobile/src/services/supabase/supabaseClient.ts`

**Parallel**: Can run parallel to T003 (linting config)

**Notes**: Requires Docker Desktop running. See [quickstart.md](../../quickstart.md) for troubleshooting.

**Test Strategy**:
- Write test: Verify Supabase client initializes without errors
- Test connection to local Supabase instance
- Verify anon key authentication works

### Subtask T003 – Set up ESLint, Prettier, Jest configuration

**Purpose**: Enforce code quality standards per constitution

**Steps**:
1. Install ESLint and Prettier:
   ```bash
   pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
   pnpm add -D jest @testing-library/react-native @testing-library/jest-native
   ```
2. Create `.eslintrc.js`:
   ```javascript
   module.exports = {
     parser: '@typescript-eslint/parser',
     extends: [
       'eslint:recommended',
       'plugin:@typescript-eslint/recommended',
       'plugin:react/recommended',
       'prettier'
     ],
     rules: {
       '@typescript-eslint/explicit-function-return-type': 'warn',
       '@typescript-eslint/no-unused-vars': 'error',
       'react/prop-types': 'off'
     }
   }
   ```
3. Create `.prettierrc`:
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 100,
     "tabWidth": 2
   }
   ```
4. Configure Jest in `package.json`:
   ```json
   {
     "jest": {
       "preset": "react-native",
       "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
       "collectCoverageFrom": [
         "src/**/*.{ts,tsx}",
         "!src/**/*.test.{ts,tsx}"
       ],
       "coverageThreshold": {
         "global": {
           "branches": 80,
           "functions": 80,
           "lines": 80,
           "statements": 80
         }
       }
     }
   }
   ```
5. Add npm scripts:
   ```json
   {
     "scripts": {
       "lint": "eslint . --ext .ts,.tsx",
       "lint:fix": "eslint . --ext .ts,.tsx --fix",
       "format": "prettier --write \"src/**/*.{ts,tsx}\"",
       "test": "jest",
       "test:coverage": "jest --coverage",
       "test:watch": "jest --watch"
     }
   }
   ```

**Files**:
- Create `/mobile/.eslintrc.js`
- Create `/mobile/.prettierrc`
- Update `/mobile/package.json` (jest config and scripts)

**Parallel**: Can run parallel to T002 (Supabase setup)

**Test Strategy**:
- Run `pnpm lint` and verify it executes without errors
- Run `pnpm test` and verify Jest runs (even with 0 tests)
- Intentionally create a linting error and verify it's caught

### Subtask T004 – Create design system foundation

**Purpose**: Establish theme tokens and base UI components for consistent design

**Steps**:
1. Create theme tokens:
   ```typescript
   // mobile/src/theme/tokens.ts
   export const colors = {
     light: {
       primary: '#4A90E2',
       background: '#FFFFFF',
       surface: '#F5F5F5',
       text: '#000000',
       textSecondary: '#666666',
       border: '#E0E0E0',
       error: '#E53935',
       success: '#43A047'
     },
     dark: {
       primary: '#64B5F6',
       background: '#121212',
       surface: '#1E1E1E',
       text: '#FFFFFF',
       textSecondary: '#B0B0B0',
       border: '#333333',
       error: '#EF5350',
       success: '#66BB6A'
     }
   }

   export const spacing = {
     xs: 4,
     sm: 8,
     md: 16,
     lg: 24,
     xl: 32
   }

   export const typography = {
     h1: { fontSize: 32, fontWeight: 'bold' },
     h2: { fontSize: 24, fontWeight: 'bold' },
     h3: { fontSize: 20, fontWeight: '600' },
     body: { fontSize: 16, fontWeight: 'normal' },
     caption: { fontSize: 14, fontWeight: 'normal' }
   }
   ```

2. Create ThemeProvider:
   ```typescript
   // mobile/src/theme/ThemeProvider.tsx
   import React, { createContext, useState, useEffect } from 'react'
   import { useColorScheme } from 'react-native'
   import { colors } from './tokens'

   type ThemeMode = 'light' | 'dark' | 'system'

   export const ThemeContext = createContext({
     theme: colors.light,
     mode: 'system' as ThemeMode,
     setMode: (mode: ThemeMode) => {}
   })

   export const ThemeProvider: React.FC = ({ children }) => {
     const systemTheme = useColorScheme()
     const [mode, setMode] = useState<ThemeMode>('system')

     const currentTheme = mode === 'system'
       ? colors[systemTheme || 'light']
       : colors[mode]

     return (
       <ThemeContext.Provider value={{ theme: currentTheme, mode, setMode }}>
         {children}
       </ThemeContext.Provider>
     )
   }
   ```

3. Create base components:
   - `Button.tsx` (primary, secondary, outline variants)
   - `Input.tsx` (text input with label and error state)
   - `Card.tsx` (container with elevation)

4. Write component tests for each base component

**Files**:
- Create `/mobile/src/theme/tokens.ts`
- Create `/mobile/src/theme/ThemeProvider.tsx`
- Create `/mobile/src/components/base/Button.tsx`
- Create `/mobile/src/components/base/Input.tsx`
- Create `/mobile/src/components/base/Card.tsx`
- Create `/mobile/src/components/base/__tests__/Button.test.tsx`
- Create `/mobile/src/components/base/__tests__/Input.test.tsx`
- Create `/mobile/src/components/base/__tests__/Card.test.tsx`

**Parallel**: Can start after T001 completes

**Test Strategy** (TDD for each component):
- Red: Write test for Button component that expects primary variant rendering
- Green: Implement minimal Button to pass test
- Refactor: Add TypeScript types, accessibility props, theme integration
- Repeat for Input and Card components

### Subtask T005 – Configure CI/CD pipeline

**Purpose**: Automate linting and testing on every commit via GitHub Actions

**Steps**:
1. Create GitHub Actions workflow:
   ```yaml
   # .github/workflows/ci.yml
   name: CI

   on:
     push:
       branches: [ main, 'feature/**' ]
     pull_request:
       branches: [ main ]

   jobs:
     test:
       runs-on: ubuntu-latest

       steps:
       - uses: actions/checkout@v3

       - name: Set up Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '18'
           cache: 'npm'
           cache-dependency-path: mobile/package-lock.json

       - name: Install dependencies
         working-directory: ./mobile
         run: npm ci

       - name: Run linter
         working-directory: ./mobile
         run: pnpm lint

       - name: Run tests
         working-directory: ./mobile
         run: pnpm run test:coverage

       - name: Upload coverage
         uses: codecov/codecov-action@v3
         with:
           files: ./mobile/coverage/lcov.info
           fail_ci_if_error: false
   ```

2. Add README badge:
   ```markdown
   ![CI Status](https://github.com/your-org/volvox-sober/actions/workflows/ci.yml/badge.svg)
   ```

3. Test workflow by creating a test commit

**Files**:
- Create `/.github/workflows/ci.yml`
- Update `/README.md` with CI badge

**Parallel**: Can run after T003 completes (needs linting/test scripts)

**Notes**: Requires GitHub repository to be initialized. If not yet on GitHub, create placeholder workflow file for future use.

**Test Strategy**:
- Create intentional linting error in a branch
- Push to GitHub and verify CI fails
- Fix error and verify CI passes

## Risks & Mitigations

**Risk 1: Supabase local development requires Docker troubleshooting**
- Mitigation: Include Docker installation guide in quickstart.md
- Mitigation: Document common Docker errors and solutions
- Fallback: Use Supabase cloud for development if Docker issues persist

**Risk 2: React Native environment setup varies by platform**
- Mitigation: Test on both macOS (for iOS) and Linux/Windows (for Android)
- Mitigation: Document platform-specific setup steps in quickstart.md
- Mitigation: Use React Native Doctor (`npx react-native doctor`) to diagnose issues

**Risk 3: CI/CD pipeline may fail due to GitHub Actions limits**
- Mitigation: Use matrix strategy for parallel jobs if needed
- Mitigation: Cache node_modules to speed up builds
- Fallback: Use alternative CI provider (CircleCI, Travis) if GitHub Actions insufficient

## Definition of Done Checklist

- [ ] React Native app runs on iOS simulator (`pnpm ios`)
- [ ] React Native app runs on Android emulator (`pnpm android`)
- [ ] Supabase local instance starts successfully (`supabase start`)
- [ ] All linting rules pass (`pnpm lint`)
- [ ] All tests pass with 80%+ coverage (`pnpm test:coverage`)
- [ ] CI/CD pipeline runs on GitHub Actions
- [ ] Theme provider supports light/dark/system modes
- [ ] Base components (Button, Input, Card) implemented with tests
- [ ] Documentation updated in quickstart.md
- [ ] `.env.example` file created for environment variables

## Review Guidance

**Key Acceptance Checkpoints**:
1. Verify project structure follows constitution guidelines
2. Confirm TypeScript strict mode enabled
3. Check ESLint/Prettier configuration matches team standards
4. Validate theme tokens support WCAG AA contrast ratios (4.5:1)
5. Review base component accessibility (labels, roles, keyboard navigation)
6. Test CI pipeline with intentional failure to confirm it catches errors

**Context for Reviewers**:
- This is the foundational work package - quality here impacts all future work
- Pay special attention to TypeScript configuration (strict mode)
- Verify theme tokens provide sufficient contrast for accessibility
- Confirm TDD workflow is demonstrated in base component tests

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks

---

**Next Command**: `/spec-kitty.implement WP01`