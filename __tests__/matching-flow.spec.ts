/**
 * Matching Flow E2E Test
 * Tests match discovery, filtering, profile viewing, and connection requests
 * Feature: 002-app-screens (T143)
 */

import { test, expect } from '@playwright/test';

test.describe('Matching Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login as sponsee
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'sponsee@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);
  });

  test('T143.1: View suggested matches', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Verify matches screen loads
    await expect(page.locator('[data-testid="matches-screen"]')).toBeVisible();

    // Verify match cards are displayed
    const matchCards = page.locator('[data-testid^="match-card-"]');
    await expect(matchCards.first()).toBeVisible();

    // Verify each match card has required information
    const firstCard = matchCards.first();
    await expect(firstCard.locator('[data-testid="match-name"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="match-location"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="match-program"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="compatibility-badge"]')).toBeVisible();

    // Verify compatibility score is displayed
    const compatibilityBadge = firstCard.locator('[data-testid="compatibility-badge"]');
    const scoreText = await compatibilityBadge.textContent();
    expect(scoreText).toMatch(/\d+%/); // Should contain percentage like "85%"
  });

  test('T143.2: Filter matches by recovery program', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Open filter bar
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible();

    // Get initial match count
    const initialMatches = await page.locator('[data-testid^="match-card-"]').count();

    // Filter by AA program
    await page.click('[data-testid="filter-program-select"]');
    await page.click('[data-testid="program-filter-AA"]');
    await page.click('[data-testid="apply-filters-button"]');

    // Wait for matches to filter
    await page.waitForTimeout(500);

    // Verify all visible matches show AA program
    const matchCards = page.locator('[data-testid^="match-card-"]');
    const count = await matchCards.count();

    for (let i = 0; i < count; i++) {
      const programText = await matchCards
        .nth(i)
        .locator('[data-testid="match-program"]')
        .textContent();
      expect(programText).toContain('AA');
    }

    // Clear filters
    await page.click('[data-testid="filter-button"]');
    await page.click('[data-testid="clear-filters-button"]');

    // Verify matches reset
    await page.waitForTimeout(500);
    const resetCount = await page.locator('[data-testid^="match-card-"]').count();
    expect(resetCount).toBeGreaterThanOrEqual(initialMatches);
  });

  test('T143.3: Filter matches by availability', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Open filter bar
    await page.click('[data-testid="filter-button"]');

    // Filter by "Evenings" availability
    await page.click('[data-testid="filter-availability-select"]');
    await page.click('[data-testid="availability-filter-evenings"]');
    await page.click('[data-testid="apply-filters-button"]');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered matches show evenings availability
    const matchCards = page.locator('[data-testid^="match-card-"]');
    const count = await matchCards.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const availText = await matchCards
          .nth(i)
          .locator('[data-testid="match-availability"]')
          .textContent();
        expect(availText).toContain('Evenings');
      }
    } else {
      // Verify empty state message
      await expect(page.locator('[data-testid="no-matches-message"]')).toBeVisible();
    }
  });

  test('T143.4: View match profile details', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Click on first match card
    await page.click('[data-testid="match-card-0"]');

    // Verify profile detail view opens
    await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

    // Verify detailed information is displayed
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-recovery-program"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-years-sober"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-sponsor-experience"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-availability"]')).toBeVisible();

    // Verify compatibility details
    await expect(page.locator('[data-testid="compatibility-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="program-match"]')).toBeVisible();
    await expect(page.locator('[data-testid="location-match"]')).toBeVisible();
    await expect(page.locator('[data-testid="availability-match"]')).toBeVisible();

    // Verify action buttons
    await expect(page.locator('[data-testid="send-request-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="decline-match-button"]')).toBeVisible();

    // Close profile detail
    await page.click('[data-testid="close-profile-button"]');
    await expect(page.locator('[data-testid="matches-screen"]')).toBeVisible();
  });

  test('T143.5: Send connection request from match profile', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Open first match profile
    await page.click('[data-testid="match-card-0"]');
    await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

    // Send connection request
    await page.click('[data-testid="send-request-button"]');

    // Verify confirmation dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-message"]')).toContainText(
      'Send connection request',
    );

    // Confirm request
    await page.click('[data-testid="confirm-yes-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      'Connection request sent',
    );

    // Verify button changes to "Request Sent"
    await expect(page.locator('[data-testid="send-request-button"]')).toContainText('Request Sent');
    await expect(page.locator('[data-testid="send-request-button"]')).toBeDisabled();

    // Close profile and verify match card updated
    await page.click('[data-testid="close-profile-button"]');

    // Verify match card shows "Request Sent" badge
    await expect(
      page.locator('[data-testid="match-card-0"]').locator('[data-testid="request-sent-badge"]'),
    ).toBeVisible();
  });

  test('T143.6: Decline match with cooldown', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Get initial match count
    const initialCount = await page.locator('[data-testid^="match-card-"]').count();

    // Open last match profile
    await page.click(`[data-testid="match-card-${initialCount - 1}"]`);
    await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

    // Decline match
    await page.click('[data-testid="decline-match-button"]');

    // Verify confirmation dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-message"]')).toContainText(
      'declined match will not appear again for 30 days',
    );

    // Confirm decline
    await page.click('[data-testid="confirm-yes-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Match declined');

    // Verify profile detail closes
    await expect(page.locator('[data-testid="matches-screen"]')).toBeVisible();

    // Verify match count decreased
    const newCount = await page.locator('[data-testid^="match-card-"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('T143.7: Connection request rate limiting (5 per day)', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Send 5 connection requests
    for (let i = 0; i < 5; i++) {
      await page.click(`[data-testid="match-card-${i}"]`);
      await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

      const sendButton = page.locator('[data-testid="send-request-button"]');
      if (await sendButton.isEnabled()) {
        await sendButton.click();
        await page.click('[data-testid="confirm-yes-button"]');
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      }

      await page.click('[data-testid="close-profile-button"]');
      await page.waitForTimeout(500);
    }

    // Try to send 6th request
    await page.click('[data-testid="match-card-5"]');
    await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

    // Verify rate limit message
    await expect(page.locator('[data-testid="rate-limit-message"]')).toContainText(
      'You have reached the daily limit of 5 connection requests',
    );

    // Verify send request button is disabled
    await expect(page.locator('[data-testid="send-request-button"]')).toBeDisabled();
  });

  test('T143.8: Empty state when no matches available', async ({ page }) => {
    // Login as user with no matches (need specific test account)
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'nomatches@test.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*\/sobriety/);

    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Verify empty state is displayed
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state-title"]')).toContainText(
      'No matches found',
    );

    // Verify profile completion tips
    await expect(page.locator('[data-testid="profile-completion-tip"]')).toBeVisible();
    await expect(page.locator('[data-testid="tip-message"]')).toContainText(
      'Complete your profile to improve match quality',
    );

    // Verify link to profile
    await expect(page.locator('[data-testid="complete-profile-link"]')).toBeVisible();
  });

  test('T143.9: Match compatibility score calculation', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Open first match
    await page.click('[data-testid="match-card-0"]');
    await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

    // Verify compatibility breakdown exists
    await expect(page.locator('[data-testid="compatibility-breakdown"]')).toBeVisible();

    // Verify individual factor scores
    const programMatch = page.locator('[data-testid="program-match-score"]');
    const locationMatch = page.locator('[data-testid="location-match-score"]');
    const availMatch = page.locator('[data-testid="availability-match-score"]');

    await expect(programMatch).toBeVisible();
    await expect(locationMatch).toBeVisible();
    await expect(availMatch).toBeVisible();

    // Verify scores are percentages
    const programScore = await programMatch.textContent();
    const locationScore = await locationMatch.textContent();
    const availScore = await availMatch.textContent();

    expect(programScore).toMatch(/\d+%/);
    expect(locationScore).toMatch(/\d+%/);
    expect(availScore).toMatch(/\d+%/);

    // Verify overall score matches badge
    const overallScore = await page
      .locator('[data-testid="overall-compatibility-score"]')
      .textContent();
    const badgeScore = await page.locator('[data-testid="compatibility-badge"]').textContent();

    expect(overallScore).toBe(badgeScore);
  });

  test('T143.10: Refresh matches to get updated suggestions', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Pull to refresh
    await page.locator('[data-testid="matches-list"]').evaluate(el => {
      el.dispatchEvent(new Event('refresh', { bubbles: true }));
    });

    // Wait for refresh to complete
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="refresh-indicator"]')).not.toBeVisible({
      timeout: 5000,
    });

    // Verify matches refreshed
    const matchCount = await page.locator('[data-testid^="match-card-"]').count();
    expect(matchCount).toBeGreaterThan(0);
  });

  test('T143.11: Match sorting by compatibility score', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Get compatibility scores from all match cards
    const matchCards = page.locator('[data-testid^="match-card-"]');
    const count = await matchCards.count();

    const scores: number[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const badgeText = await matchCards
        .nth(i)
        .locator('[data-testid="compatibility-badge"]')
        .textContent();
      const score = parseInt(badgeText?.replace('%', '') || '0');
      scores.push(score);
    }

    // Verify scores are in descending order (highest compatibility first)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  test('T143.12: Match profile photo display', async ({ page }) => {
    // Navigate to Matches tab
    await page.click('[data-testid="tab-matches"]');
    await page.waitForURL(/.*\/matches/);

    // Open first match
    await page.click('[data-testid="match-card-0"]');
    await expect(page.locator('[data-testid="match-profile-detail"]')).toBeVisible();

    // Verify profile photo or avatar is displayed
    const profilePhoto = page.locator('[data-testid="profile-photo"]');
    await expect(profilePhoto).toBeVisible();

    // Verify photo has alt text for accessibility
    const altText = await profilePhoto.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText).not.toBe('');
  });
});
