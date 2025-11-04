# Suggested Commands

## Prerequisites
Install required tools before development:
- Node.js v18+ ([Download](https://nodejs.org/))
- npm or yarn
- Git
- Supabase CLI: `npm install -g supabase`
- React Native CLI: `npm install -g react-native-cli`
- Docker Desktop (for Supabase local development)

### Platform-Specific
**iOS** (macOS only):
- Xcode 14+ from Mac App Store
- CocoaPods: `sudo gem install cocoapods`

**Android**:
- Android Studio ([Download](https://developer.android.com/studio))
- JDK 11+
- Android SDK (API 26+)

## Project Setup Commands

### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-org/volvox-sober.git
cd volvox-sober

# Install dependencies
cd mobile && npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Initialize Supabase
supabase init

# Start Supabase services (requires Docker)
supabase start
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with Supabase keys from `supabase start` output
```

## Development Commands

### Running the App
```bash
# Start Metro bundler
npm start

# Run on iOS (macOS only)
npm run ios
# Or specify simulator
npm run ios -- --simulator="iPhone 14 Pro"

# Run on Android
npm run android
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- MessageScreen.test.tsx

# Run with coverage report
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check TypeScript types
npx tsc --noEmit
```

### Database Management
```bash
# Apply migrations
supabase db push

# Create new migration
supabase migration new <migration_name>

# Reset database (destructive)
supabase db reset

# Seed test data
supabase db seed

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/supabase.ts

# View database logs
supabase db logs

# Access Supabase Studio GUI
open http://localhost:54323
```

### Supabase Edge Functions
```bash
# Create new Edge Function
supabase functions new <function_name>

# Serve locally for testing
supabase functions serve <function_name>

# Deploy to Supabase cloud
supabase functions deploy <function_name>
```

## Troubleshooting Commands

### Cache Issues
```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Clear all caches (nuclear option)
watchman watch-del-all && rm -rf node_modules && npm install
```

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Supabase Connection Issues
```bash
# Ensure Docker is running, then:
supabase stop && supabase start

# Check for port conflicts (54321, 54322, 54323)
lsof -i :54321
```

## Utility Commands

### System Information
```bash
# Check React Native environment
npx react-native info

# Check Node/npm versions
node --version && npm --version

# Verify Supabase CLI installation
supabase --version
```

### Git Workflow
```bash
# Check current branch and status
git status && git branch

# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat(scope): description"

# Push feature branch
git push origin feature/your-feature-name
```

## Performance Profiling
```bash
# Profile React Native performance
npx react-native start --reset-cache

# Generate production build for profiling
# iOS
npx react-native run-ios --configuration Release
# Android
npx react-native run-android --variant=release
```

## Platform Commands (Darwin/macOS Specific)
```bash
# View running iOS simulators
xcrun simctl list devices | grep Booted

# Reset iOS simulator
xcrun simctl erase all

# Open iOS logs
xcrun simctl spawn booted log stream --level debug

# Check Android devices
adb devices
```