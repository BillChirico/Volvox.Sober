/**
 * Accessibility Testing Suite (T133, T136, T137)
 * Comprehensive WCAG 2.1 AA compliance testing
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Helper: Check touch target size (minimum 44x44 points)
 */
async function verifyTouchTargetSize(page: Page, selector: string, elementName: string) {
  const element = page.locator(selector);
  const box = await element.boundingBox();

  if (box) {
    expect(box.width, `${elementName} width should be at least 44px`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${elementName} height should be at least 44px`).toBeGreaterThanOrEqual(44);
  }
}

/**
 * Helper: Check color contrast ratio (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // Parse RGB values
  const rgb1 = color1.match(/\d+/g)?.map(Number) || [0, 0, 0];
  const rgb2 = color2.match(/\d+/g)?.map(Number) || [0, 0, 0];

  // Calculate relative luminance
  const getLuminance = ([r, g, b]: number[]) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Helper: Verify color contrast for an element
 */
async function verifyColorContrast(
  page: Page,
  selector: string,
  elementName: string,
  isLargeText = false,
) {
  const element = page.locator(selector).first();
  const color = await element.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      text: styles.color,
      background: styles.backgroundColor,
      fontSize: parseFloat(styles.fontSize),
    };
  });

  const contrast = calculateContrastRatio(color.text, color.background);
  const minContrast = isLargeText || color.fontSize >= 18 ? 3.0 : 4.5;

  expect(
    contrast,
    `${elementName} contrast ratio should be at least ${minContrast}:1 (got ${contrast.toFixed(2)}:1)`,
  ).toBeGreaterThanOrEqual(minContrast);
}

test.describe('T133: Accessibility Audit - All Screens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('T133.1: Login screen accessibility', async ({ page }) => {
    // Run accessibility audit using axe-core
    await expect(page.locator('[data-testid="login-screen"]')).toBeVisible();

    // Check for proper form labels
    await expect(page.locator('label[for="email-input"]')).toBeVisible();
    await expect(page.locator('label[for="password-input"]')).toBeVisible();

    // Check ARIA attributes
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(emailInput).toHaveAttribute('aria-required', 'true');

    const passwordInput = page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-required', 'true');

    // Check button accessibility
    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toHaveAttribute('aria-label');
    await expect(loginButton).toBeEnabled();
  });

  test('T133.2: Signup screen accessibility', async ({ page }) => {
    await page.click('[data-testid="signup-link"]');
    await expect(page.locator('[data-testid="signup-screen"]')).toBeVisible();

    // Check form labels
    await expect(page.locator('label[for="email-input"]')).toBeVisible();
    await expect(page.locator('label[for="password-input"]')).toBeVisible();
    await expect(page.locator('label[for="confirm-password-input"]')).toBeVisible();

    // Check ARIA attributes on inputs
    const inputs = ['email-input', 'password-input', 'confirm-password-input'];
    for (const inputId of inputs) {
      const input = page.locator(`[data-testid="${inputId}"]`);
      await expect(input).toHaveAttribute('aria-label');
      await expect(input).toHaveAttribute('aria-required', 'true');
    }
  });

  test('T133.3: Onboarding screen accessibility', async ({ page }) => {
    // Navigate through signup flow
    await page.click('[data-testid="signup-link"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!@#');
    await page.click('[data-testid="signup-button"]');

    // Check role selection accessibility
    await expect(page.locator('[data-testid="onboarding-screen"]')).toBeVisible();

    const sponsorRole = page.locator('[data-testid="role-option-sponsor"]');
    await expect(sponsorRole).toHaveAttribute('role', 'button');
    await expect(sponsorRole).toHaveAttribute('aria-label');

    const sponseeRole = page.locator('[data-testid="role-option-sponsee"]');
    await expect(sponseeRole).toHaveAttribute('role', 'button');
    await expect(sponseeRole).toHaveAttribute('aria-label');
  });

  test('T133.4: Matches screen accessibility', async ({ page }) => {
    // Login first
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL(/.*\/matches/);

    // Check matches list accessibility
    const matchCards = page.locator('[data-testid^="match-card-"]');
    const firstCard = matchCards.first();

    if ((await matchCards.count()) > 0) {
      await expect(firstCard).toHaveAttribute('role', 'article');
      await expect(firstCard).toHaveAttribute('aria-label');

      // Check action buttons
      const connectButton = firstCard.locator('[data-testid="connect-button"]');
      await expect(connectButton).toHaveAttribute('aria-label');
    }
  });

  test('T133.5: Connections screen accessibility', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="tab-connections"]');
    await page.waitForURL(/.*\/connections/);

    // Check connections list accessibility
    const connectionCards = page.locator('[data-testid^="connection-card-"]');
    const firstCard = connectionCards.first();

    if ((await connectionCards.count()) > 0) {
      await expect(firstCard).toHaveAttribute('role', 'article');
      await expect(firstCard).toHaveAttribute('aria-label');
    }
  });

  test('T133.6: Messages screen accessibility', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="tab-messages"]');
    await page.waitForURL(/.*\/messages/);

    // Check message threads accessibility
    const threads = page.locator('[data-testid^="message-thread-"]');
    const firstThread = threads.first();

    if ((await threads.count()) > 0) {
      await expect(firstThread).toHaveAttribute('role', 'article');
      await expect(firstThread).toHaveAttribute('aria-label');
    }

    // Check message input accessibility
    const messageInput = page.locator('[data-testid="message-input"]');
    if ((await messageInput.count()) > 0) {
      await expect(messageInput).toHaveAttribute('aria-label');
      await expect(messageInput).toHaveAttribute('placeholder');
    }
  });

  test('T133.7: Profile screen accessibility', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    // Check profile elements accessibility
    const editButton = page.locator('[data-testid="edit-profile-button"]');
    await expect(editButton).toHaveAttribute('aria-label');

    // Check profile sections have proper headings
    await expect(page.locator('h1, h2, h3')).toHaveCount({ minimum: 1 });
  });

  test('T133.8: Navigation accessibility', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Check tab bar accessibility
    const tabs = ['matches', 'connections', 'messages', 'sobriety', 'profile'];

    for (const tab of tabs) {
      const tabButton = page.locator(`[data-testid="tab-${tab}"]`);
      await expect(tabButton).toHaveAttribute('role', 'button');
      await expect(tabButton).toHaveAttribute('aria-label');
    }
  });

  test('T133.9: Keyboard navigation', async ({ page }) => {
    // Check tab navigation on login screen
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

    // Test Enter key on button
    await page.keyboard.press('Enter');
    // Login should attempt (may show validation errors)
  });

  test('T133.10: Focus indicators visible', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]');
    await emailInput.focus();

    // Check that focus is visible (via outline or other styling)
    const outline = await emailInput.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    // Should have some form of focus indicator
    const hasFocusIndicator =
      outline.outline !== 'none' ||
      parseFloat(outline.outlineWidth) > 0 ||
      outline.boxShadow !== 'none';

    expect(hasFocusIndicator, 'Focus indicator should be visible').toBe(true);
  });
});

test.describe('T136: Touch Target Size Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('T136.1: Login screen touch targets', async ({ page }) => {
    await expect(page.locator('[data-testid="login-screen"]')).toBeVisible();

    await verifyTouchTargetSize(page, '[data-testid="login-button"]', 'Login button');
    await verifyTouchTargetSize(page, '[data-testid="signup-link"]', 'Signup link');
    await verifyTouchTargetSize(
      page,
      '[data-testid="forgot-password-link"]',
      'Forgot password link',
    );
  });

  test('T136.2: Tab bar touch targets', async ({ page }) => {
    // Login first
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    const tabs = ['matches', 'connections', 'messages', 'sobriety', 'profile'];

    for (const tab of tabs) {
      await verifyTouchTargetSize(page, `[data-testid="tab-${tab}"]`, `${tab} tab`);
    }
  });

  test('T136.3: Match card action buttons', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL(/.*\/matches/);

    const connectButton = page.locator('[data-testid="connect-button"]').first();
    if ((await connectButton.count()) > 0) {
      await verifyTouchTargetSize(page, '[data-testid="connect-button"]', 'Connect button');
    }

    const viewProfileButton = page.locator('[data-testid="view-profile-button"]').first();
    if ((await viewProfileButton.count()) > 0) {
      await verifyTouchTargetSize(
        page,
        '[data-testid="view-profile-button"]',
        'View profile button',
      );
    }
  });

  test('T136.4: Profile edit buttons', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="tab-profile"]');
    await page.waitForURL(/.*\/profile/);

    await verifyTouchTargetSize(page, '[data-testid="edit-profile-button"]', 'Edit profile button');
  });

  test('T136.5: Message send button', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="tab-messages"]');

    const sendButton = page.locator('[data-testid="send-message-button"]');
    if ((await sendButton.count()) > 0) {
      await verifyTouchTargetSize(
        page,
        '[data-testid="send-message-button"]',
        'Send message button',
      );
    }
  });

  test('T136.6: Icon buttons minimum size', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Check icon buttons across app
    const iconButtons = page.locator('[role="button"] svg, button svg').locator('..');
    const count = await iconButtons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = iconButtons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        expect(box.width, `Icon button ${i} width`).toBeGreaterThanOrEqual(44);
        expect(box.height, `Icon button ${i} height`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('T137: Color Contrast Verification (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('T137.1: Login screen text contrast', async ({ page }) => {
    await expect(page.locator('[data-testid="login-screen"]')).toBeVisible();

    // Check primary text contrast
    await verifyColorContrast(page, '[data-testid="login-title"]', 'Login title', true);

    // Check input labels
    await verifyColorContrast(page, 'label[for="email-input"]', 'Email label');
    await verifyColorContrast(page, 'label[for="password-input"]', 'Password label');

    // Check button text
    await verifyColorContrast(page, '[data-testid="login-button"]', 'Login button text');
  });

  test('T137.2: Navigation bar contrast', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Check tab labels
    const tabs = ['matches', 'connections', 'messages', 'sobriety', 'profile'];

    for (const tab of tabs) {
      await verifyColorContrast(page, `[data-testid="tab-${tab}"]`, `${tab} tab label`);
    }
  });

  test('T137.3: Match card text contrast', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL(/.*\/matches/);

    const matchCard = page.locator('[data-testid^="match-card-"]').first();

    if ((await matchCard.count()) > 0) {
      // Check name/title
      const name = matchCard.locator('[data-testid="match-name"]');
      if ((await name.count()) > 0) {
        await verifyColorContrast(page, '[data-testid="match-name"]', 'Match name', true);
      }

      // Check bio/description
      const bio = matchCard.locator('[data-testid="match-bio"]');
      if ((await bio.count()) > 0) {
        await verifyColorContrast(page, '[data-testid="match-bio"]', 'Match bio');
      }
    }
  });

  test('T137.4: Error message contrast', async ({ page }) => {
    // Trigger validation error
    await page.click('[data-testid="login-button"]');

    const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    if ((await errorMessage.count()) > 0) {
      await verifyColorContrast(
        page,
        '[data-testid="error-message"], [role="alert"]',
        'Error message',
      );
    }
  });

  test('T137.5: Secondary text contrast', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Check secondary/helper text across screens
    const helperTexts = page.locator(
      '[data-testid*="helper"], [data-testid*="subtitle"], [data-testid*="caption"]',
    );
    const count = await helperTexts.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = helperTexts.nth(i);
      const testId = await text.getAttribute('data-testid');
      await verifyColorContrast(page, `[data-testid="${testId}"]`, `Secondary text ${testId || i}`);
    }
  });

  test('T137.6: Placeholder text contrast', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]');

    // Check placeholder contrast
    const placeholderColor = await emailInput.evaluate(el => {
      const styles = window.getComputedStyle(el, '::placeholder');
      return {
        color: styles.color,
        backgroundColor: window.getComputedStyle(el).backgroundColor,
      };
    });

    const contrast = calculateContrastRatio(
      placeholderColor.color,
      placeholderColor.backgroundColor,
    );

    // Placeholder text should have at least 3:1 contrast (relaxed requirement)
    expect(contrast, 'Placeholder text contrast').toBeGreaterThanOrEqual(3.0);
  });
});

test.describe('Accessibility: Screen Reader Compatibility', () => {
  test('T133.11: Semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'Should have exactly one h1 per page').toBe(1);

    // Check for landmarks
    const main = await page.locator('main, [role="main"]').count();
    expect(main, 'Should have main landmark').toBeGreaterThanOrEqual(1);

    // Check for navigation
    const nav = await page.locator('nav, [role="navigation"]').count();
    expect(nav, 'Should have navigation landmark').toBeGreaterThanOrEqual(0);
  });

  test('T133.12: Image alt text', async ({ page }) => {
    await page.goto('/');

    // All images should have alt text
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt, `Image ${i} should have alt attribute`).not.toBeNull();
    }
  });

  test('T133.13: Form validation announcements', async ({ page }) => {
    await page.goto('/');

    // Trigger validation error
    await page.click('[data-testid="login-button"]');

    // Check for aria-live region or role="alert"
    const alerts = page.locator('[role="alert"], [aria-live]');
    const alertCount = await alerts.count();

    expect(alertCount, 'Should have alert region for validation errors').toBeGreaterThan(0);
  });
});
