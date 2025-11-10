/**
 * Profile Management Flow E2E Test
 * Tests profile viewing, editing, role changes, and settings management
 * Feature: 002-app-screens (T125)
 */

import { test, expect } from '@playwright/test';

test.describe('Profile Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'sponsor@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);
  });

  test('T125.1: View profile information', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Verify profile header displays
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-name"]')).toContainText('Test Sponsor');
    await expect(page.locator('[data-testid="profile-role"]')).toContainText('Sponsor');

    // Verify profile sections are visible
    await expect(page.locator('[data-testid="profile-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-recovery-program"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-availability"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-completion"]')).toBeVisible();

    // Verify settings sections
    await expect(page.locator('[data-testid="settings-notifications"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-account"]')).toBeVisible();
  });

  test('T125.2: Edit profile information', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');
    await page.waitForURL(/.*\/profile\/edit/);

    // Update bio
    const newBio = `Updated bio at ${new Date().toISOString()}`;
    await page.fill('[data-testid="bio-input"]', newBio);

    // Update recovery program
    await page.click('[data-testid="recovery-program-select"]');
    await page.click('[data-testid="program-option-NA"]');

    // Update availability
    await page.click('[data-testid="availability-select"]');
    await page.click('[data-testid="availability-option-weekends"]');

    // Update location
    await page.fill('[data-testid="city-input"]', 'San Francisco');
    await page.fill('[data-testid="state-input"]', 'CA');

    // Save changes
    await page.click('[data-testid="save-profile-button"]');
    await page.waitForURL(/.*\/profile/);

    // Verify changes persisted
    await expect(page.locator('[data-testid="profile-bio"]')).toContainText(newBio);
    await expect(page.locator('[data-testid="profile-recovery-program"]')).toContainText('NA');
    await expect(page.locator('[data-testid="profile-availability"]')).toContainText('Weekends');
    await expect(page.locator('[data-testid="profile-location"]')).toContainText(
      'San Francisco, CA',
    );
  });

  test('T125.3: Change role from sponsor to sponsee', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Click change role button
    await page.click('[data-testid="change-role-button"]');
    await page.waitForURL(/.*\/profile\/change-role/);

    // Select sponsee role
    await page.click('[data-testid="role-option-sponsee"]');

    // Fill sponsee-specific fields
    await page.click('[data-testid="support-needs-select"]');
    await page.click('[data-testid="need-option-emotional"]');
    await page.click('[data-testid="need-option-accountability"]');

    // Confirm role change
    await page.click('[data-testid="confirm-role-change-button"]');

    // Handle confirmation dialog
    await page.click('[data-testid="confirm-dialog-yes"]');

    // Wait for profile to update
    await page.waitForURL(/.*\/profile/);

    // Verify role changed
    await expect(page.locator('[data-testid="profile-role"]')).toContainText('Sponsee');

    // Verify sponsee-specific fields are visible
    await expect(page.locator('[data-testid="profile-support-needs"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-support-needs"]')).toContainText('Emotional');
    await expect(page.locator('[data-testid="profile-support-needs"]')).toContainText(
      'Accountability',
    );

    // Verify sponsor-specific fields are hidden
    await expect(page.locator('[data-testid="profile-sponsor-experience"]')).not.toBeVisible();
  });

  test('T125.4: Update notification preferences', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Click notification settings
    await page.click('[data-testid="notification-settings-link"]');
    await page.waitForURL(/.*\/settings\/notifications/);

    // Get current state of toggles
    const matchesToggle = page.locator('[data-testid="notify-matches-toggle"]');
    const connectionsToggle = page.locator('[data-testid="notify-connections-toggle"]');
    const messagesToggle = page.locator('[data-testid="notify-messages-toggle"]');
    const milestonesToggle = page.locator('[data-testid="notify-milestones-toggle"]');

    // Toggle each setting
    await matchesToggle.click();
    await connectionsToggle.click();
    await messagesToggle.click();
    await milestonesToggle.click();

    // Navigate back to profile
    await page.click('[data-testid="back-button"]');
    await page.waitForURL(/.*\/profile/);

    // Navigate back to notification settings to verify persistence
    await page.click('[data-testid="notification-settings-link"]');
    await page.waitForURL(/.*\/settings\/notifications/);

    // Verify toggles maintained their state
    await expect(matchesToggle).toBeChecked();
    await expect(connectionsToggle).toBeChecked();
    await expect(messagesToggle).toBeChecked();
    await expect(milestonesToggle).toBeChecked();
  });

  test('T125.5: Update account settings', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Click account settings
    await page.click('[data-testid="account-settings-link"]');
    await page.waitForURL(/.*\/settings\/account/);

    // Verify account sections are visible
    await expect(page.locator('[data-testid="email-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="danger-zone"]')).toBeVisible();

    // Test email update
    await page.click('[data-testid="change-email-button"]');
    await page.fill('[data-testid="new-email-input"]', 'newsponsor@test.com');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.click('[data-testid="save-email-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Email updated successfully. Please check your inbox to verify.',
    );

    // Test password change
    await page.click('[data-testid="change-password-button"]');
    await page.fill('[data-testid="current-password-input"]', 'Password123!');
    await page.fill('[data-testid="new-password-input"]', 'NewPassword456!');
    await page.fill('[data-testid="confirm-new-password-input"]', 'NewPassword456!');
    await page.click('[data-testid="save-password-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Password changed successfully',
    );
  });

  test('T125.6: Profile completion percentage updates', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Get initial completion percentage
    const initialPercentage = await page
      .locator('[data-testid="profile-completion-percentage"]')
      .textContent();

    // Click edit profile
    await page.click('[data-testid="edit-profile-button"]');
    await page.waitForURL(/.*\/profile\/edit/);

    // Add profile photo (mock file upload)
    const photoInput = page.locator('[data-testid="photo-upload-input"]');
    await photoInput.setInputFiles({
      name: 'profile.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    // Add additional optional fields
    await page.fill('[data-testid="sobriety-story-input"]', 'My recovery journey story...');
    await page.fill('[data-testid="interests-input"]', 'Hiking, Reading, Meditation');

    // Save changes
    await page.click('[data-testid="save-profile-button"]');
    await page.waitForURL(/.*\/profile/);

    // Verify completion percentage increased
    const newPercentage = await page
      .locator('[data-testid="profile-completion-percentage"]')
      .textContent();

    expect(parseInt(newPercentage || '0')).toBeGreaterThan(parseInt(initialPercentage || '0'));
  });

  test('T125.7: Validate profile field requirements', async ({ page }) => {
    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Click edit profile
    await page.click('[data-testid="edit-profile-button"]');
    await page.waitForURL(/.*\/profile\/edit/);

    // Clear required fields
    await page.fill('[data-testid="bio-input"]', '');
    await page.fill('[data-testid="city-input"]', '');

    // Try to save
    await page.click('[data-testid="save-profile-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="bio-error"]')).toContainText('Bio is required');
    await expect(page.locator('[data-testid="city-error"]')).toContainText('City is required');

    // Verify still on edit page
    await expect(page).toHaveURL(/.*\/profile\/edit/);

    // Fill required fields with invalid data
    await page.fill('[data-testid="bio-input"]', 'ab'); // Too short
    await page.click('[data-testid="save-profile-button"]');

    // Verify validation error
    await expect(page.locator('[data-testid="bio-error"]')).toContainText(
      'Bio must be at least 10 characters',
    );

    // Fill with valid data
    await page.fill('[data-testid="bio-input"]', 'Valid bio with enough characters');
    await page.fill('[data-testid="city-input"]', 'San Francisco');
    await page.click('[data-testid="save-profile-button"]');

    // Verify successful save
    await page.waitForURL(/.*\/profile/);
    await expect(page.locator('[data-testid="profile-bio"]')).toContainText(
      'Valid bio with enough characters',
    );
  });

  test('T125.8: Profile data persists across sessions', async ({ page }) => {
    // Navigate to Profile and make changes
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    await page.click('[data-testid="edit-profile-button"]');
    await page.waitForURL(/.*\/profile\/edit/);

    const uniqueBio = `Session test bio ${Date.now()}`;
    await page.fill('[data-testid="bio-input"]', uniqueBio);
    await page.click('[data-testid="save-profile-button"]');
    await page.waitForURL(/.*\/profile/);

    // Verify change saved
    await expect(page.locator('[data-testid="profile-bio"]')).toContainText(uniqueBio);

    // Logout
    // Scroll to bottom to ensure logout button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.click('[data-testid="logout-button"]');
    await page.waitForURL(/.*\/login/);

    // Login again
    await page.fill('[data-testid="email-input"]', 'sponsor@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to Profile
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Verify data persisted
    await expect(page.locator('[data-testid="profile-bio"]')).toContainText(uniqueBio);
  });
});
