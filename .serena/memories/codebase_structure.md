# Codebase Structure

## Root Directory Layout
```
volvox-sober/
├── mobile/              # React Native app (TO BE CREATED)
│   ├── src/
│   │   ├── screens/     # Route screens
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API clients, business logic
│   │   ├── types/       # TypeScript definitions
│   │   ├── hooks/       # Custom React hooks
│   │   ├── theme/       # Theme tokens and provider
│   │   └── utils/       # Utility functions
│   ├── tests/           # Jest & Playwright tests
│   ├── __tests__/       # Test files
│   ├── ios/             # Native iOS code
│   └── android/         # Native Android code
│
├── supabase/            # Backend (TO BE CREATED)
│   ├── migrations/      # Database schema migrations
│   ├── functions/       # Edge Functions (Deno)
│   └── seed.sql         # Test data seeding
│
├── kitty-specs/         # Feature specifications & planning
│   └── 001-volvox-sober-recovery/
│       ├── spec.md      # Feature specification
│       ├── plan.md      # Implementation plan
│       ├── research.md  # Technical decisions & research
│       ├── data-model.md # Database design
│       ├── quickstart.md # Development setup guide
│       ├── tasks.md     # Work packages summary
│       └── tasks/       # Individual work package prompts
│           ├── planned/
│           ├── doing/
│           ├── done/
│           └── for_review/
│
├── .github/             # GitHub workflows (CI/CD)
├── .kittify/            # Project management artifacts
├── CLAUDE.md            # Auto-generated development guidelines
├── README.md            # Project overview
└── LICENSE              # MIT License
```

## Design Patterns
- **Component Organization**: Feature-based grouping within screens/components
- **Service Layer**: All API calls abstracted through services
- **Custom Hooks**: Reusable logic extracted to hooks directory
- **Theme System**: Centralized tokens with context provider
- **Testing**: Co-located test files with `__tests__` directories

## File Naming Conventions
- **React Components**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useMatching.ts`)
- **Services**: camelCase (e.g., `authService.ts`, `messageService.ts`)
- **Types**: PascalCase interfaces/types (e.g., `User.ts`, `Message.ts`)
- **Tests**: Mirror source structure with `.test.tsx` suffix

## Configuration Files
- `tsconfig.json`: TypeScript strict mode configuration
- `.eslintrc.js`: ESLint rules with TypeScript plugin
- `.prettierrc`: Code formatting rules
- `package.json`: Dependencies and npm scripts
- `.env`: Environment variables (not committed)
- `.env.example`: Environment variable template