# Volvox.Sober Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-04

## Active Technologies
- TypeScript 5.x (React Native), PostgreSQL 15+ (Supabase) (001-volvox-sober-recovery)

## Project Structure
```
volvox-sober/
├── mobile/              # React Native app (TO BE CREATED)
│   ├── src/
│   │   ├── screens/     # Route screens
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API clients, business logic
│   │   ├── types/       # TypeScript definitions
│   │   └── hooks/       # Custom React hooks
│   └── tests/           # Jest & Playwright tests
│
├── supabase/            # Backend infrastructure
│   ├── migrations/      # Database schema migrations
│   │   └── 007_create_messaging_checkins.sql (✅ WP07 T034)
│   └── functions/       # Edge Functions (Deno)
│
└── kitty-specs/         # Feature specifications & planning
    └── 001-volvox-sober-recovery/
        ├── spec.md      # Feature specification
        ├── plan.md      # Implementation plan
        ├── data-model.md # Database design
        └── tasks/       # Work package prompts
            ├── planned/
            ├── done/    # WP05 completed
            └── WP07_progress.md
```

## Commands
```bash
# Testing (when mobile app created)
npm test
npm run test:coverage

# Code Quality
npm run lint
npm run typecheck

# Supabase (when configured)
npx supabase migration new <name>
npx supabase db reset
npx supabase functions serve
```

## Code Style
- **TypeScript**: Strict mode enabled, explicit types preferred
- **React Native**: Functional components with hooks
- **Database**: PostgreSQL with RLS policies for security
- **Naming**: PascalCase for components, camelCase for functions/services

## Current Status

### ✅ Completed Work Packages
- **WP05**: Sobriety Tracking (moved to done/)

### 🚧 In Progress
- **WP07**: Messaging & Check-Ins (Phase 2 - Core Features)
  - ✅ T034: Database schema (messages, check_ins, check_in_responses)
  - 🔜 T035: Messaging UI with conversation threads
  - 🔜 T036: Supabase Realtime subscription
  - 🔜 T037: Check-in scheduling screen
  - 🔜 T038: Check-in response UI
  - 🔜 T039: Check-in completion tracking

### 📋 Planned Work Packages
- WP01: Project Setup
- WP02: Auth & Profiles
- WP03: Matching Algorithm
- WP04: Connection Requests
- WP06: Step Worksheets
- WP08: Theme & Polish

## Recent Changes
- 2025-11-04: WP07 T034 completed - Database schema for messaging and check-ins
- 2025-11-04: WP05 marked complete and moved to done/
- 2025-11-03: Initial project setup with feature specifications

## Database Schema (Current)

### WP07 Tables (Messaging & Check-Ins)
- `messages`: In-app messaging with read receipts
- `check_ins`: Scheduled check-ins with timezone awareness
- `check_in_responses`: Response tracking (completed/missed)

### Triggers & Functions
- `update_connection_message_stats()`: Auto-update connection stats
- `mark_message_read(message_id)`: Helper for read receipts
- `get_unread_message_count()`: Helper for badge counts

### Security (RLS Policies)
- Messages: Users can only view/send in their connections
- Check-ins: Sponsors manage, sponsees view
- Responses: Sponsees create, both parties view

## Next Steps
1. Begin T035: Build messaging UI with FlatList virtualization
2. Parallel development: T036 (Realtime) + T037 (Check-in scheduling)
3. Implement T039 (Edge Functions for check-in notifications)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->