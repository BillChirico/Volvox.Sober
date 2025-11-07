/**
 * Onboarding Flow E2E Test
 * Tests complete user onboarding from welcome screen through profile setup
 * Feature: 002-app-screens (T141)
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from app root
    await page.goto('http://localhost:8081');
  });

  test('T141.1: Complete onboarding as sponsor', async ({ page }) => {
    // Register new account
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `sponsor-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    // Should redirect to email verification prompt
    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await expect(page.locator('[data-testid="verification-message"]')).toContainText(
      'Please check your email to verify your account',
    );

    // Simulate email verification (in real scenario, would click link in email)
    // For testing, assume verification happens automatically
    await page.click('[data-testid="verification-done-button"]');

    // Should show welcome screen
    await page.waitForURL(/.*\/onboarding\/welcome/);
    await expect(page.locator('[data-testid="welcome-title"]')).toContainText(
      'Welcome to Volvox.Sober',
    );
    await expect(page.locator('[data-testid="welcome-card"]')).toBeVisible();

    // Read welcome content and continue
    await page.click('[data-testid="get-started-button"]');

    // Should show role selection
    await expect(page.locator('[data-testid="role-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-option-sponsor"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-option-sponsee"]')).toBeVisible();

    // Select sponsor role
    await page.click('[data-testid="role-option-sponsor"]');
    await page.click('[data-testid="continue-button"]');

    // Should navigate to sponsor profile form
    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);
    await expect(page.locator('[data-testid="profile-form-title"]')).toContainText(
      'Create Your Sponsor Profile',
    );

    // Fill required fields
    await page.fill('[data-testid="display-name-input"]', 'John S.');
    await page.fill(
      '[data-testid="bio-input"]',
      'Experienced sponsor with 10 years of sobriety. Here to help others on their journey.',
    );
    await page.fill('[data-testid="city-input"]', 'San Francisco');
    await page.fill('[data-testid="state-input"]', 'CA');

    // Select recovery program
    await page.click('[data-testid="recovery-program-select"]');
    await page.click('[data-testid="program-option-AA"]');

    // Fill sponsor-specific fields
    await page.fill('[data-testid="years-sober-input"]', '10');
    await page.fill('[data-testid="sponsor-experience-input"]', '5');

    // Select availability
    await page.click('[data-testid="availability-select"]');
    await page.click('[data-testid="availability-option-daily"]');

    // Submit profile
    await page.click('[data-testid="complete-profile-button"]');

    // Should redirect to Sobriety tab (main app)
    await page.waitForURL(/.*\/sobriety/);
    await expect(page.locator('[data-testid="sobriety-screen"]')).toBeVisible();

    // Verify onboarding completion by checking that going back doesn't show onboarding
    await page.reload();
    await expect(page).toHaveURL(/.*\/sobriety/);
  });

  test('T141.2: Complete onboarding as sponsee', async ({ page }) => {
    // Register new account
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `sponsee-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    // Skip email verification for test
    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await page.click('[data-testid="verification-done-button"]');

    // Welcome screen
    await page.waitForURL(/.*\/onboarding\/welcome/);
    await page.click('[data-testid="get-started-button"]');

    // Select sponsee role
    await page.click('[data-testid="role-option-sponsee"]');
    await page.click('[data-testid="continue-button"]');

    // Should navigate to sponsee profile form
    await page.waitForURL(/.*\/onboarding\/sponsee-profile/);
    await expect(page.locator('[data-testid="profile-form-title"]')).toContainText(
      'Create Your Profile',
    );

    // Fill required fields
    await page.fill('[data-testid="display-name-input"]', 'Sarah M.');
    await page.fill(
      '[data-testid="bio-input"]',
      'New to recovery, looking for guidance and support from an experienced sponsor.',
    );
    await page.fill('[data-testid="city-input"]', 'Oakland');
    await page.fill('[data-testid="state-input"]', 'CA');

    // Select recovery program
    await page.click('[data-testid="recovery-program-select"]');
    await page.click('[data-testid="program-option-NA"]');

    // Fill sponsee-specific fields
    await page.click('[data-testid="support-needs-select"]');
    await page.click('[data-testid="need-option-emotional"]');
    await page.click('[data-testid="need-option-accountability"]');
    await page.click('[data-testid="need-option-guidance"]');

    // Select availability
    await page.click('[data-testid="availability-select"]');
    await page.click('[data-testid="availability-option-evenings"]');

    // Submit profile
    await page.click('[data-testid="complete-profile-button"]');

    // Should redirect to Sobriety tab
    await page.waitForURL(/.*\/sobriety/);
    await expect(page.locator('[data-testid="sobriety-screen"]')).toBeVisible();
  });

  test('T141.3: Onboarding validation - missing required fields', async ({ page }) => {
    // Register and get to profile form
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await page.click('[data-testid="verification-done-button"]');

    await page.waitForURL(/.*\/onboarding\/welcome/);
    await page.click('[data-testid="get-started-button"]');

    await page.click('[data-testid="role-option-sponsor"]');
    await page.click('[data-testid="continue-button"]');

    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);

    // Try to submit without filling required fields
    await page.click('[data-testid="complete-profile-button"]');

    // Verify validation errors appear
    await expect(page.locator('[data-testid="display-name-error"]')).toContainText(
      'Display name is required',
    );
    await expect(page.locator('[data-testid="bio-error"]')).toContainText('Bio is required');
    await expect(page.locator('[data-testid="city-error"]')).toContainText('City is required');
    await expect(page.locator('[data-testid="state-error"]')).toContainText('State is required');
    await expect(page.locator('[data-testid="recovery-program-error"]')).toContainText(
      'Recovery program is required',
    );

    // Verify still on profile form
    await expect(page).toHaveURL(/.*\/onboarding\/sponsor-profile/);
  });

  test('T141.4: Onboarding skip prevention - cannot skip profile setup', async ({ page }) => {
    // Register and get to profile form
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await page.click('[data-testid="verification-done-button"]');

    await page.waitForURL(/.*\/onboarding\/welcome/);
    await page.click('[data-testid="get-started-button"]');

    await page.click('[data-testid="role-option-sponsor"]');
    await page.click('[data-testid="continue-button"]');

    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);

    // Try to navigate away by changing URL
    await page.goto('http://localhost:8081/sobriety');

    // Should redirect back to onboarding
    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);

    // Try navigating via tabs (if visible)
    const tabButton = page.locator('[data-testid="tab-sobriety"]');
    if (await tabButton.isVisible()) {
      await tabButton.click();
      // Should still be on onboarding
      await expect(page).toHaveURL(/.*\/onboarding\/sponsor-profile/);
    }
  });

  test('T141.5: Onboarding progress tracking', async ({ page }) => {
    // Register
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    // Email verification step
    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 1 of 3');

    await page.click('[data-testid="verification-done-button"]');

    // Welcome step
    await page.waitForURL(/.*\/onboarding\/welcome/);
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 2 of 3');

    await page.click('[data-testid="get-started-button"]');

    // Role selection
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 2 of 3');

    await page.click('[data-testid="role-option-sponsor"]');
    await page.click('[data-testid="continue-button"]');

    // Profile form step
    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 3 of 3');
  });

  test('T141.6: Onboarding back navigation', async ({ page }) => {
    // Register and get to role selection
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await page.click('[data-testid="verification-done-button"]');

    await page.waitForURL(/.*\/onboarding\/welcome/);
    await page.click('[data-testid="get-started-button"]');

    // At role selection
    await expect(page.locator('[data-testid="role-selector"]')).toBeVisible();

    // Go back to welcome
    await page.click('[data-testid="back-button"]');
    await expect(page).toHaveURL(/.*\/onboarding\/welcome/);

    // Go forward again
    await page.click('[data-testid="get-started-button"]');

    // Select role and go to profile form
    await page.click('[data-testid="role-option-sponsee"]');
    await page.click('[data-testid="continue-button"]');
    await page.waitForURL(/.*\/onboarding\/sponsee-profile/);

    // Go back to role selection
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="role-selector"]')).toBeVisible();

    // Select different role
    await page.click('[data-testid="role-option-sponsor"]');
    await page.click('[data-testid="continue-button"]');

    // Should go to sponsor profile form
    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);
    await expect(page.locator('[data-testid="profile-form-title"]')).toContainText(
      'Create Your Sponsor Profile',
    );
  });

  test('T141.7: Returning user skips onboarding', async ({ page }) => {
    // Login as existing user who completed onboarding
    await page.fill('[data-testid="email-input"]', 'sponsor@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');

    // Should go directly to Sobriety tab, not onboarding
    await page.waitForURL(/.*\/sobriety/);
    await expect(page.locator('[data-testid="sobriety-screen"]')).toBeVisible();

    // Verify onboarding is not accessible
    await page.goto('http://localhost:8081/onboarding/welcome');
    // Should redirect to sobriety (already onboarded)
    await page.waitForURL(/.*\/sobriety/);
  });

  test('T141.8: Profile completion percentage visible during onboarding', async ({ page }) => {
    // Register and get to profile form
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="signup-button"]');

    await page.waitForURL(/.*\/onboarding\/email-verification/);
    await page.click('[data-testid="verification-done-button"]');

    await page.waitForURL(/.*\/onboarding\/welcome/);
    await page.click('[data-testid="get-started-button"]');

    await page.click('[data-testid="role-option-sponsor"]');
    await page.click('[data-testid="continue-button"]');

    await page.waitForURL(/.*\/onboarding\/sponsor-profile/);

    // Verify completion indicator shows 0% initially
    await expect(page.locator('[data-testid="profile-completion"]')).toContainText('0%');

    // Fill some fields
    await page.fill('[data-testid="display-name-input"]', 'John S.');
    await page.fill('[data-testid="bio-input"]', 'Experienced sponsor helping others.');

    // Completion should increase
    const completionText = await page.locator('[data-testid="profile-completion"]').textContent();
    expect(parseInt(completionText || '0')).toBeGreaterThan(0);
    expect(parseInt(completionText || '0')).toBeLessThan(100);

    // Fill all required fields
    await page.fill('[data-testid="city-input"]', 'San Francisco');
    await page.fill('[data-testid="state-input"]', 'CA');
    await page.click('[data-testid="recovery-program-select"]');
    await page.click('[data-testid="program-option-AA"]');
    await page.fill('[data-testid="years-sober-input"]', '10');
    await page.fill('[data-testid="sponsor-experience-input"]', '5');
    await page.click('[data-testid="availability-select"]');
    await page.click('[data-testid="availability-option-daily"]');

    // Completion should be 100% or near it
    const finalCompletion = await page.locator('[data-testid="profile-completion"]').textContent();
    expect(parseInt(finalCompletion || '0')).toBeGreaterThanOrEqual(80);
  });
});
