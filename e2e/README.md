# Detox E2E Testing Setup

## Overview

This directory contains end-to-end tests for the Volvox.Sober mobile app using Detox.

## Prerequisites

### iOS Testing

- **macOS** with Xcode 14+ installed
- **iOS Simulator** (comes with Xcode)
- **Homebrew** (for installing dependencies)

Install required tools:

```bash
# Install applesimutils (required for iOS testing)
brew tap wix/brew
brew install applesimutils
```

### Android Testing

- **Android Studio** with Android SDK installed
- **Android Emulator** configured and running
- **Java Development Kit (JDK)** 11 or higher

Create an Android Virtual Device (AVD):

1. Open Android Studio
2. Go to Tools → Device Manager
3. Create a new device named `Pixel_7_API_34`
4. Use system image: Android 14.0 (API 34)
5. Finish setup and close

## Quick Start

### 1. Build the App for Testing

**iOS:**

```bash
pnpm run build:e2e:ios
```

**Android:**

```bash
# Start emulator first
pnpm run build:e2e:android
```

### 2. Run E2E Tests

**iOS:**

```bash
pnpm run test:e2e:ios
```

**Android:**

```bash
# Make sure emulator is running
pnpm run test:e2e:android
```

## Available Commands

| Command                      | Description                   |
| ---------------------------- | ----------------------------- |
| `pnpm run test:e2e`          | Run iOS E2E tests (default)   |
| `pnpm run test:e2e:ios`      | Run iOS E2E tests             |
| `pnpm run test:e2e:android`  | Run Android E2E tests         |
| `pnpm run build:e2e:ios`     | Build app for iOS testing     |
| `pnpm run build:e2e:android` | Build app for Android testing |

## Test File Structure

```
e2e/
├── README.md              # This file
├── jest.config.js         # Jest configuration for E2E tests
└── firstTest.test.js      # Initial smoke tests
```

## Writing E2E Tests

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should do something', async () => {
    await expect(element(by.id('element-id'))).toBeVisible();
    await element(by.id('button-id')).tap();
    await expect(element(by.text('Expected Text'))).toBeVisible();
  });
});
```

### Best Practices

1. **Use testID attributes**: Add `testID` props to React Native components

   ```jsx
   <Button testID="login-button" title="Login" />
   ```

2. **Wait for elements**: Use `waitFor` for async operations

   ```javascript
   await waitFor(element(by.id('result')))
     .toBeVisible()
     .withTimeout(5000);
   ```

3. **Clean state**: Reset app state between tests

   ```javascript
   beforeEach(async () => {
     await device.reloadReactNative();
   });
   ```

4. **Test user flows**: Focus on critical user journeys
   - Authentication (login, signup, logout)
   - Onboarding flow
   - Core features (matching, messaging, sobriety tracking)

## Troubleshooting

### iOS Issues

**Error: Cannot find app**

```bash
# Rebuild the app
pnpm run build:e2e:ios
```

**Error: Simulator not found**

```bash
# List available simulators
xcrun simctl list devices
# Update .detoxrc.js with available device
```

**Error: applesimutils not found**

```bash
brew tap wix/brew
brew install applesimutils
```

### Android Issues

**Error: Could not find emulator**

```bash
# List available AVDs
emulator -list-avds
# Start emulator manually
emulator -avd Pixel_7_API_34
```

**Error: Build failed**

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
pnpm run build:e2e:android
```

**Error: SDK location not found**

```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### General Issues

**Tests timing out**

- Increase timeout in `e2e/jest.config.js`:
  ```javascript
  testTimeout: 180000, // 3 minutes
  ```

**Flaky tests**

- Add explicit waits:
  ```javascript
  await waitFor(element(by.id('element')))
    .toBeVisible()
    .withTimeout(10000);
  ```

**Multiple instances running**

```bash
# Kill all simulators/emulators
killall Simulator
# Or for Android
adb kill-server && adb start-server
```

## Debugging Tests

### Enable verbose logging

```bash
pnpm run test:e2e:ios -- --loglevel verbose
```

### Take screenshots on failure

```javascript
afterEach(async function () {
  if (this.currentTest.state === 'failed') {
    await device.takeScreenshot(this.currentTest.title);
  }
});
```

### Run single test file

```bash
npx detox test e2e/firstTest.test.js --configuration ios.sim.debug
```

### Run specific test

```bash
npx detox test e2e/firstTest.test.js --configuration ios.sim.debug --grep "should launch app"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run E2E tests (iOS)
  run: |
    pnpm run build:e2e:ios
    pnpm run test:e2e:ios

- name: Upload test artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: detox-artifacts
    path: artifacts/
```

## Configuration Reference

See `.detoxrc.js` in the mobile root directory for full configuration including:

- Device configurations (iPhone 15, Pixel 7 API 34)
- Build commands for iOS and Android
- Test runner settings
- Timeout configurations

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox with React Native](https://wix.github.io/Detox/docs/introduction/getting-started)
- [Writing Detox Tests](https://wix.github.io/Detox/docs/api/test-lifecycle)
- [Detox Matchers](https://wix.github.io/Detox/docs/api/matchers)

## Test Coverage Goals

Per constitution.md requirements:

- **P1 User Stories**: Must have E2E test coverage
- **Critical Flows**: Authentication, onboarding, matching, messaging
- **Regression Testing**: Test all fixed bugs to prevent recurrence

## Next Steps

1. Add testID attributes to all auth screens (WP02)
2. Create authentication flow tests (WP03)
3. Add onboarding flow tests (WP03)
4. Implement matching and connection tests (WP04, WP05)
5. Add messaging and check-in tests (WP08)
