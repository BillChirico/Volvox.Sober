# Volvox.Sober

**A Cross-Platform Mobile Recovery Support Application**

Volvox.Sober is a React Native application that connects individuals in recovery with experienced sponsors through intelligent matching, providing tools for authentic peer accountability and structured 12-step work.

---

## 🎯 Core Features

### ✅ Phase 2 - Core Features (In Progress)
- **Messaging & Check-Ins** (WP07 - In Progress)
  - ✅ Database schema for in-app messaging
  - ✅ Scheduled check-ins with timezone awareness
  - ✅ Response tracking (completed/missed)
  - 🔜 Real-time messaging UI
  - 🔜 Check-in scheduling and notifications

### 📋 Planned Features
- **Sponsor/Sponsee Matching** (WP03): SQL-based intelligent algorithm
- **12-Step AA Worksheets** (WP06): Structured step work with editing
- **Sobriety Tracking** (WP05): Mutual visibility with milestone celebrations
- **Connection Requests** (WP04): Curated sponsor/sponsee connections
- **Authentication & Profiles** (WP02): Supabase Auth integration
- **Theme & Polish** (WP08): Dark/light mode with custom design system

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React Native 0.73+
- **Language**: TypeScript 5.x (strict mode)
- **Navigation**: React Navigation (stack + bottom tabs)
- **State Management**: Zustand + React Query
- **UI**: Custom design system with theming

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL 15+
- **Real-time**: Supabase Realtime subscriptions
- **Functions**: Supabase Edge Functions (Deno)
- **Security**: Row Level Security (RLS) policies

### Testing
- **Unit/Integration**: Jest + React Native Testing Library
- **E2E**: Playwright
- **Coverage**: 80% minimum for business logic

---

## 📁 Project Structure

```
volvox-sober/
├── mobile/              # React Native app (TO BE CREATED)
│   ├── src/
│   │   ├── screens/     # Route screens
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API clients & business logic
│   │   ├── types/       # TypeScript definitions
│   │   └── hooks/       # Custom React hooks
│   └── tests/           # Jest & Playwright tests
│
├── supabase/            # Backend infrastructure
│   ├── migrations/      # Database schema migrations
│   │   └── 007_create_messaging_checkins.sql (✅)
│   └── functions/       # Edge Functions (Deno)
│
└── kitty-specs/         # Feature specifications & planning
    └── 001-volvox-sober-recovery/
        ├── spec.md      # Feature specification
        ├── plan.md      # Implementation plan
        ├── data-model.md # Database design
        └── tasks/       # Work package prompts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- React Native development environment
- Supabase CLI (for backend development)

### Installation (Coming Soon)
```bash
# Clone the repository
git clone https://github.com/yourusername/volvox-sober.git
cd volvox-sober

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run start
```

### Database Setup (Current)
```bash
# Create new migration
npx supabase migration new <name>

# Apply migrations
npx supabase db reset

# Run Edge Functions locally
npx supabase functions serve
```

---

## 📊 Development Status

### ✅ Completed
- **WP05**: Sobriety Tracking database schema
- **WP07 T034**: Messaging & Check-ins database schema

### 🚧 In Progress
- **WP07**: Messaging & Check-Ins (Phase 2)
  - ✅ T034: Database schema (messages, check_ins, check_in_responses)
  - 🔜 T035: Messaging UI with conversation threads
  - 🔜 T036: Supabase Realtime subscription
  - 🔜 T037: Check-in scheduling screen
  - 🔜 T038: Check-in response UI
  - 🔜 T039: Check-in completion tracking

### 📋 Roadmap
- Phase 0: Project Setup & Infrastructure (WP01)
- Phase 1: Authentication & Profiles (WP02)
- Phase 2: Core Features (WP03-WP07) - **Current Phase**
- Phase 3: Polish & Launch (WP08)

---

## 🗄️ Database Schema (Current)

### WP07 - Messaging & Check-Ins
```sql
-- Core Tables
messages                # In-app messaging with read receipts
check_ins              # Scheduled check-ins (daily/weekly/custom)
check_in_responses     # Response tracking (completed/missed)

-- Features
✅ Real-time messaging support
✅ Timezone-aware scheduling
✅ RLS policies for security
✅ Helper functions for common operations
✅ Optimized indexes for performance
```

---

## 🔒 Security

- **Row Level Security (RLS)**: All tables protected by PostgreSQL RLS policies
- **Authentication**: Supabase Auth with JWT tokens
- **Data Privacy**: Sponsors cannot see sponsee private notes
- **Connection-Based**: All interactions scoped to active connections

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer business logic
- Custom hooks
- Utility functions

### Integration Tests
- API client interactions
- Database operations
- Authentication flows

### E2E Tests
- Critical user journeys
- Cross-platform scenarios
- Real-time messaging flows

---

## 📝 Documentation

- **Feature Specs**: [`kitty-specs/001-volvox-sober-recovery/spec.md`](kitty-specs/001-volvox-sober-recovery/spec.md)
- **Implementation Plan**: [`kitty-specs/001-volvox-sober-recovery/plan.md`](kitty-specs/001-volvox-sober-recovery/plan.md)
- **Data Model**: [`kitty-specs/001-volvox-sober-recovery/data-model.md`](kitty-specs/001-volvox-sober-recovery/data-model.md)
- **Development Guide**: [`CLAUDE.md`](CLAUDE.md)

---

## 🤝 Contributing

This is currently a private development project. Contribution guidelines will be added when the project opens for collaboration.

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

---

## 📞 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Status**: 🚧 Active Development (Phase 2 - Core Features)
**Last Updated**: 2025-11-04
