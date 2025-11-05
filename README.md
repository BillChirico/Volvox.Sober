# Volvox.Sober

> A cross-platform mobile application for sobriety support and recovery through authentic peer accountability

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73+-61DAFB.svg)](https://reactnative.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

Volvox.Sober is a sobriety companion app that connects individuals in recovery with experienced mentors through intelligent sponsor/sponsee matching. The platform combines structured 12-step AA worksheets, real-time messaging, and mutual sobriety tracking to foster authentic accountability and support.

### Core Features

- **🤝 Intelligent Matching**: SQL-based algorithm connecting sponsors with compatible sponsees
- **📝 12-Step Worksheets**: Structured step work with sponsor editing capabilities
- **💬 Real-time Messaging**: Supabase Realtime subscriptions for instant communication
- **📊 Sobriety Tracking**: Full mutual visibility between sponsors and sponsees
- **🔔 Smart Notifications**: Edge Functions with pg_cron scheduling
- **🔒 Privacy First**: Row Level Security (RLS) for data protection

## Tech Stack

### Frontend
- **React Native 0.73+** - Cross-platform iOS/Android
- **TypeScript 5.x** - Type-safe development
- **Zustand + React Query** - State management
- **React Navigation** - Stack + bottom tabs navigation
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL 15+** - Database with RLS
- **Supabase Auth** - Authentication (GoTrue)
- **Edge Functions** - Serverless functions (Deno runtime)
- **Realtime** - WebSocket subscriptions

### Testing
- **Jest** - Unit and integration tests
- **React Native Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **80%+ coverage target** - Business logic

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- iOS: Xcode 14+ (macOS only)
- Android: Android Studio + SDK 33+

### Installation

```bash
# Clone the repository
git clone https://github.com/BillChirico/Volvox.Sober.git
cd Volvox.Sober

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# iOS setup (macOS only)
cd mobile/ios && pod install && cd ../..
```

### Development

```bash
# Start Metro bundler
pnpm mobile

# Run on iOS (separate terminal)
pnpm ios

# Run on Android (separate terminal)
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

## Project Structure

```
volvox-sober/
├── apps/
│   └── mobile/          # React Native application
├── packages/
│   └── shared/          # Shared types and utilities
├── supabase/            # Backend (migrations, functions, seeds)
├── kitty-specs/         # Feature specifications & planning
├── scripts/             # Build and utility scripts
│   └── mobile/          # Mobile-specific scripts
├── docs/                # Project documentation
└── [config files]       # Root configuration files
```

## Development Workflow

1. Create feature branch from `main`
2. Follow TDD approach (write tests first)
3. Implement feature with TypeScript strict mode
4. Run quality checks: `pnpm test && pnpm typecheck && pnpm lint`
5. Commit with conventional commits (feat:, fix:, docs:, etc.)
6. Create pull request for review

## Documentation

- **CLAUDE.md** - Development guidelines and coding standards
- **kitty-specs/** - Feature specifications and implementation plans
- **docs/** - Additional technical documentation

## Current Status

**Phase 0 - Setup & Infrastructure**

Active development branch: `001-volvox-sober-recovery`

## Contributing

This is currently a private project. Contribution guidelines will be published when the project becomes open-source.

## License

[MIT License](LICENSE)

## Contact

Project maintained by [Bill Chirico](https://github.com/BillChirico)

---

**Note**: This project is under active development. Features and documentation are subject to change.
