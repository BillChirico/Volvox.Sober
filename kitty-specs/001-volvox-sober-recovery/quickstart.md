# Volvox.Sober Developer Quickstart

**Feature**: 001-volvox-sober-recovery
**Stack**: React Native (TypeScript) + Supabase (PostgreSQL + Realtime + Auth + Edge Functions)
**Target Platforms**: iOS 14.0+, Android 8.0+ (API 26+)

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn 1.22+)
- **React Native CLI**: `npm install -g react-native-cli`
- **Xcode**: 14+ (for iOS development on macOS)
- **Android Studio**: Latest stable (for Android development)
- **Supabase CLI**: `npm install -g supabase`
- **Git**: For version control

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         React Native Mobile App                  │
│  ┌────────────────────────────────────────────┐ │
│  │  UI Layer (Screens + Components)           │ │
│  ├────────────────────────────────────────────┤ │
│  │  State Management (Redux + RTK Query)      │ │
│  ├────────────────────────────────────────────┤ │
│  │  Services (Supabase, Notifications, Sync)  │ │
│  └────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS + WebSocket
                    ▼
┌─────────────────────────────────────────────────┐
│            Supabase Backend                     │
│  ┌────────────────────────────────────────────┐ │
│  │  PostgreSQL 15+ (Data Layer + RLS)         │ │
│  ├────────────────────────────────────────────┤ │
│  │  Realtime (WebSocket subscriptions)        │ │
│  ├────────────────────────────────────────────┤ │
│  │  Auth (JWT-based authentication)           │ │
│  ├────────────────────────────────────────────┤ │
│  │  Edge Functions (Deno - matching, cron)    │ │
│  ├────────────────────────────────────────────┤ │
│  │  Storage (Profile photos)                  │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│   Firebase Cloud Messaging (Push Notifications) │
└─────────────────────────────────────────────────┘
```

---

## Quick Setup (< 30 minutes)

### Current Implementation Status (WP01 + WP02 Completed)

✅ **WP01 - Project Setup & Expo Migration**:

- Root workspace with npm workspaces configured
- **Expo 54 mobile app** (migrated from React Native CLI for better DX)
- Supabase project initialized (Docker-based local development)
- ESLint configured with flat config system
- TypeScript strict mode enabled (all strict flags)
- Jest + React Native Testing Library configured and passing
- Shared types directory structure created
- React Native Paper theme configured (light/dark)
- Environment example files created (EXPO_PUBLIC_ prefix)

✅ **WP02 - Database Schema & Authentication Foundation**:

**Database Migrations (9 files)**:
- ✅ Users table with profiles, location (PostGIS), theme preferences
- ✅ Sponsor/sponsee profile tables with matching preferences
- ✅ Sobriety dates with milestone tracking + relapses table
- ✅ Connection requests, connections, and matches tables
- ✅ Steps (12 AA steps reference) + step_work tables
- ✅ Messages, check-ins, check-in responses tables
- ✅ Notifications table with action URLs
- ✅ Database triggers (updated_at, message notifications, capacity updates)
- ✅ 12 AA steps seed data with guided questions

**Row Level Security**:
- ✅ RLS enabled on all tables
- ✅ Users can only view/edit their own data
- ✅ Connected sponsors/sponsees have mutual visibility
- ✅ Sponsors cannot see sponsee private relapse notes
- ✅ Match suggestions only visible to sponsees

**Mobile Auth Integration**:
- ✅ Supabase client service with expo-secure-store
- ✅ Redux store with RTK Query and redux-persist
- ✅ Auth API slice (sign up, sign in, sign out, password reset)
- ✅ Auth screens (Login, Register, ForgotPassword)
- ✅ Secure token storage for iOS, Android, and web

**Tech Stack**:
- **Node Version**: 18 (via .nvmrc)
- **Expo SDK**: 54.0.x
- **React Native**: 0.81.5 (via Expo)
- **React**: 19.1.0
- **TypeScript**: 5.9.2
- **Supabase**: @supabase/supabase-js 2.78.0
- **Redux Toolkit**: 2.9.2
- **React Native Paper**: 5.14.5

**Expo Benefits**:
- ✅ Over-the-air updates (EAS Update)
- ✅ No Xcode/Android Studio needed for dev
- ✅ Built-in web support
- ✅ Professional CI/CD (EAS Build)
- ✅ Expo Go for instant device testing

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd volvox-sober

# Install root dependencies
npm install

# Install mobile app dependencies
cd mobile
npm install

# Install iOS pods (macOS only)
cd ios
pod install
cd ../..
```

### 2. Supabase Setup

```bash
# Login to Supabase (creates account if needed)
supabase login

# Link to existing project OR create new project
supabase link --project-ref <your-project-ref>
# OR
supabase init

# Start local Supabase instance (Docker required)
supabase start

# Note the API URL and anon key from output
# Example output:
#   API URL: http://localhost:54321
#   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Environment Configuration

Create `.env` file in `mobile/` directory:

```env
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<anon-key-from-supabase-start>

# Firebase Configuration (for push notifications)
FCM_SERVER_KEY=<your-fcm-server-key>
GOOGLE_APPLICATION_CREDENTIALS=<path-to-firebase-service-account.json>

# Environment
NODE_ENV=development
```

### 4. Database Migrations

```bash
# Apply all migrations to local database
cd ..  # Navigate to project root
supabase db push

# Verify tables created
supabase db diff

# Check migration status
ls -la supabase/migrations
# Should see:
# - 20251103000001_create_users_table.sql
# - 20251103000002_create_profile_tables.sql
# - 20251103000003_create_sobriety_tables.sql
# - 20251103000004_create_connection_tables.sql
# - 20251103000005_create_step_tables.sql
# - 20251103000006_create_messaging_tables.sql
# - 20251103000007_create_notifications_table.sql
# - 20251103000008_create_triggers.sql
# - 20251103000009_seed_steps.sql
```

### 5. Run Mobile App

**iOS (macOS only)**:

```bash
cd mobile
npm run ios
# OR with specific simulator
npm run ios -- --simulator="iPhone 14 Pro"
```

**Android**:

```bash
cd mobile
npm run android
# Make sure Android emulator is running or device is connected
```

**Metro Bundler** (auto-starts with above commands):

```bash
# Or start manually
npm start
```

---

## Project Structure

```
volvox-sober/
├── mobile/                      # React Native mobile app
│   ├── android/                 # Android native code
│   ├── ios/                     # iOS native code
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/         # Buttons, inputs, cards
│   │   │   ├── matching/       # Match cards, compatibility
│   │   │   ├── messaging/      # Message bubbles, check-ins
│   │   │   ├── stepwork/       # Step worksheets
│   │   │   └── tracking/       # Sobriety calendars
│   │   ├── screens/            # Top-level screen components
│   │   │   ├── auth/           # Login, signup, onboarding
│   │   │   ├── profile/        # User profiles
│   │   │   ├── matching/       # Browse matches, requests
│   │   │   ├── dashboard/      # Sponsor/sponsee dashboards
│   │   │   ├── sobriety/       # Sobriety tracking
│   │   │   ├── stepwork/       # 12-step program
│   │   │   ├── messaging/      # Conversations
│   │   │   └── settings/       # App settings, theme
│   │   ├── navigation/         # React Navigation setup
│   │   ├── store/              # Redux state management
│   │   │   ├── slices/         # Feature state slices
│   │   │   └── api/            # RTK Query API definitions
│   │   ├── services/           # Business logic
│   │   │   ├── supabase.ts     # Supabase client
│   │   │   ├── notifications.ts # FCM integration
│   │   │   ├── offline.ts      # Offline sync
│   │   │   └── realtime.ts     # Realtime subscriptions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── theme/              # Light/dark theme defs
│   │   └── types/              # TypeScript types
│   ├── __tests__/              # Tests (unit, integration, e2e)
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/                    # Backend configuration
│   ├── migrations/              # PostgreSQL schema versions
│   │   └── 20250103000000_initial_schema.sql
│   ├── functions/               # Edge Functions (Deno)
│   │   ├── matching-algorithm/  # Weighted scoring
│   │   ├── notifications/       # Push notification dispatch
│   │   └── scheduled-tasks/     # Cron jobs (milestones)
│   ├── seed.sql                 # Development seed data
│   └── config.toml              # Supabase project config
│
├── shared/                      # Shared types across mobile & backend
│   └── types/
│       ├── entities/            # Database entity types
│       ├── api/                 # API request/response types
│       └── contracts/           # Contract validation schemas
│
├── kitty-specs/                 # Feature specifications (planning artifacts)
│   └── 001-volvox-sober-recovery/
│       ├── spec.md              # Feature specification
│       ├── plan.md              # Implementation plan
│       ├── research.md          # Technology research
│       ├── data-model.md        # Database schema
│       ├── quickstart.md        # This file
│       └── contracts/           # API contracts (OpenAPI)
│
├── package.json                 # Root package.json (workspace)
├── tsconfig.json                # Root TypeScript config
└── README.md                    # Project overview
```

---

## Development Workflow

### Feature Development

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write Tests First** (TDD approach)

   ```bash
   cd mobile
   npm test -- --watch
   ```

3. **Implement Feature**
   - Create components in `src/components/`
   - Create screens in `src/screens/`
   - Add state management in `src/store/slices/`
   - Define API calls in `src/store/api/`

4. **Run Lint and Type Check**

   ```bash
   npm run lint
   npm run typecheck
   ```

5. **Test on Both Platforms**

   ```bash
   npm run ios
   npm run android
   ```

6. **Create Pull Request**

### Database Migrations

```bash
# Create new migration
supabase migration new <migration-name>

# Edit migration file in supabase/migrations/
# Example: supabase/migrations/20250103123456_add_user_preferences.sql

# Apply migration to local database
supabase db push

# Test migration
# ... run app and verify changes ...

# Commit migration file
git add supabase/migrations/
git commit -m "Add user preferences migration"
```

### Edge Functions Development

```bash
# Create new Edge Function
supabase functions new function-name

# Develop locally with hot reload
supabase functions serve function-name

# Test function
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'

# Deploy to Supabase
supabase functions deploy function-name
```

---

## Key Technologies

### React Native Ecosystem

- **React Native 0.73+**: Core framework
- **React Navigation 6**: Navigation and routing
- **React Native Paper**: Material Design UI components
- **Redux Toolkit**: State management
- **RTK Query**: Data fetching and caching
- **React Native Firebase**: Push notifications (FCM)
- **AsyncStorage**: Local persistent storage
- **Redux Persist**: State persistence

### Supabase Stack

- **PostgreSQL 15+**: Relational database
- **Supabase Realtime**: WebSocket subscriptions (LISTEN/NOTIFY)
- **Supabase Auth**: JWT-based authentication
- **Supabase Storage**: Object storage for profile photos
- **Edge Functions**: Deno runtime for serverless functions
- **Row Level Security (RLS)**: Database-level authorization

### Testing Stack

- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **Detox**: E2E testing for mobile
- **Supertest**: API endpoint testing
- **Supabase Test Helpers**: Database testing utilities

---

## Common Tasks

### Adding a New Screen

```typescript
// 1. Create screen component
// mobile/src/screens/NewFeature/NewFeatureScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export const NewFeatureScreen: React.FC = () => {
  return (
    <View>
      <Text>New Feature</Text>
    </View>
  );
};

// 2. Add to navigation
// mobile/src/navigation/AppNavigator.tsx
import { NewFeatureScreen } from '../screens/NewFeature/NewFeatureScreen';

// Add to stack navigator
<Stack.Screen name="NewFeature" component={NewFeatureScreen} />

// 3. Navigate to screen
navigation.navigate('NewFeature');
```

### Adding API Endpoint

```typescript
// 1. Define endpoint in RTK Query API
// mobile/src/store/api/userApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery } from './supabaseBaseQuery';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: supabaseBaseQuery,
  endpoints: builder => ({
    getUserProfile: builder.query({
      query: userId => `users/${userId}`,
    }),
  }),
});

export const { useGetUserProfileQuery } = userApi;

// 2. Use in component
const { data: user, isLoading } = useGetUserProfileQuery(userId);
```

### Setting Up Realtime Subscription

```typescript
// mobile/src/services/realtime.ts
import { supabase } from './supabase';

export const subscribeToMessages = (
  connectionId: string,
  onNewMessage: (message: Message) => void,
) => {
  const subscription = supabase
    .channel(`connection:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      },
      payload => {
        onNewMessage(payload.new as Message);
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
```

---

## Testing

### Unit Tests

```bash
cd mobile
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Test Supabase integration with local database
npm run test:integration
```

### E2E Tests (Detox)

**Prerequisites**:
- **iOS**: Xcode 14+, applesimutils (`brew tap wix/brew && brew install applesimutils`)
- **Android**: Android Studio, Android Emulator running with AVD `Pixel_7_API_34`

```bash
# iOS E2E Testing
npm run build:e2e:ios      # Build app for iOS simulator
npm run test:e2e:ios        # Run E2E tests on iOS

# Android E2E Testing (start emulator first)
emulator -avd Pixel_7_API_34  # Start Android emulator
npm run build:e2e:android   # Build app for Android emulator
npm run test:e2e:android    # Run E2E tests on Android

# Run specific test
npx detox test e2e/firstTest.test.js --configuration ios.sim.debug

# Verbose logging
npm run test:e2e:ios -- --loglevel verbose
```

**Troubleshooting**: See `mobile/e2e/README.md` for detailed setup instructions and troubleshooting guide.

---

## Debugging

### React Native Debugger

```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Enable debug mode in app
# Shake device/emulator → "Debug" → Opens in debugger
```

### Supabase Logs

```bash
# View Edge Function logs
supabase functions logs function-name

# View database logs
supabase db logs

# View Realtime logs
supabase realtime logs
```

### Network Debugging

```bash
# Use Flipper for network inspection
# Install Flipper: https://fbflipper.com
# Network plugin shows all API calls, responses, timing
```

---

## Deployment

### Mobile App Deployment

**iOS (App Store)**:

```bash
cd mobile/ios
# Update version in Info.plist
fastlane release  # Or manual via Xcode
```

**Android (Google Play)**:

```bash
cd mobile/android
# Update versionCode and versionName in build.gradle
./gradlew bundleRelease
```

### Supabase Deployment

```bash
# Deploy all Edge Functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name

# Apply migrations to production
supabase db push --linked
```

---

## Troubleshooting

### Common Issues

**Metro Bundler Port Conflict**:

```bash
# Kill existing Metro process
npx react-native start --reset-cache
```

**iOS Pod Install Fails**:

```bash
cd mobile/ios
pod deintegrate
pod install
```

**Android Build Fails**:

```bash
cd mobile/android
./gradlew clean
cd ..
npm run android
```

**Supabase Connection Issues**:

```bash
# Restart Supabase
supabase stop
supabase start

# Check status
supabase status
```

---

## Resources

- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Supabase Docs**: https://supabase.com/docs
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **Redux Toolkit**: https://redux-toolkit.js.org/introduction/getting-started
- **React Native Paper**: https://callstack.github.io/react-native-paper/

---

## Team Contacts

- **Project Lead**: [Name/Email]
- **Backend Lead**: [Name/Email]
- **Mobile Lead**: [Name/Email]
- **Supabase Support**: https://supabase.com/support

---

**Last Updated**: 2025-11-03
**Doc Version**: 1.1.0 (WP01 + WP02 Complete)
