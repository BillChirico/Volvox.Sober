# Quickstart: Authentication Screens Development

**Branch**: `001-auth-screens` | **Date**: 2025-11-04

This guide helps developers set up their local environment to work on the authentication screens feature.

## Prerequisites

Before starting, ensure you have:

- **Node.js**: 18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: 8.0.0 or higher (`npm install -g pnpm`)
- **Git**: Latest version
- **Expo Go app** (optional, for physical device testing):
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS Simulator** (macOS only): Xcode 14+ with Command Line Tools
- **Android Emulator**: Android Studio + SDK 33+

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/volvox-sober.git
cd volvox-sober

# Checkout the feature branch
git checkout 001-auth-screens

# Install dependencies
pnpm install
```

## Step 2: Supabase Configuration

### Option A: Use Existing Supabase Project (Recommended)

Ask project lead for access to the shared Supabase project, then:

```bash
# Copy environment template
cp .env.example .env

# Add Supabase credentials (provided by project lead)
# EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### Option B: Create Your Own Supabase Project (For Isolated Testing)

1. **Create Supabase Project**:
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New project"
   - Name: `volvox-sober-dev-[yourname]`
   - Database password: Choose strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 minutes)

2. **Get API Credentials**:
   - Go to Project Settings → API
   - Copy "Project URL" and "anon public" key

3. **Configure Environment**:

   ```bash
   # Create .env file
   cp .env.example .env

   # Edit .env with your credentials
   EXPO_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

4. **Configure Supabase Auth Settings**:
   - Go to Authentication → Settings
   - **Enable Email Confirmations**: ON
   - **Confirmation Email Template**:
     - Subject: `Confirm your email for Volvox.Sober`
     - Body: (use default template)
   - **Password Recovery Template**:
     - Subject: `Reset your password for Volvox.Sober`
     - Body: (use default template)
   - **Site URL**: `http://localhost:8081` (for local development)
   - **Redirect URLs**: Add:
     - `volvoxsober://auth/verify`
     - `volvoxsober://auth/forgot-password`
     - `exp://localhost:8081` (for Expo dev)

5. **Configure Email Service**:
   - Go to Project Settings → Email
   - For development, use Supabase's built-in email service (no SMTP setup needed)
   - For production, configure SendGrid/AWS SES

## Step 3: Deep Link Configuration

Deep links are already configured in `app.json`:

```json
{
  "expo": {
    "scheme": "volvoxsober",
    "ios": {
      "associatedDomains": ["applinks:volvoxsober.app"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "volvoxsober" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

No additional setup needed for local development.

## Step 4: Start Development Server

```bash
# Start Expo dev server
pnpm start

# Or start with specific platform
pnpm ios      # iOS Simulator (macOS only)
pnpm android  # Android Emulator
pnpm web      # Web browser
```

**First-time setup**: Expo will prompt to install Expo CLI if not present. Follow prompts.

## Step 5: Run on Device/Simulator

### iOS Simulator (macOS only)

```bash
# Start iOS simulator
pnpm ios

# Or press 'i' in Expo dev server terminal
```

**Troubleshooting**:

- If simulator doesn't open: Open Xcode → Preferences → Locations → Ensure Command Line Tools is selected
- If build fails: `cd ios && pod install && cd ..` (if ios/ directory exists)

### Android Emulator

```bash
# Start Android emulator (ensure emulator is running first)
pnpm android

# Or press 'a' in Expo dev server terminal
```

**Troubleshooting**:

- If emulator doesn't open: Open Android Studio → AVD Manager → Create/Start virtual device
- If build fails: Check `ANDROID_HOME` environment variable is set

### Physical Device (Expo Go)

1. Install Expo Go app on your device
2. Ensure device and computer are on same WiFi network
3. Scan QR code from Expo dev server terminal

**For iOS**: Camera app can scan QR code directly
**For Android**: Use Expo Go app's "Scan QR Code" feature

### Web Browser

```bash
# Start web version
pnpm web

# Or press 'w' in Expo dev server terminal
```

Opens at `http://localhost:8081` by default.

## Step 6: Verify Setup

### Test Authentication Flow

1. **Access Login Screen**:
   - App should redirect to `(auth)/login` on first launch
   - If you see main app, you may have cached session (clear app data)

2. **Test Signup**:
   - Navigate to signup screen
   - Enter email: `test@example.com`
   - Enter password: `Test1234`
   - Submit form
   - You should see "Check your email" message

3. **Check Email**:
   - Check Supabase dashboard: Authentication → Users
   - User should appear with `email_confirmed_at = null`
   - Go to Authentication → Logs to see email send event

4. **Verify Email** (manual simulation):
   - In Supabase dashboard: Authentication → Users
   - Click on test user → "Confirm email"
   - Manually set `email_confirmed_at` to current timestamp

5. **Test Login**:
   - Return to app login screen
   - Enter email: `test@example.com`
   - Enter password: `Test1234`
   - Submit form
   - You should be redirected to main app (or onboarding if not completed)

### Check Redux State

Enable Redux DevTools:

```bash
# Install Redux DevTools extension (Chrome/Firefox)
# Extension auto-connects to React Native Debugger
```

Inspect Redux state:

- `auth.session` should contain access_token, refresh_token
- `auth.user` should contain user object
- `auth.loading` should be false when operations complete

## Step 7: Development Workflow

### File Structure for Auth Feature

```
app/(auth)/              # Auth screens (Expo Router)
├── _layout.tsx          # Stack navigator layout
├── login.tsx            # Login screen
├── signup.tsx           # Signup screen
├── forgot-password.tsx  # Password reset screen
└── verify-email.tsx     # Email verification landing

src/components/auth/     # Auth components
├── LoginForm.tsx
├── SignupForm.tsx
├── ForgotPasswordForm.tsx
├── PasswordInput.tsx
├── PasswordStrength.tsx
└── AuthErrorMessage.tsx

src/services/
├── authService.ts       # Supabase Auth wrapper
└── validationSchemas.ts # Yup validation schemas

src/store/auth/          # Redux state management
├── authSlice.ts
├── authSelectors.ts
└── authThunks.ts

src/types/
└── auth.ts              # TypeScript types

src/hooks/
├── useAuth.ts           # Auth operations hook
└── useAuthRedirect.ts   # Navigation hook

src/utils/
└── passwordStrength.ts  # Password strength utility

__tests__/               # Tests (co-located)
├── components/auth/
├── services/
├── store/auth/
└── utils/
```

### TDD Workflow (MANDATORY)

Follow this cycle for ALL features:

1. **Write Test First**:

   ```bash
   # Example: Create test file
   touch __tests__/components/auth/LoginForm.test.tsx

   # Write failing test
   # Run test → VERIFY IT FAILS
   pnpm test LoginForm
   ```

2. **Implement Feature**:

   ```bash
   # Create component
   touch src/components/auth/LoginForm.tsx

   # Implement minimum code to pass test
   ```

3. **Run Tests**:

   ```bash
   # Verify test passes
   pnpm test LoginForm

   # Run all auth tests
   pnpm test -- auth
   ```

4. **Refactor**:
   - Improve code quality while keeping tests green
   - Re-run tests after each change

### Hot Reload

Expo supports Fast Refresh:

- Save file → Changes appear instantly in simulator/device
- Redux state persists across reloads
- Works for components, screens, and styles
- Does NOT work for native modules or app.json changes (requires restart)

### TypeScript Type Checking

```bash
# Run type checker
pnpm typecheck

# Watch mode (auto-check on file save)
pnpm typecheck --watch
```

Fix all TypeScript errors before committing!

### Code Quality Checks

```bash
# Run all checks (required before committing)
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm test         # Jest tests
pnpm format       # Prettier formatting

# Auto-fix linting issues
pnpm lint:fix
```

## Step 8: Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (recommended during development)
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test LoginForm.test.tsx

# Run tests matching pattern
pnpm test -- auth  # All tests with "auth" in path
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run specific E2E test
pnpm test:e2e -- auth/login.spec.ts

# Run E2E tests in headed mode (see browser)
pnpm test:e2e --headed
```

### Manual Testing Checklist

Before submitting PR, manually test:

- [ ] Signup with valid credentials
- [ ] Signup with duplicate email (error message)
- [ ] Signup with weak password (error message)
- [ ] Login with correct credentials
- [ ] Login with wrong password (error message)
- [ ] Login with unverified email (error message)
- [ ] Request password reset
- [ ] Reset password with valid token
- [ ] Reset password with expired token (error message)
- [ ] Navigate between auth screens
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on web browser
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Test in dark mode
- [ ] Test with different text sizes (accessibility)

## Step 9: Debugging

### React Native Debugger

```bash
# Start React Native Debugger
# Press 'j' in Expo dev server terminal
# Or shake device → "Debug Remote JS"
```

**Debugging Tools**:

- Console logs appear in terminal and debugger
- Redux DevTools for state inspection
- Network tab for API calls
- React DevTools for component inspection

### Common Issues

**Issue**: "Unable to connect to Supabase"

- **Fix**: Check `.env` file exists and contains correct credentials
- **Fix**: Restart Expo dev server after changing `.env`

**Issue**: "Email not sent"

- **Fix**: Check Supabase Auth → Logs for email send errors
- **Fix**: Verify email service configured in Supabase dashboard

**Issue**: "Deep link not working"

- **Fix**: Ensure app is running when clicking email link
- **Fix**: Test with `npx uri-scheme open volvoxsober://auth/verify --ios`

**Issue**: "Session not persisting"

- **Fix**: Check Redux Persist is configured correctly
- **Fix**: Clear AsyncStorage: `expo r -c` (clear cache)

**Issue**: "TypeScript errors"

- **Fix**: Run `pnpm typecheck` to see all errors
- **Fix**: Ensure `strict: true` in tsconfig.json

**Issue**: "Tests failing"

- **Fix**: Run tests in watch mode: `pnpm test --watch`
- **Fix**: Check test mocks are set up correctly

### Logging

```typescript
// Use console.log for development (remove before committing)
console.log('Auth state:', authState);

// Use console.error for errors
console.error('Auth error:', error);

// Use console.warn for warnings
console.warn('Session expiring soon');
```

**Note**: Remove all console logs before submitting PR (ESLint will catch them).

## Step 10: Before Committing

Run this checklist:

```bash
# 1. Type checking
pnpm typecheck

# 2. Linting
pnpm lint

# 3. Tests
pnpm test

# 4. Code formatting
pnpm format

# 5. Build check (ensure no build errors)
pnpm build:check  # If script exists, or just typecheck
```

All checks must pass ✅ before committing.

### Git Workflow

```bash
# Check current branch
git branch  # Should be 001-auth-screens

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(auth): implement login screen with Supabase Auth"

# Push to remote
git push origin 001-auth-screens
```

**Conventional Commit Prefixes**:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

## Additional Resources

### Documentation

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Native Paper Docs](https://reactnativepaper.com/)
- [Yup Validation Docs](https://github.com/jquense/yup)

### Feature-Specific Docs

- [specs/001-auth-screens/spec.md](./spec.md) - Feature specification
- [specs/001-auth-screens/plan.md](./plan.md) - Implementation plan
- [specs/001-auth-screens/research.md](./research.md) - Technical decisions
- [specs/001-auth-screens/data-model.md](./data-model.md) - Data model
- [specs/001-auth-screens/contracts/auth.yaml](./contracts/auth.yaml) - API contracts

### Getting Help

- **Slack**: #volvox-dev channel
- **GitHub Issues**: [Create issue](https://github.com/yourusername/volvox-sober/issues/new)
- **Project Lead**: Contact via Slack
- **Documentation**: Check `/docs` directory in repo root

## Troubleshooting

### Clear All Caches (Nuclear Option)

If nothing works, try this:

```bash
# Stop Expo dev server (Ctrl+C)

# Clear all caches
pnpm expo start --clear

# Or manually clear
rm -rf node_modules
rm -rf .expo
rm -rf ios/build  # If exists
rm -rf android/build  # If exists
pnpm install
```

### Reset Supabase Local State

```bash
# Clear AsyncStorage
expo r -c  # Clears cache and restarts

# Or manually in app
// Add this temporary code in App.tsx
import AsyncStorage from '@react-native-async-storage/async-storage'
AsyncStorage.clear()
```

### Verify Environment Variables

```bash
# Check .env file exists
cat .env

# Should output:
# EXPO_PUBLIC_SUPABASE_URL=https://...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# Restart Expo after changing .env
```

## Next Steps

Once setup is complete:

1. **Read Feature Spec**: [specs/001-auth-screens/spec.md](./spec.md)
2. **Review Implementation Plan**: [specs/001-auth-screens/plan.md](./plan.md)
3. **Check Tasks**: [specs/001-auth-screens/tasks.md](./tasks.md) (created by `/speckit.tasks`)
4. **Start Implementing**: Follow TDD workflow for each task
5. **Submit PR**: When feature is complete and all checks pass

Happy coding! 🚀
