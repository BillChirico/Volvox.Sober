/**
 * Messaging Flow E2E Test
 * Tests complete messaging functionality including real-time delivery and offline queue
 * Feature: 002-app-screens (T115)
 */

import { test, expect } from '@playwright/test';

test.describe('Messaging Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:8081');
  });

  test('T115.1: Send message to active connection', async ({ page }) => {
    // Login as sponsee
    await page.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to complete
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to Messages tab
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Select first conversation
    await page.click('[data-testid="conversation-item-0"]');
    await page.waitForURL(/.*\/messages\/.*/);

    // Type message
    const messageText = `Test message at ${new Date().toISOString()}`;
    await page.fill('[data-testid="message-input"]', messageText);

    // Send message
    await page.click('[data-testid="send-button"]');

    // Verify optimistic update - message appears immediately
    await expect(page.locator('[data-testid="message-bubble"]').last()).toContainText(messageText);

    // Verify message status changes from 'sending' to 'sent'
    await expect(page.locator('[data-testid="message-status"]').last()).toContainText('sent', {
      timeout: 5000,
    });

    // Verify conversation preview updated with last message
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="conversation-item-0"]')).toContainText(
      messageText.substring(0, 50),
    );
  });

  test('T115.2: Receive message via Realtime subscription', async ({ page, context }) => {
    // Open two pages - sponsor and sponsee
    const sponsorPage = await context.newPage();
    const sponseePage = page;

    // Login as sponsor
    await sponsorPage.goto('http://localhost:8081');
    await sponsorPage.fill('[data-testid="email-input"]', 'sponsor@test.com');
    await sponsorPage.fill('[data-testid="password-input"]', 'Password123!');
    await sponsorPage.click('[data-testid="login-button"]');
    await sponsorPage.waitForURL(/.*\/sobriety/);

    // Login as sponsee
    await sponseePage.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await sponseePage.fill('[data-testid="password-input"]', 'Password123!');
    await sponseePage.click('[data-testid="login-button"]');
    await sponseePage.waitForURL(/.*\/sobriety/);

    // Both navigate to same conversation
    await sponsorPage.click('[data-testid="tab-messages"]');
    await sponsorPage.click('[data-testid="conversation-item-0"]');

    await sponseePage.click('[data-testid="tab-messages"]');
    await sponseePage.click('[data-testid="conversation-item-0"]');

    // Sponsor sends message
    const messageText = `Reply from sponsor at ${new Date().toISOString()}`;
    await sponsorPage.fill('[data-testid="message-input"]', messageText);
    await sponsorPage.click('[data-testid="send-button"]');

    // Verify sponsee receives message in real-time (< 500ms)
    await expect(sponseePage.locator('[data-testid="message-bubble"]').last()).toContainText(
      messageText,
      { timeout: 1000 },
    );

    // Verify unread badge appears on Messages tab
    await sponseePage.click('[data-testid="back-button"]');
    await sponseePage.click('[data-testid="tab-sobriety"]');
    await expect(sponseePage.locator('[data-testid="tab-messages-badge"]')).toBeVisible();

    await sponsorPage.close();
  });

  test('T115.3: Send message while offline (queue functionality)', async ({ page, context }) => {
    // Login
    await page.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to message thread
    await page.click('[data-testid="tab-messages"]');
    await page.click('[data-testid="conversation-item-0"]');

    // Simulate offline mode
    await context.setOffline(true);

    // Try to send message
    const offlineMessage = `Offline message at ${new Date().toISOString()}`;
    await page.fill('[data-testid="message-input"]', offlineMessage);
    await page.click('[data-testid="send-button"]');

    // Verify message appears with 'queued' status
    await expect(page.locator('[data-testid="message-bubble"]').last()).toContainText(
      offlineMessage,
    );
    await expect(page.locator('[data-testid="message-status"]').last()).toContainText('queued');

    // Verify queue indicator shows 1 queued message
    await expect(page.locator('[data-testid="queued-messages-count"]')).toContainText('1');

    // Reconnect to network
    await context.setOffline(false);

    // Verify automatic sync triggers
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible({ timeout: 2000 });

    // Verify message status changes to 'sent'
    await expect(page.locator('[data-testid="message-status"]').last()).toContainText('sent', {
      timeout: 5000,
    });

    // Verify queue indicator disappears
    await expect(page.locator('[data-testid="queued-messages-count"]')).not.toBeVisible();
  });

  test('T115.4: Message retry logic on failure', async ({ page, context }) => {
    // Login
    await page.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to message thread
    await page.click('[data-testid="tab-messages"]');
    await page.click('[data-testid="conversation-item-0"]');

    // Simulate offline mode
    await context.setOffline(true);

    // Send 3 messages while offline
    for (let i = 1; i <= 3; i++) {
      await page.fill('[data-testid="message-input"]', `Queued message ${i}`);
      await page.click('[data-testid="send-button"]');
      await page.waitForTimeout(500);
    }

    // Verify all 3 messages are queued
    await expect(page.locator('[data-testid="queued-messages-count"]')).toContainText('3');

    // Reconnect
    await context.setOffline(false);

    // Verify all messages sync successfully
    await expect(
      page.locator('[data-testid="message-bubble"]').filter({ hasText: 'Queued message 1' }),
    ).toHaveAttribute('data-status', 'sent', { timeout: 10000 });

    await expect(
      page.locator('[data-testid="message-bubble"]').filter({ hasText: 'Queued message 2' }),
    ).toHaveAttribute('data-status', 'sent');

    await expect(
      page.locator('[data-testid="message-bubble"]').filter({ hasText: 'Queued message 3' }),
    ).toHaveAttribute('data-status', 'sent');

    // Verify queue is empty
    await expect(page.locator('[data-testid="queued-messages-count"]')).not.toBeVisible();
  });

  test('T115.5: Read receipt tracking', async ({ page, context }) => {
    // Open two pages - sponsor and sponsee
    const sponsorPage = await context.newPage();
    const sponseePage = page;

    // Login as sponsor
    await sponsorPage.goto('http://localhost:8081');
    await sponsorPage.fill('[data-testid="email-input"]', 'sponsor@test.com');
    await sponsorPage.fill('[data-testid="password-input"]', 'Password123!');
    await sponsorPage.click('[data-testid="login-button"]');
    await sponsorPage.waitForURL(/.*\/sobriety/);

    // Login as sponsee
    await sponseePage.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await sponseePage.fill('[data-testid="password-input"]', 'Password123!');
    await sponseePage.click('[data-testid="login-button"]');
    await sponseePage.waitForURL(/.*\/sobriety/);

    // Sponsor navigates to conversation
    await sponsorPage.click('[data-testid="tab-messages"]');
    await sponsorPage.click('[data-testid="conversation-item-0"]');

    // Sponsor sends message
    const messageText = `Read receipt test at ${new Date().toISOString()}`;
    await sponsorPage.fill('[data-testid="message-input"]', messageText);
    await sponsorPage.click('[data-testid="send-button"]');

    // Verify message shows 'sent' status
    await expect(sponsorPage.locator('[data-testid="message-status"]').last()).toContainText(
      'sent',
      { timeout: 5000 },
    );

    // Sponsee opens conversation and reads message
    await sponseePage.click('[data-testid="tab-messages"]');
    await sponseePage.click('[data-testid="conversation-item-0"]');
    await sponseePage.waitForURL(/.*\/messages\/.*/);

    // Verify message is visible to sponsee
    await expect(sponseePage.locator('[data-testid="message-bubble"]').last()).toContainText(
      messageText,
    );

    // Verify sponsor sees 'read' status update
    await expect(sponsorPage.locator('[data-testid="message-status"]').last()).toContainText(
      'read',
      { timeout: 2000 },
    );

    await sponsorPage.close();
  });

  test('T115.6: Message pagination (load more)', async ({ page }) => {
    // Login
    await page.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to conversation with many messages
    await page.click('[data-testid="tab-messages"]');
    await page.click('[data-testid="conversation-item-0"]');

    // Get initial message count
    const initialCount = await page.locator('[data-testid="message-bubble"]').count();

    // Scroll to top to trigger load more
    await page.evaluate(() => {
      const messageList = document.querySelector('[data-testid="message-list"]');
      if (messageList) {
        messageList.scrollTop = 0;
      }
    });

    // Wait for loading indicator
    await expect(page.locator('[data-testid="loading-more-indicator"]')).toBeVisible();

    // Verify more messages loaded
    await expect(async () => {
      const newCount = await page.locator('[data-testid="message-bubble"]').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 5000 });
  });

  test('T115.7: Message validation (max length)', async ({ page }) => {
    // Login
    await page.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to message thread
    await page.click('[data-testid="tab-messages"]');
    await page.click('[data-testid="conversation-item-0"]');

    // Try to send empty message
    await page.fill('[data-testid="message-input"]', '');
    await expect(page.locator('[data-testid="send-button"]')).toBeDisabled();

    // Try to send message exceeding max length (5000 chars)
    const longMessage = 'a'.repeat(5001);
    await page.fill('[data-testid="message-input"]', longMessage);
    await page.click('[data-testid="send-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Message cannot exceed 5000 characters',
    );

    // Send valid message
    await page.fill('[data-testid="message-input"]', 'Valid message');
    await page.click('[data-testid="send-button"]');

    // Verify message sent successfully
    await expect(page.locator('[data-testid="message-bubble"]').last()).toContainText(
      'Valid message',
    );
  });
});
