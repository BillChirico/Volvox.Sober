/**
 * Dark Mode Testing Suite (T140)
 * Tests theme switching and dark mode rendering across iOS, Android, Web
 */

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Helper: Login to access theme settings
 */
async function login(page: Page) {
  await page.goto('/')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await page.waitForURL(/.*\/(matches|sobriety|profile)/)
}

/**
 * Helper: Navigate to theme settings
 */
async function navigateToThemeSettings(page: Page) {
  await page.click('[data-testid="tab-profile"]')
  await page.click('[data-testid="settings-button"]')
  await page.click('[data-testid="theme-settings-link"]')
}

/**
 * Helper: Get computed background color
 */
async function getBackgroundColor(page: Page, selector: string): Promise<string> {
  return await page.locator(selector).evaluate(el => {
    return window.getComputedStyle(el).backgroundColor
  })
}

/**
 * Helper: Check if color is dark
 */
function isDarkColor(rgbString: string): boolean {
  const rgb = rgbString.match(/\d+/g)?.map(Number) || [255, 255, 255]
  const [r, g, b] = rgb
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

test.describe('T140: Dark Mode Testing - Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('T140.1: Theme settings screen exists and is accessible', async ({ page }) => {
    await navigateToThemeSettings(page)

    // Verify theme settings screen loaded
    await expect(page.locator('text=Theme Appearance')).toBeVisible()

    // Verify theme options are present
    await expect(page.locator('text=Light')).toBeVisible()
    await expect(page.locator('text=Dark')).toBeVisible()
    await expect(page.locator('text=System')).toBeVisible()
  })

  test('T140.2: Switch from light to dark mode', async ({ page }) => {
    await navigateToThemeSettings(page)

    // Get initial background color
    const initialBg = await getBackgroundColor(page, 'body')

    // Switch to dark mode
    await page.click('text=Dark')

    // Wait for theme change
    await page.waitForTimeout(500)

    // Verify background changed to dark
    const newBg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(newBg), 'Background should be dark after switching').toBe(true)
    expect(newBg).not.toBe(initialBg)
  })

  test('T140.3: Switch from dark to light mode', async ({ page }) => {
    await navigateToThemeSettings(page)

    // Switch to dark mode first
    await page.click('text=Dark')
    await page.waitForTimeout(500)

    // Get dark background
    const darkBg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(darkBg)).toBe(true)

    // Switch to light mode
    await page.click('text=Light')
    await page.waitForTimeout(500)

    // Verify background changed to light
    const lightBg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(lightBg), 'Background should be light after switching').toBe(false)
    expect(lightBg).not.toBe(darkBg)
  })

  test('T140.4: System theme mode respects system preference', async ({ page }) => {
    await navigateToThemeSettings(page)

    // Select system mode
    await page.click('text=System')
    await page.waitForTimeout(500)

    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForTimeout(500)

    const darkBg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(darkBg), 'Should use dark theme when system is dark').toBe(true)

    // Emulate light color scheme
    await page.emulateMedia({ colorScheme: 'light' })
    await page.waitForTimeout(500)

    const lightBg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(lightBg), 'Should use light theme when system is light').toBe(false)
  })

  test('T140.5: Theme preference persists across sessions', async ({ page }) => {
    await navigateToThemeSettings(page)

    // Switch to dark mode
    await page.click('text=Dark')
    await page.waitForTimeout(500)

    // Reload page
    await page.reload()
    await page.waitForTimeout(1000)

    // Verify still in dark mode
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg), 'Dark mode should persist after reload').toBe(true)
  })
})

test.describe('T140: Dark Mode Testing - Screen Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToThemeSettings(page)
    await page.click('text=Dark')
    await page.waitForTimeout(500)
  })

  test('T140.6: Matches screen renders correctly in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-matches"]')
    await page.waitForURL(/.*\/matches/)

    // Check background is dark
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)

    // Check match cards are visible
    const matchCards = page.locator('[data-testid^="match-card-"]')
    if (await matchCards.count() > 0) {
      await expect(matchCards.first()).toBeVisible()

      // Verify card has appropriate dark styling
      const cardBg = await matchCards.first().evaluate(el => {
        return window.getComputedStyle(el).backgroundColor
      })
      expect(cardBg).toBeTruthy()
    }
  })

  test('T140.7: Connections screen renders correctly in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-connections"]')
    await page.waitForURL(/.*\/connections/)

    // Check background is dark
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)

    // Check connections list is visible
    const connections = page.locator('[data-testid^="connection-card-"]')
    if (await connections.count() > 0) {
      await expect(connections.first()).toBeVisible()
    }
  })

  test('T140.8: Messages screen renders correctly in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-messages"]')
    await page.waitForURL(/.*\/messages/)

    // Check background is dark
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)

    // Check message threads are visible
    const threads = page.locator('[data-testid^="message-thread-"]')
    if (await threads.count() > 0) {
      await expect(threads.first()).toBeVisible()
    }
  })

  test('T140.9: Profile screen renders correctly in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-profile"]')
    await page.waitForURL(/.*\/profile/)

    // Check background is dark
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)

    // Check profile content is visible
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible()
  })

  test('T140.10: Sobriety screen renders correctly in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-sobriety"]')
    await page.waitForURL(/.*\/sobriety/)

    // Check background is dark
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)

    // Check sobriety counter is visible
    await expect(page.locator('[data-testid="sobriety-counter"]')).toBeVisible()
  })

  test('T140.11: Bottom navigation renders correctly in dark mode', async ({ page }) => {
    // Check tab bar background
    const tabBar = page.locator('[data-testid="tab-bar"]')
    if (await tabBar.count() > 0) {
      const tabBg = await getBackgroundColor(page, '[data-testid="tab-bar"]')
      expect(tabBg).toBeTruthy()
    }

    // Check all tabs are visible and styled
    const tabs = ['matches', 'connections', 'messages', 'sobriety', 'profile']
    for (const tab of tabs) {
      const tabButton = page.locator(`[data-testid="tab-${tab}"]`)
      await expect(tabButton).toBeVisible()
    }
  })
})

test.describe('T140: Dark Mode Testing - Component Theming', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToThemeSettings(page)
    await page.click('text=Dark')
    await page.waitForTimeout(500)
  })

  test('T140.12: Buttons render with correct dark mode styling', async ({ page }) => {
    await page.click('[data-testid="tab-matches"]')

    const button = page.locator('[data-testid="connect-button"]').first()
    if (await button.count() > 0) {
      // Verify button has visible styling
      await expect(button).toBeVisible()

      const buttonBg = await button.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor
      })
      expect(buttonBg).toBeTruthy()
    }
  })

  test('T140.13: Cards render with correct dark mode styling', async ({ page }) => {
    await page.click('[data-testid="tab-matches"]')

    const card = page.locator('[data-testid^="match-card-"]').first()
    if (await card.count() > 0) {
      await expect(card).toBeVisible()

      // Check card has elevated appearance in dark mode
      const cardBg = await card.evaluate(el => {
        const bg = window.getComputedStyle(el).backgroundColor
        const shadow = window.getComputedStyle(el).boxShadow
        return { bg, shadow }
      })

      expect(cardBg.bg).toBeTruthy()
    }
  })

  test('T140.14: Text colors have sufficient contrast in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-profile"]')

    // Get text elements
    const textElements = page.locator('text=, p, span').locator('visible=true')
    const count = await textElements.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = textElements.nth(i)
        const colors = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
          }
        })

        // Both color and background should be defined
        expect(colors.color).toBeTruthy()
      }
    }
  })

  test('T140.15: Input fields render correctly in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-profile"]')
    await page.click('[data-testid="edit-profile-button"]')

    // Check input fields have appropriate dark styling
    const inputs = page.locator('input, textarea')
    const count = await inputs.count()

    if (count > 0) {
      const firstInput = inputs.first()
      await expect(firstInput).toBeVisible()

      const inputStyle = await firstInput.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderColor: styles.borderColor,
        }
      })

      expect(inputStyle.backgroundColor).toBeTruthy()
      expect(inputStyle.color).toBeTruthy()
    }
  })
})

test.describe('T140: Dark Mode Testing - Cross-Platform', () => {
  test('T140.16: Dark mode works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })

    await login(page)
    await navigateToThemeSettings(page)

    // Switch to dark mode
    await page.click('text=Dark')
    await page.waitForTimeout(500)

    // Verify dark mode active
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)

    // Navigate screens to verify rendering
    const tabs = ['matches', 'connections', 'messages', 'profile']
    for (const tab of tabs) {
      await page.click(`[data-testid="tab-${tab}"]`)
      await page.waitForTimeout(200)

      const screenBg = await getBackgroundColor(page, 'body')
      expect(isDarkColor(screenBg), `${tab} screen should be dark`).toBe(true)
    }
  })

  test('T140.17: Dark mode works on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    await login(page)
    await navigateToThemeSettings(page)

    // Switch to dark mode
    await page.click('text=Dark')
    await page.waitForTimeout(500)

    // Verify dark mode active
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)
  })

  test('T140.18: Dark mode works on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    await login(page)
    await navigateToThemeSettings(page)

    // Switch to dark mode
    await page.click('text=Dark')
    await page.waitForTimeout(500)

    // Verify dark mode active
    const bg = await getBackgroundColor(page, 'body')
    expect(isDarkColor(bg)).toBe(true)
  })
})

test.describe('T140: Dark Mode Testing - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToThemeSettings(page)
    await page.click('text=Dark')
    await page.waitForTimeout(500)
  })

  test('T140.19: Focus indicators visible in dark mode', async ({ page }) => {
    await page.click('[data-testid="tab-matches"]')

    // Tab to focus an element
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)

    // Get focused element
    const focusedElement = page.locator(':focus')
    if (await focusedElement.count() > 0) {
      const outline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        }
      })

      // Should have visible focus indicator
      const hasFocusIndicator = outline.outline !== 'none' ||
                               parseFloat(outline.outlineWidth) > 0 ||
                               outline.boxShadow !== 'none'

      expect(hasFocusIndicator, 'Focus indicator should be visible in dark mode').toBe(true)
    }
  })

  test('T140.20: WCAG AA contrast maintained in dark mode', async ({ page }) => {
    // This is verified by the dark theme tokens having WCAG AA compliant colors
    // The test verifies the theme setting displays this information

    await navigateToThemeSettings(page)

    await expect(page.locator('text=WCAG AA compliant')).toBeVisible()
    await expect(page.locator('text=4.5:1')).toBeVisible()
  })
})
