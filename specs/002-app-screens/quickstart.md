# App Screens - Local Development Quickstart

**Feature**: 002-app-screens
**Last Updated**: 2025-11-05
**Estimated Setup Time**: 15-20 minutes

## Prerequisites

Verify these are installed before starting:

```bash
# Required versions
node --version    # v18.0.0 or higher
pnpm --version    # v10.20.0 or higher
npx expo --version # Expo CLI (installed via dependencies)
supabase --version # Supabase CLI v1.0.0+

# Platform-specific (optional for testing)
xcode-select --version  # Xcode 14+ (iOS, macOS only)
adb --version           # Android Studio + SDK 33+ (Android)
```

**Install missing tools**:
```bash
# Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# pnpm
npm install -g pnpm@10.20.0

# Supabase CLI
brew install supabase/tap/supabase  # macOS
# or: npm install -g supabase        # Cross-platform
```

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd /Users/billchirico/Developer/Volvox.Sober

# Install all dependencies
pnpm install

# Verify installation
pnpm typecheck
pnpm lint
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# Get these from: https://supabase.com/dashboard/project/_/settings/api
```

**Required environment variables**:
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Local Supabase
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### 3. Database Setup

**Option A: Remote Supabase (Recommended for feature development)**

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations (including 002-app-screens)
supabase db push

# Verify tables created
supabase db diff
```

**Option B: Local Supabase (Recommended for testing)**

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Seed test data (optional)
supabase db seed
```

### 4. Run the Application

**Start Expo Development Server**:
```bash
pnpm start
```

**Platform-Specific Launch**:
```bash
# iOS (macOS only)
pnpm ios

# Android (requires Android Studio)
pnpm android

# Web (all platforms)
pnpm web
```

**Development Tips**:
- Press `i` in terminal to open iOS simulator
- Press `a` in terminal to open Android emulator
- Press `w` in terminal to open web browser
- Press `r` to reload the app
- Press `m` to toggle menu

## Feature-Specific Setup

### Authentication Testing

Create test users via Supabase Dashboard or CLI:

```bash
# Via Supabase CLI
supabase auth signup test@example.com password123

# Or use the signup screen in the app
# Email verification is disabled in development
```

### Database Inspection

```bash
# Access local Supabase Studio
open http://localhost:54323

# Or run SQL queries directly
supabase db shell
```

### Redux DevTools (Web Only)

```bash
# Install Redux DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/

# Launch web app
pnpm web

# Open Redux DevTools in browser (F12 → Redux tab)
```

## Testing

### Run All Tests

```bash
# Unit tests (Jest + React Native Testing Library)
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Run E2E Tests

```bash
# Start app in test mode
pnpm start

# In another terminal, run Playwright tests
pnpm test:e2e

# Or run specific test file
pnpm test:e2e -- auth.spec.ts
```

### Quality Checks

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Code formatting
pnpm format

# Run all checks before committing
pnpm test && pnpm typecheck && pnpm lint
```

## Common Issues

### Issue: "Expo CLI not found"

```bash
# Clear pnpm cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

### Issue: "Supabase connection failed"

```bash
# Check if Supabase is running (local)
supabase status

# Restart Supabase
supabase stop
supabase start

# Check environment variables
cat .env
```

### Issue: "iOS build fails"

```bash
# Clear iOS build cache
cd ios
rm -rf Pods
pod install --repo-update
cd ..

# Rebuild
pnpm ios
```

### Issue: "Android build fails"

```bash
# Clear Android build cache
cd android
./gradlew clean
cd ..

# Rebuild
pnpm android
```

### Issue: "TypeScript errors after updates"

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
pnpm typecheck --force
```

### Issue: "Redux state not persisting"

```bash
# Clear AsyncStorage (iOS simulator)
xcrun simctl --set testing erase all

# Or clear in app settings
# Settings → Developer → Clear AsyncStorage
```

## Development Workflow

### 1. Start New Feature Work

```bash
# Ensure you're on the feature branch
git checkout 002-app-screens

# Pull latest changes
git pull origin 002-app-screens

# Start development server
pnpm start
```

### 2. Write Tests First (TDD)

```bash
# Create test file
touch __tests__/screens/SobrietyScreen.test.tsx

# Run in watch mode
pnpm test:watch SobrietyScreen

# Follow RED-GREEN-REFACTOR cycle
# 1. Write failing test (RED)
# 2. Write minimal code to pass (GREEN)
# 3. Refactor for quality (REFACTOR)
```

### 3. Implement Feature

```bash
# Create screen file
touch app/(tabs)/sobriety.tsx

# Implement with TypeScript strict mode
# Run type checks frequently
pnpm typecheck
```

### 4. Validate Quality

```bash
# Run all quality checks
pnpm test
pnpm typecheck
pnpm lint

# Test on all platforms
pnpm ios     # iOS
pnpm android # Android
pnpm web     # Web
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(sobriety): add sobriety tracking screen"

# Push to feature branch
git push origin 002-app-screens
```

## Database Migrations

### View Current Migrations

```bash
# List all migrations
ls supabase/migrations/

# View specific migration
cat supabase/migrations/20250105000003_app_screens_schema.sql
```

### Create New Migration

```bash
# Generate migration from database changes
supabase db diff -f migration_name

# Or create manual migration
supabase migration new migration_name

# Edit the generated file
# supabase/migrations/TIMESTAMP_migration_name.sql
```

### Apply Migration

```bash
# Local database
supabase db reset

# Remote database
supabase db push
```

### Rollback Migration (Local Only)

```bash
# Reset to clean state
supabase db reset

# Or restore from backup
supabase db restore
```

## Debugging

### React Native Debugger

```bash
# Shake device/simulator to open debug menu
# Select "Debug JS Remotely"

# Or use Flipper (recommended)
npx flipper
```

### Supabase Logs

```bash
# View real-time logs (local)
supabase logs

# View specific service
supabase logs auth
supabase logs realtime
```

### Network Inspection

```bash
# Use Flipper Network plugin
npx flipper

# Or use React Native Debugger Network tab
# Or browser DevTools (web only)
```

## Performance Profiling

### React Native Performance Monitor

```bash
# Shake device/simulator → Show Perf Monitor
# View FPS, memory usage, UI/JS thread performance
```

### Bundle Size Analysis

```bash
# Analyze web bundle
pnpm web --analyze

# View report in browser
open dist/report.html
```

## Useful Commands

```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
rm -rf ios/Pods
rm -rf android/build
pnpm install

# Reset Supabase
supabase stop
supabase start

# Reset app data (iOS)
xcrun simctl --set testing erase all

# View app logs
npx react-native log-ios
npx react-native log-android

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

## Next Steps

1. **Read the Specification**: `specs/002-app-screens/spec.md`
2. **Review Technical Decisions**: `specs/002-app-screens/research.md`
3. **Understand Database Schema**: `specs/002-app-screens/data-model.md`
4. **Review API Contracts**: `specs/002-app-screens/contracts/`
5. **Check Implementation Plan**: `specs/002-app-screens/plan.md`
6. **Start with Work Packages**: Follow `specs/002-app-screens/tasks.md` (to be generated)

## Support

- **Project Documentation**: `CLAUDE.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Tech Stack Guide**: `docs/tech-stack.md`
- **Troubleshooting**: `docs/troubleshooting.md`

## Health Check

Run this to verify everything is working:

```bash
#!/bin/bash
echo "🔍 Checking environment..."

# Check Node.js
node --version || echo "❌ Node.js not found"

# Check pnpm
pnpm --version || echo "❌ pnpm not found"

# Check Supabase CLI
supabase --version || echo "❌ Supabase CLI not found"

# Check dependencies
[ -d node_modules ] && echo "✅ Dependencies installed" || echo "❌ Run pnpm install"

# Check Supabase status
supabase status && echo "✅ Supabase running" || echo "⚠️  Supabase not running (supabase start)"

# Check environment variables
[ -f .env ] && echo "✅ .env exists" || echo "❌ Create .env from .env.example"

# Run tests
pnpm test --passWithNoTests && echo "✅ Tests passing" || echo "❌ Tests failing"

# Type check
pnpm typecheck && echo "✅ Type check passing" || echo "❌ Type errors found"

echo ""
echo "🎉 Environment health check complete!"
```

Save as `scripts/health-check.sh`, make executable (`chmod +x scripts/health-check.sh`), and run `./scripts/health-check.sh`.
