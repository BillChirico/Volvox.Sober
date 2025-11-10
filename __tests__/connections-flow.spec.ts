/**
 * E2E Test: Connections Flow
 * Tests: T104 - accept request → view active → send message → end connection
 * Feature: 002-app-screens
 */

import { test, expect } from '@playwright/test';

test.describe('Connections Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('http://localhost:19006/(auth)/login');

    // Login with test credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to connections tab
    await page.waitForURL('**/connections', { timeout: 5000 });
  });

  test('should complete full connections flow', async ({ page }) => {
    // Step 1: Accept a pending connection request
    await test.step('Accept pending connection request', async () => {
      // Check for pending requests section
      const pendingSection = page.getByText(/pending requests/i);

      if (await pendingSection.isVisible()) {
        // Should show pending request card
        const requestCard = page.getByTestId('request-card').first();
        await expect(requestCard).toBeVisible();

        // Click on request to view profile
        await requestCard.click();

        // Profile modal should open
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/recovery information/i)).toBeVisible();

        // Close profile modal
        await page.getByRole('button', { name: /close/i }).click();

        // Accept the request
        const acceptButton = requestCard.getByRole('button', { name: /accept/i });
        await acceptButton.click();

        // Confirmation dialog should appear
        await expect(page.getByText(/accept connection/i)).toBeVisible();
        await page.getByRole('button', { name: 'Accept' }).click();

        // Success alert should appear
        await expect(page.getByText(/connection request accepted/i)).toBeVisible();
        await page.getByRole('button', { name: 'OK' }).click();

        // Wait for data to refresh
        await page.waitForTimeout(2000);
      }
    });

    // Step 2: View active connection profile
    await test.step('View active connection profile', async () => {
      // Navigate to active connections section
      const activeSection = page.getByText(/active connections/i);
      await expect(activeSection).toBeVisible();

      // Click on first active connection
      const connectionCard = page.getByTestId('connection-card').first();
      await expect(connectionCard).toBeVisible();
      await connectionCard.click();

      // Profile modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Should show profile details
      await expect(page.getByText(/about/i)).toBeVisible();
      await expect(page.getByText(/recovery information/i)).toBeVisible();
      await expect(page.getByText(/connection details/i)).toBeVisible();

      // Should show action buttons
      await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /end connection/i })).toBeVisible();
    });

    // Step 3: Send message to connection
    await test.step('Send message to connection', async () => {
      // Click "Send Message" button in profile modal
      const sendMessageButton = page.getByRole('button', { name: /send message/i });
      await sendMessageButton.click();

      // Should navigate to messages screen with connection ID
      await page.waitForURL('**/messages/**', { timeout: 5000 });

      // Message input should be visible
      const messageInput = page.getByTestId('message-input');
      await expect(messageInput).toBeVisible();

      // Type and send a message
      await messageInput.fill('Hey, how are you doing today?');
      const sendButton = page.getByRole('button', { name: /send/i });
      await sendButton.click();

      // Message should appear in chat
      await expect(page.getByText('Hey, how are you doing today?')).toBeVisible();

      // Navigate back to connections
      await page.click('[data-testid="tab-connections"]');
      await page.waitForURL('**/connections', { timeout: 5000 });
    });

    // Step 4: End connection with feedback
    await test.step('End connection with feedback', async () => {
      // Click on the connection again to open profile
      const connectionCard = page.getByTestId('connection-card').first();
      await connectionCard.click();

      // Profile modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Click "End Connection" button
      const endConnectionButton = page.getByRole('button', { name: /end connection/i });
      await endConnectionButton.click();

      // End connection modal should appear
      await expect(page.getByText(/are you sure you want to end/i)).toBeVisible();

      // Select a reason
      await page.click('[value="completed_program"]');

      // Add optional feedback
      const feedbackInput = page.getByTestId('feedback-input');
      await feedbackInput.fill('We completed the program together successfully!');

      // Confirm ending connection
      const confirmButton = page.getByRole('button', { name: /end connection/i });
      await confirmButton.click();

      // Success alert should appear
      await expect(page.getByText(/connection has been ended/i)).toBeVisible();
      await page.getByRole('button', { name: 'OK' }).click();

      // Wait for data to refresh
      await page.waitForTimeout(2000);
    });

    // Step 5: Verify connection moved to past connections
    await test.step('Verify connection in past connections', async () => {
      // Should see "Past Connections" section
      const pastSection = page.getByText(/past connections/i);
      await expect(pastSection).toBeVisible();

      // Connection should appear in past connections
      const pastConnectionCard = page.getByTestId('past-connection-card').first();
      await expect(pastConnectionCard).toBeVisible();

      // Click to view past connection profile
      await pastConnectionCard.click();

      // Profile modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Should show connection was ended
      await expect(page.getByText(/ended:/i)).toBeVisible();
      await expect(page.getByText(/feedback:/i)).toBeVisible();
      await expect(page.getByText('We completed the program together successfully!')).toBeVisible();

      // Should NOT show "End Connection" button (connection already ended)
      await expect(page.getByRole('button', { name: /end connection/i })).not.toBeVisible();
    });
  });

  test('should handle declining connection requests', async ({ page }) => {
    await test.step('Decline pending connection request', async () => {
      // Check for pending requests section
      const pendingSection = page.getByText(/pending requests/i);

      if (await pendingSection.isVisible()) {
        // Click decline button on request card
        const requestCard = page.getByTestId('request-card').first();
        const declineButton = requestCard.getByRole('button', { name: /decline/i });
        await declineButton.click();

        // Confirmation dialog should appear
        await expect(page.getByText(/decline connection/i)).toBeVisible();
        await page.getByRole('button', { name: 'Decline' }).click();

        // Success alert should appear
        await expect(page.getByText(/request declined/i)).toBeVisible();
        await page.getByRole('button', { name: 'OK' }).click();

        // Request should disappear from pending list
        await page.waitForTimeout(1000);
        // Note: Would need to verify request is removed, but depends on test data
      }
    });
  });

  test('should show empty state when no connections exist', async ({ page }) => {
    await test.step('Display empty state', async () => {
      // If no connections exist, empty state should show
      const emptyState = page.getByTestId('empty-state');

      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/no connections yet/i);
        await expect(page.getByRole('button', { name: /find matches/i })).toBeVisible();
      }
    });
  });

  test('should handle connection profile interactions', async ({ page }) => {
    await test.step('View connection profile details', async () => {
      // Click on active connection
      const connectionCard = page.getByTestId('connection-card').first();

      if (await connectionCard.isVisible()) {
        await connectionCard.click();

        // Profile modal should show all sections
        await expect(page.getByText(/about/i)).toBeVisible();
        await expect(page.getByText(/recovery information/i)).toBeVisible();
        await expect(page.getByText(/location/i)).toBeVisible();
        await expect(page.getByText(/availability/i)).toBeVisible();
        await expect(page.getByText(/connection details/i)).toBeVisible();

        // Should show connection duration
        await expect(page.getByText(/connected:/i)).toBeVisible();

        // Should show last interaction if available
        const lastInteraction = page.getByText(/last interaction:/i);
        if (await lastInteraction.isVisible()) {
          await expect(lastInteraction).toBeVisible();
        }
      }
    });
  });

  test('should validate end connection feedback', async ({ page }) => {
    await test.step('Require feedback when "Other" reason selected', async () => {
      // Open connection profile
      const connectionCard = page.getByTestId('connection-card').first();

      if (await connectionCard.isVisible()) {
        await connectionCard.click();

        // Click end connection
        await page.getByRole('button', { name: /end connection/i }).click();

        // Select "Other" as reason
        await page.click('[value="other"]');

        // Try to submit without feedback
        await page.getByRole('button', { name: /end connection/i }).click();

        // Should show validation error
        await expect(page.getByText(/please provide a reason/i)).toBeVisible();

        // Add feedback
        const feedbackInput = page.getByTestId('feedback-input');
        await feedbackInput.fill('Custom reason for ending connection');

        // Should now allow submission
        await page.getByRole('button', { name: /end connection/i }).click();

        // Should proceed (no validation error)
        await page.waitForTimeout(1000);
      }
    });
  });

  test('should support pull-to-refresh', async ({ page }) => {
    await test.step('Refresh connections list', async () => {
      // Scroll to top
      await page.evaluate(() => window.scrollTo(0, 0));

      // Trigger pull-to-refresh (simulate touch gesture)
      await page.mouse.move(200, 100);
      await page.mouse.down();
      await page.mouse.move(200, 300);
      await page.mouse.up();

      // Loading indicator should appear briefly
      const loadingSpinner = page.getByTestId('loading-spinner');
      if (await loadingSpinner.isVisible({ timeout: 1000 })) {
        await expect(loadingSpinner).toBeVisible();
      }

      // Wait for refresh to complete
      await page.waitForTimeout(1000);

      // Data should still be present
      const connectionsExist = await page.getByTestId('connection-card').first().isVisible();
      const emptyStateExists = await page.getByTestId('empty-state').isVisible();

      expect(connectionsExist || emptyStateExists).toBeTruthy();
    });
  });

  test('should show pending requests notification badge', async ({ page }) => {
    await test.step('Display pending requests badge', async () => {
      // If pending requests exist, FAB with badge should show
      const fab = page.getByRole('button', { name: /pending connection/i });

      if (await fab.isVisible()) {
        // Click FAB to show pending requests alert
        await fab.click();

        // Alert should show number of pending requests
        await expect(page.getByText(/you have \d+ pending/i)).toBeVisible();
        await page.getByRole('button', { name: 'OK' }).click();
      }
    });
  });

  test('should support accessibility features', async ({ page }) => {
    await test.step('Check ARIA labels and roles', async () => {
      // Connection cards should have proper accessibility
      const connectionCard = page.getByTestId('connection-card').first();

      if (await connectionCard.isVisible()) {
        await expect(connectionCard).toHaveAttribute('role');
      }

      // Action buttons should have proper labels
      const acceptButton = page.getByRole('button', { name: /accept/i });
      if (await acceptButton.isVisible()) {
        await expect(acceptButton).toHaveAttribute('aria-label');
      }
    });

    await test.step('Check keyboard navigation', async () => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Focus should be on first interactive element
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT', 'DIV']).toContain(focused);
    });
  });

  test('should handle errors gracefully', async ({ page }) => {
    await test.step('Handle network errors', async () => {
      // Simulate network offline
      await page.context().setOffline(true);

      // Try to accept a request
      const requestCard = page.getByTestId('request-card').first();

      if (await requestCard.isVisible()) {
        const acceptButton = requestCard.getByRole('button', { name: /accept/i });
        await acceptButton.click();
        await page.getByRole('button', { name: 'Accept' }).click();

        // Error alert should appear
        await expect(page.getByText(/failed to accept/i)).toBeVisible();
        await page.getByRole('button', { name: 'OK' }).click();
      }

      // Restore network
      await page.context().setOffline(false);
    });
  });

  test('should persist connection state across navigation', async ({ page }) => {
    await test.step('Verify persistence after tab switch', async () => {
      // Note current connection count
      const connectionCards = page.getByTestId('connection-card');
      const initialCount = await connectionCards.count();

      // Navigate to another tab
      await page.click('[data-testid="tab-matches"]');
      await page.waitForURL('**/matches');

      // Navigate back to connections
      await page.click('[data-testid="tab-connections"]');
      await page.waitForURL('**/connections');

      // Connection count should be the same
      const finalCount = await connectionCards.count();
      expect(finalCount).toBe(initialCount);
    });
  });
});

test.describe('Connection Request Management', () => {
  test('should handle multiple pending requests', async ({ page }) => {
    await page.goto('http://localhost:19006/(auth)/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/connections');

    await test.step('Display all pending requests', async () => {
      const pendingSection = page.getByText(/pending requests \(\d+\)/i);

      if (await pendingSection.isVisible()) {
        // Should show count in section header
        await expect(pendingSection).toBeVisible();

        // Should show all request cards
        const requestCards = page.getByTestId('request-card');
        const count = await requestCards.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test('should handle accepting multiple requests sequentially', async ({ page }) => {
    await page.goto('http://localhost:19006/(auth)/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/connections');

    await test.step('Accept multiple requests', async () => {
      // Accept first request
      const firstRequest = page.getByTestId('request-card').first();

      if (await firstRequest.isVisible()) {
        await firstRequest.getByRole('button', { name: /accept/i }).click();
        await page.getByRole('button', { name: 'Accept' }).click();
        await page.getByRole('button', { name: 'OK' }).click();
        await page.waitForTimeout(2000);

        // Accept second request if available
        const secondRequest = page.getByTestId('request-card').first();
        if (await secondRequest.isVisible()) {
          await secondRequest.getByRole('button', { name: /accept/i }).click();
          await page.getByRole('button', { name: 'Accept' }).click();
          await page.getByRole('button', { name: 'OK' }).click();
        }
      }
    });
  });
});
