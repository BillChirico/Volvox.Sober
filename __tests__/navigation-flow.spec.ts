/**
 * Navigation Flow E2E Test
 * Tests bottom tab navigation, notification badges, and state persistence
 * Feature: 002-app-screens (T146)
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'sponsor@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);
  });

  test('T146.1: Navigate between all tabs', async ({ page }) => {
    // Start on Sobriety tab (default after login)
    await expect(page).toHaveURL(/.*\/sobriety/);
    await expect(page.locator('[data-testid="sobriety-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-sobriety"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);
    await expect(page.locator('[data-testid="matches-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-matches"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Navigate to Connections tab
    await page.click('[data-testid="tab-connections"]');
    await page.waitForURL(/.*\/connections/);
    await expect(page.locator('[data-testid="connections-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-connections"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Navigate to Messages tab
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);
    await expect(page.locator('[data-testid="messages-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-messages"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Navigate to Profile tab
    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-profile"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Navigate back to Sobriety tab
    await page.click('[data-testid="tab-sobriety"]');
    await page.waitForURL(/.*\/sobriety/);
    await expect(page.locator('[data-testid="sobriety-screen"]')).toBeVisible();
  });

  test('T146.2: Tab navigation performance (<1 second)', async ({ page }) => {
    const navigationTimes: number[] = [];

    // Test navigation speed for all tabs
    const tabs = ['matches', 'connections', 'messages', 'profile', 'sobriety'];

    for (const tab of tabs) {
      const startTime = Date.now();

      await page.click(`[data-testid="tab-${tab}"]`);
      await page.waitForURL(new RegExp(`.*/${tab}`));
      await expect(page.locator(`[data-testid="${tab}-screen"]`)).toBeVisible();

      const endTime = Date.now();
      const duration = endTime - startTime;

      navigationTimes.push(duration);
      console.log(`Navigation to ${tab}: ${duration}ms`);
    }

    // Verify all navigations completed in under 1000ms
    for (const time of navigationTimes) {
      expect(time).toBeLessThan(1000);
    }

    // Verify average navigation time
    const avgTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    console.log(`Average navigation time: ${avgTime}ms`);
    expect(avgTime).toBeLessThan(800);
  });

  test('T146.3: Active tab highlighting', async ({ page }) => {
    // Verify Sobriety tab is highlighted
    await expect(page.locator('[data-testid="tab-sobriety"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('[data-testid="tab-sobriety"]')).toHaveClass(/active/);

    // Other tabs should not be highlighted
    await expect(page.locator('[data-testid="tab-matches"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(page.locator('[data-testid="tab-connections"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(page.locator('[data-testid="tab-messages"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(page.locator('[data-testid="tab-profile"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );

    // Navigate to Messages
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Verify Messages tab is now highlighted
    await expect(page.locator('[data-testid="tab-messages"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('[data-testid="tab-messages"]')).toHaveClass(/active/);

    // Sobriety tab should no longer be highlighted
    await expect(page.locator('[data-testid="tab-sobriety"]')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  test('T146.4: Notification badge for pending connections', async ({ page }) => {
    // Navigate to Connections tab
    await page.click('[data-testid="tab-connections"]');
    await page.waitForURL(/.*\/connections/);

    // Check if there are pending requests
    const pendingCount = await page.locator('[data-testid="pending-request-card"]').count();

    if (pendingCount > 0) {
      // Navigate away from Connections
      await page.click('[data-testid="tab-sobriety"]');
      await page.waitForURL(/.*\/sobriety/);

      // Verify Connections tab has notification badge
      const connectionsBadge = page.locator('[data-testid="tab-connections-badge"]');
      await expect(connectionsBadge).toBeVisible();

      // Verify badge shows correct count
      const badgeText = await connectionsBadge.textContent();
      expect(parseInt(badgeText || '0')).toBe(pendingCount);

      // Navigate back to Connections
      await page.click('[data-testid="tab-connections"]');
      await page.waitForURL(/.*\/connections/);

      // Badge should remain visible (until requests are handled)
      await expect(connectionsBadge).toBeVisible();
    }
  });

  test('T146.5: Notification badge for unread messages', async ({ page }) => {
    // Navigate to Messages tab
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Check if there are unread messages
    const unreadCount = await page.locator('[data-testid="unread-badge"]').count();

    if (unreadCount > 0) {
      // Navigate away from Messages
      await page.click('[data-testid="tab-sobriety"]');
      await page.waitForURL(/.*\/sobriety/);

      // Verify Messages tab has notification badge
      const messagesBadge = page.locator('[data-testid="tab-messages-badge"]');
      await expect(messagesBadge).toBeVisible();

      // Badge should show unread count
      const badgeText = await messagesBadge.textContent();
      expect(parseInt(badgeText || '0')).toBeGreaterThan(0);

      // Navigate back to Messages
      await page.click('[data-testid="tab-messages"]');
      await page.waitForURL(/.*\/messages/);

      // Open an unread conversation
      await page.click('[data-testid="conversation-item-0"]');

      // Wait for messages to load and mark as read
      await page.waitForTimeout(1000);

      // Navigate back and check if badge updated
      await page.click('[data-testid="back-button"]');
      await page.click('[data-testid="tab-sobriety"]');

      // Badge count should decrease or disappear
      const updatedBadgeText = await messagesBadge.textContent().catch(() => '0');
      expect(parseInt(updatedBadgeText || '0')).toBeLessThan(parseInt(badgeText || '0'));
    }
  });

  test('T146.6: Tab state persistence when navigating', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Apply a filter
    await page.click('[data-testid="filter-button"]');
    await page.click('[data-testid="filter-program-select"]');
    await page.click('[data-testid="program-filter-AA"]');
    await page.click('[data-testid="apply-filters-button"]');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Navigate to another tab
    await page.click('[data-testid="tab-sobriety"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate back to Matches
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Verify filter is still applied
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="filter-program-select"]')).toContainText('AA');
  });

  test('T146.7: Deep navigation state preservation', async ({ page }) => {
    // Navigate to Messages
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Open a conversation
    await page.click('[data-testid="conversation-item-0"]');
    await page.waitForURL(/.*\/messages\/.*/);

    // Scroll to a position in the conversation
    await page.evaluate(() => {
      const messageList = document.querySelector('[data-testid="message-list"]');
      if (messageList) {
        messageList.scrollTop = 200;
      }
    });

    // Navigate to another tab
    await page.click('[data-testid="tab-sobriety"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate back to Messages
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Should return to conversation list, not the deep conversation view
    await expect(page).toHaveURL(/.*\/messages$/);
    await expect(page.locator('[data-testid="conversations-list"]')).toBeVisible();
  });

  test('T146.8: Tab accessibility - keyboard navigation', async ({ page }) => {
    // Focus on first tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs to reach navigation

    // Navigate to Matches using arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForURL(/.*\/matches/);
    await expect(page.locator('[data-testid="matches-screen"]')).toBeVisible();

    // Navigate to Connections
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForURL(/.*\/connections/);
    await expect(page.locator('[data-testid="connections-screen"]')).toBeVisible();

    // Navigate back using ArrowLeft
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');
    await page.waitForURL(/.*\/matches/);
    await expect(page.locator('[data-testid="matches-screen"]')).toBeVisible();
  });

  test('T146.9: Tab icons have proper accessibility labels', async ({ page }) => {
    // Verify each tab has aria-label
    const sobrietyTab = page.locator('[data-testid="tab-sobriety"]');
    await expect(sobrietyTab).toHaveAttribute('aria-label', /Sobriety/);

    const matchesTab = page.locator('[data-testid="tab-matches"]');
    await expect(matchesTab).toHaveAttribute('aria-label', /Matches/);

    const connectionsTab = page.locator('[data-testid="tab-connections"]');
    await expect(connectionsTab).toHaveAttribute('aria-label', /Connections/);

    const messagesTab = page.locator('[data-testid="tab-messages"]');
    await expect(messagesTab).toHaveAttribute('aria-label', /Messages/);

    const profileTab = page.locator('[data-testid="tab-profile"]');
    await expect(profileTab).toHaveAttribute('aria-label', /Profile/);

    // Verify tabs have role="tab"
    await expect(sobrietyTab).toHaveAttribute('role', 'tab');
    await expect(matchesTab).toHaveAttribute('role', 'tab');
    await expect(connectionsTab).toHaveAttribute('role', 'tab');
    await expect(messagesTab).toHaveAttribute('role', 'tab');
    await expect(profileTab).toHaveAttribute('role', 'tab');
  });

  test('T146.10: Tab touch targets are 44x44 points minimum', async ({ page }) => {
    // Get dimensions of each tab button
    const tabs = ['tab-sobriety', 'tab-matches', 'tab-connections', 'tab-messages', 'tab-profile'];

    for (const tab of tabs) {
      const tabElement = page.locator(`[data-testid="${tab}"]`);
      const box = await tabElement.boundingBox();

      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('T146.11: Tab bar persists across all main screens', async ({ page }) => {
    const tabs = ['sobriety', 'matches', 'connections', 'messages', 'profile'];

    for (const tab of tabs) {
      await page.click(`[data-testid="tab-${tab}"]`);
      await page.waitForURL(new RegExp(`.*/${tab}`));

      // Verify tab bar is visible
      await expect(page.locator('[data-testid="tab-bar"]')).toBeVisible();

      // Verify all 5 tabs are present
      await expect(page.locator('[data-testid="tab-sobriety"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-matches"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-connections"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-messages"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-profile"]')).toBeVisible();
    }
  });

  test('T146.12: Navigation state persists after app reload', async ({ page }) => {
    // Navigate to Messages tab
    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Reload page
    await page.reload();

    // Should stay on Messages tab
    await page.waitForURL(/.*\/messages/);
    await expect(page.locator('[data-testid="messages-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-messages"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('T146.13: Tab bar hidden in auth and onboarding flows', async ({ page }) => {
    // Logout
    await page.click('[data-testid="tab-profile"]');
    await page.click('[data-testid="profile-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL(/.*\/login/);

    // Verify tab bar is not visible on login screen
    await expect(page.locator('[data-testid="tab-bar"]')).not.toBeVisible();

    // Go to signup
    await page.click('[data-testid="signup-link"]');
    await page.waitForURL(/.*\/signup/);

    // Verify tab bar is not visible on signup screen
    await expect(page.locator('[data-testid="tab-bar"]')).not.toBeVisible();
  });

  test('T146.14: Notification badge updates in real-time', async ({ page, context }) => {
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

    // Sponsor sends message to sponsee
    await sponsorPage.click('[data-testid="tab-messages"]');
    await sponsorPage.click('[data-testid="conversation-item-0"]');
    await sponsorPage.fill('[data-testid="message-input"]', 'Real-time badge test');
    await sponsorPage.click('[data-testid="send-button"]');

    // Verify sponsee sees Messages badge appear
    const messagesBadge = sponseePage.locator('[data-testid="tab-messages-badge"]');
    await expect(messagesBadge).toBeVisible({ timeout: 2000 });

    await sponsorPage.close();
  });
});
