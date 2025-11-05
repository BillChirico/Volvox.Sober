# Volvox.Sober Development Guidelines

Last updated: 2025-11-04

## Project Overview

Volvox.Sober is a cross-platform mobile application for sobriety support and recovery, enabling authentic peer accountability through curated sponsor/sponsee matching.

## Technology Stack

### Frontend (Mobile App)
- **Framework**: React Native 0.73+
- **Language**: TypeScript 5.x (strict mode)
- **Navigation**: React Navigation (stack + bottom tabs)
- **State Management**: Zustand + React Query
- **Form Handling**: React Hook Form + Zod validation
- **UI**: Custom design system with dark/light mode theming
- **Testing**: Jest + React Native Testing Library + Playwright

### Backend (Supabase)
- **Database**: PostgreSQL 15+
- **Authentication**: Supabase Auth (GoTrue)
- **Real-time**: Supabase Realtime subscriptions
- **Functions**: Supabase Edge Functions (Node.js 18+ / Deno runtime)
- **Storage**: Row Level Security (RLS)

### Package Manager
- **pnpm**: 10.20.0 (monorepo workspace structure)

## Project Structure

```
volvox-sober/
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # Route screens
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API clients, business logic
│   │   ├── types/       # TypeScript definitions
│   │   ├── hooks/       # Custom React hooks
│   │   ├── theme/       # Theme tokens and provider
│   │   └── utils/       # Utility functions
│   ├── tests/           # Test files
│   ├── ios/             # Native iOS code
│   └── android/         # Native Android code
│
├── supabase/            # Backend
│   ├── migrations/      # Database schema migrations
│   ├── functions/       # Edge Functions
│   └── seed.sql         # Test data seeding
│
├── kitty-specs/         # Feature specifications & planning
│   └── 001-volvox-sober-recovery/
│       ├── spec.md      # Feature specification
│       ├── plan.md      # Implementation plan
│       ├── research.md  # Technical decisions
│       ├── data-model.md # Database design
│       └── tasks/       # Work package prompts
│
├── shared/              # Shared code (types, utilities)
└── scripts/             # Build and utility scripts
```

## Commands

### Development
```bash
# Start Metro bundler
pnpm mobile

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

### Quality Checks
```bash
# Run all tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Code formatting
pnpm format
```

## Code Style

### TypeScript
- **Strict mode enabled**: No implicit any, strict null checks
- **Interfaces over types**: Prefer interface for object shapes
- **Explicit return types**: For all exported functions
- **No `any`**: Use `unknown` or proper types

### React Native
- **Functional components**: Use hooks, no class components
- **Named exports**: Prefer named exports over default
- **Component structure**: Props interface → Component → Styles
- **Hooks order**: useState → useEffect → custom hooks → handlers

### File Naming
- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase (`authService.ts`, `messageService.ts`)
- **Types**: PascalCase (`User.ts`, `Message.ts`)
- **Tests**: Mirror source with `.test.tsx` suffix

### Testing
- **Unit tests**: Jest + React Native Testing Library
- **E2E tests**: Playwright
- **Coverage target**: 80% minimum for business logic
- **Test location**: Co-located `__tests__` directories

## Development Workflow

1. **Branch from main**: Create feature branch from `main`
2. **Follow TDD**: Write tests first for new features
3. **Type safety**: Ensure TypeScript strict mode compliance
4. **Run checks**: Test + lint + typecheck before committing
5. **Commit messages**: Conventional commits (feat:, fix:, docs:, etc.)

## Environment Setup

1. **Node.js**: 18.0.0 or higher
2. **pnpm**: 8.0.0 or higher
3. **React Native CLI**: Follow React Native environment setup
4. **iOS**: Xcode 14+ (macOS only)
5. **Android**: Android Studio + SDK 33+

Copy `.env.example` to `.env` and configure environment variables.

## Key Memories

Project has documented memories for:
- `project_overview`: Core features and technical stack
- `codebase_structure`: Directory layout and patterns
- `tdd_workflow`: Test-driven development approach
- `code_style_conventions`: Coding standards
- `task_completion_checklist`: Pre-commit checklist

## Current Status

- **Phase**: Phase 0 - Setup & Infrastructure
- **Active Branch**: `001-volvox-sober-recovery`
- **Next Steps**: Mobile app setup and project infrastructure

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
