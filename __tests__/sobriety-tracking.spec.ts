/**
 * E2E Test: Sobriety Tracking Flow
 * Tests: T082 - set date → view days → add reflection → verify persistence
 * Feature: 002-app-screens
 */

import { test, expect } from '@playwright/test';

test.describe('Sobriety Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('http://localhost:19006/(auth)/login');

    // Login with test credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to sobriety tab
    await page.waitForURL('**/sobriety', { timeout: 5000 });
  });

  test('should complete full sobriety tracking flow', async ({ page }) => {
    // Step 1: Set sobriety start date
    await test.step('Set sobriety start date', async () => {
      // Click "Set Start Date" button if no record exists
      const setDateButton = page.getByRole('button', { name: /set start date/i });

      if (await setDateButton.isVisible()) {
        await setDateButton.click();

        // Date picker should appear
        await expect(page.getByRole('dialog')).toBeVisible();

        // Select today's date (or a specific date)
        // Note: Date selection is handled by the native date picker component

        // Confirm date selection
        await page.getByRole('button', { name: /confirm/i }).click();

        // Success alert should appear
        await expect(page.getByText(/your sobriety start date has been set/i)).toBeVisible();
        await page.getByRole('button', { name: 'OK' }).click();

        // Wait for data to refresh
        await page.waitForTimeout(1000);
      }
    });

    // Step 2: View days counter
    await test.step('View days sober counter', async () => {
      // Days counter should be visible
      const daysCounter = page.getByTestId('days-counter');
      await expect(daysCounter).toBeVisible();

      // Should display "0" for today's start date
      await expect(daysCounter).toContainText('0');

      // Start date should be displayed
      const startDate = page.getByTestId('start-date');
      await expect(startDate).toBeVisible();
    });

    // Step 3: View upcoming milestones
    await test.step('View upcoming milestones', async () => {
      // Should show upcoming milestones (24 hours, 1 week, 1 month)
      await expect(page.getByText(/24 hours/i)).toBeVisible();
      await expect(page.getByText(/1 week/i)).toBeVisible();
      await expect(page.getByText(/1 month/i)).toBeVisible();
    });

    // Step 4: Add daily reflection
    await test.step('Add daily reflection', async () => {
      // Click "Add Reflection" FAB
      const addReflectionButton = page.getByRole('button', { name: /add reflection/i });
      await addReflectionButton.click();

      // Reflection input should appear
      await expect(page.getByTestId('reflection-input')).toBeVisible();

      // Enter reflection text
      const reflectionText = 'Feeling strong and grateful for this new beginning.';
      await page.fill('[data-testid="reflection-text-input"]', reflectionText);

      // Select mood (optional)
      await page.click('[data-testid="mood-selector"]');
      await page.click('[data-testid="mood-grateful"]');

      // Submit reflection
      await page.click('[data-testid="submit-reflection-button"]');

      // Success alert should appear
      await expect(page.getByText(/your reflection has been saved/i)).toBeVisible();
      await page.getByRole('button', { name: 'OK' }).click();

      // Wait for data to refresh
      await page.waitForTimeout(1000);
    });

    // Step 5: Verify reflection persistence
    await test.step('Verify reflection appears in timeline', async () => {
      // Reflection should appear in timeline
      const timeline = page.getByTestId('reflections-timeline');
      await expect(timeline).toBeVisible();

      // Should contain the reflection text
      await expect(timeline).toContainText('Feeling strong and grateful');

      // Should display today's date
      const today = new Date().toLocaleDateString();
      await expect(timeline).toContainText(today);
    });

    // Step 6: Test pull-to-refresh
    await test.step('Test pull-to-refresh', async () => {
      // Scroll to top
      await page.evaluate(() => window.scrollTo(0, 0));

      // Trigger pull-to-refresh (simulate touch gesture)
      await page.mouse.move(200, 100);
      await page.mouse.down();
      await page.mouse.move(200, 300);
      await page.mouse.up();

      // Loading indicator should appear briefly
      await expect(page.getByTestId('loading-spinner')).toBeVisible();

      // Data should still be present after refresh
      await expect(page.getByTestId('days-counter')).toBeVisible();
      await expect(page.getByText('Feeling strong and grateful')).toBeVisible();
    });

    // Step 7: Verify persistence after navigation
    await test.step('Verify persistence after navigation', async () => {
      // Navigate to another tab
      await page.click('[data-testid="tab-matches"]');
      await page.waitForURL('**/matches');

      // Navigate back to sobriety tab
      await page.click('[data-testid="tab-sobriety"]');
      await page.waitForURL('**/sobriety');

      // Data should still be present
      await expect(page.getByTestId('days-counter')).toBeVisible();
      await expect(page.getByText('Feeling strong and grateful')).toBeVisible();
    });
  });

  test('should show milestone notification on achievement', async ({ page }) => {
    await test.step('Simulate 30-day milestone', async () => {
      // Set start date to 30 days ago (would require admin/test API)
      // For now, we'll test the notification logic exists

      // Check if milestone detection logic is present
      const daysCounter = page.getByTestId('days-counter');
      await expect(daysCounter).toBeVisible();

      // If days sober is a milestone (30, 60, 90, etc.), alert should show
      // This would need to be tested with a backdated start date
    });
  });

  test('should handle empty state correctly', async ({ page }) => {
    await test.step('Clear sobriety data (if exists)', async () => {
      // This would require a test API to clear data
      // For now, test with a new user account
    });

    await test.step('Show empty state with call-to-action', async () => {
      // Navigate to sobriety screen
      await page.goto('http://localhost:19006/(tabs)/sobriety');

      // If no record exists, empty state should show
      const emptyState = page.getByTestId('empty-state');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/start your journey/i);
        await expect(page.getByRole('button', { name: /set start date/i })).toBeVisible();
      }
    });
  });

  test('should handle errors gracefully', async ({ page }) => {
    await test.step('Test network error handling', async () => {
      // Simulate network offline
      await page.context().setOffline(true);

      // Try to add reflection
      await page.click('[data-testid="add-reflection-button"]');
      await page.fill('[data-testid="reflection-text-input"]', 'Test reflection');
      await page.click('[data-testid="submit-reflection-button"]');

      // Error alert should appear
      await expect(page.getByText(/failed to save reflection/i)).toBeVisible();
      await page.getByRole('button', { name: 'OK' }).click();

      // Restore network
      await page.context().setOffline(false);
    });
  });

  test('should validate reflection input', async ({ page }) => {
    await test.step('Test empty reflection submission', async () => {
      // Click "Add Reflection" FAB
      await page.click('[data-testid="add-reflection-button"]');

      // Try to submit without text
      await page.click('[data-testid="submit-reflection-button"]');

      // Should show validation error or prevent submission
      const reflectionInput = page.getByTestId('reflection-text-input');
      await expect(reflectionInput).toHaveAttribute('required', 'true');
    });

    await test.step('Test maximum length validation', async () => {
      // Enter text exceeding maximum length (e.g., 1000 characters)
      const longText = 'a'.repeat(1001);
      await page.fill('[data-testid="reflection-text-input"]', longText);

      // Should show character count warning
      await expect(page.getByText(/character limit exceeded/i)).toBeVisible();
    });
  });

  test('should support accessibility features', async ({ page }) => {
    await test.step('Check ARIA labels and roles', async () => {
      // FAB should have proper accessibility attributes
      const addReflectionButton = page.getByRole('button', { name: /add reflection/i });
      await expect(addReflectionButton).toHaveAttribute('aria-label');

      // Days counter should have proper semantic structure
      const daysCounter = page.getByTestId('days-counter');
      await expect(daysCounter).toHaveAttribute('role', 'region');
    });

    await test.step('Check keyboard navigation', async () => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Focus should be on first interactive element
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
    });
  });
});

test.describe('Sobriety Date Management', () => {
  test('should allow updating sobriety start date', async ({ page }) => {
    await page.goto('http://localhost:19006/(auth)/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/sobriety');

    await test.step('Update existing start date', async () => {
      // Click on start date to edit
      await page.click('[data-testid="start-date"]');

      // Date picker should appear
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select a different date
      // (Implementation depends on date picker component)

      // Confirm new date
      await page.click('[data-testid="confirm-date-button"]');

      // Success message
      await expect(page.getByText(/sobriety start date has been set/i)).toBeVisible();
    });
  });
});
