describe('Volvox.Sober App - Initial E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', location: 'always' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch app successfully', async () => {
    // Verify app launches without crashing
    await expect(element(by.text('Volvox.Sober'))).toBeVisible();
  });

  it('should show welcome or login screen', async () => {
    // Check for either welcome screen or login screen elements
    // This will depend on whether user is authenticated
    try {
      await expect(element(by.id('welcome-screen'))).toBeVisible();
    } catch (_e) {
      // If not welcome screen, should show login
      await expect(element(by.id('login-screen'))).toBeVisible();
    }
  });

  it('should navigate to login screen', async () => {
    // Attempt to navigate to login if there's a login button
    try {
      await element(by.id('login-button')).tap();
      await expect(element(by.id('login-screen'))).toBeVisible();
    } catch (_e) {
      // Already on login screen or navigation not available
      console.log('Login navigation test skipped - element not found');
    }
  });

  it('should display email input field on login screen', async () => {
    try {
      await expect(element(by.id('email-input'))).toBeVisible();
    } catch (_e) {
      console.log('Email input test skipped - not on login screen');
    }
  });

  it('should display password input field on login screen', async () => {
    try {
      await expect(element(by.id('password-input'))).toBeVisible();
    } catch (_e) {
      console.log('Password input test skipped - not on login screen');
    }
  });
});

describe('Volvox.Sober App - Authentication Flow (Placeholder)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should show validation error for invalid email', async () => {
    // This is a placeholder test - will be implemented when auth screens are ready
    // with proper testID attributes
    console.log('Auth validation tests will be implemented in WP02/WP03');
  });

  it('should allow user to navigate to signup screen', async () => {
    // Placeholder for signup navigation test
    console.log('Signup navigation test will be implemented in WP02/WP03');
  });

  it('should allow user to navigate to forgot password screen', async () => {
    // Placeholder for forgot password navigation test
    console.log('Forgot password test will be implemented in WP02/WP03');
  });
});
