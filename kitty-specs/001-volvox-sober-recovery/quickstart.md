# Quickstart Guide: Volvox.Sober Development

**Feature**: Volvox.Sober Recovery Platform
**Branch**: 001-volvox-sober-recovery
**Date**: 2025-11-03

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **Supabase CLI**: `npm install -g supabase`
- **React Native CLI**: `npm install -g react-native-cli`

### Platform-Specific Requirements

**For iOS Development**:
- macOS (required for iOS development)
- Xcode 14+ ([Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
- CocoaPods: `sudo gem install cocoapods`

**For Android Development**:
- Android Studio ([Download](https://developer.android.com/studio))
- Java Development Kit (JDK) 11 or higher
- Android SDK (API level 26+)
- Android Emulator or physical device

---

## Step 1: Clone Repository

```bash
git clone https://github.com/your-org/volvox-sober.git
cd volvox-sober
```

---

## Step 2: Install Dependencies

```bash
# Install Node dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

---

## Step 3: Set Up Supabase Local Development

### Start Supabase Local Instance

```bash
# Initialize Supabase (first time only)
supabase init

# Start local Supabase services (Docker required)
supabase start
```

This will start:
- PostgreSQL database on `localhost:54322`
- Studio UI on `http://localhost:54323`
- API server on `http://localhost:54321`

**Note the output**: Save the `anon key` and `service_role key` for configuration.

### Apply Database Migrations

```bash
# Push schema to local database
supabase db push

# Or apply specific migration
supabase db reset
```

### Seed Test Data

```bash
# Run seed script for development data
supabase db seed
```

---

## Step 4: Configure Environment Variables

Create `.env` file in project root:

```bash
# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_anon_key_from_supabase_start

# Firebase Cloud Messaging (for notifications)
FCM_SERVER_KEY=your_fcm_server_key

# App Config
APP_ENV=development
```

---

## Step 5: Run the Application

### iOS (macOS only)

```bash
# Start Metro bundler
npm start

# In another terminal, run iOS simulator
npm run ios

# Or specify device
npm run ios -- --simulator="iPhone 14 Pro"
```

### Android

```bash
# Start Metro bundler
npm start

# In another terminal, run Android emulator
npm run android

# Or connect physical device via USB (enable USB debugging)
```

---

## Step 6: Verify Setup

Once the app launches:

1. **Sign Up**: Create a test account (use test email like `sponsor@test.com`)
2. **Complete Profile**: Fill in sponsor or sponsee profile
3. **Test Matching**: View sponsor matches (if sponsee) or wait for requests (if sponsor)
4. **Send Message**: Test in-app messaging functionality
5. **Log Sobriety**: Add a sobriety date and verify tracking

---

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- MessageScreen.test.tsx

# Run E2E tests (Playwright)
npm run test:e2e
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Database Migrations

```bash
# Create new migration
supabase migration new add_user_preferences

# Edit migration file in supabase/migrations/

# Apply migration
supabase db push

# Rollback last migration
supabase db reset --db-url <your-db-url>
```

### Supabase Edge Functions

```bash
# Create new Edge Function
supabase functions new send-notification

# Serve locally for testing
supabase functions serve send-notification

# Deploy to Supabase cloud
supabase functions deploy send-notification
```

---

## Common Issues & Troubleshooting

### Issue: Metro bundler cache issues

**Solution**:
```bash
npm start -- --reset-cache
```

### Issue: iOS build fails with CocoaPods error

**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: Android build fails with Gradle error

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: Supabase connection refused

**Solution**:
- Ensure Docker is running
- Restart Supabase: `supabase stop && supabase start`
- Check port conflicts (54321, 54322, 54323)

### Issue: Push notifications not working in development

**Solution**:
- iOS: Notifications require physical device or Expo Go
- Android: Ensure FCM is configured in `google-services.json`
- Check FCM_SERVER_KEY in `.env`

---

## Useful Commands

```bash
# View Supabase logs
supabase db logs

# Access Supabase Studio (GUI)
open http://localhost:54323

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/supabase.ts

# Check React Native info
npx react-native info

# Clear all caches
watchman watch-del-all && rm -rf node_modules && npm install
```

---

## Project Structure Quick Reference

```
volvox-sober/
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # Route screens
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API clients, business logic
│   │   └── types/       # TypeScript definitions
│   ├── tests/           # Jest & Playwright tests
│   ├── ios/             # Native iOS code
│   └── android/         # Native Android code
│
├── supabase/            # Backend
│   ├── migrations/      # Database schema
│   ├── functions/       # Edge Functions
│   └── seed.sql         # Test data
│
└── kitty-specs/         # Documentation
    └── 001-volvox-sober-recovery/
        ├── spec.md      # Feature specification
        ├── plan.md      # Implementation plan
        ├── research.md  # Technical decisions
        └── data-model.md # Database design
```

---

## Next Steps

1. **Read the Spec**: Review `kitty-specs/001-volvox-sober-recovery/spec.md`
2. **Review Data Model**: Understand entities in `data-model.md`
3. **Explore Codebase**: Navigate through `mobile/src/` directory structure
4. **Pick a Task**: Check `kitty-specs/001-volvox-sober-recovery/tasks.md` (after running `/spec-kitty.tasks`)
5. **Start TDD Cycle**: Write test first, implement, verify ✅

---

**Happy Coding!** 🚀

For questions or issues, check the project README or reach out to the team.
