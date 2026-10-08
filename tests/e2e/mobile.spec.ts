import { test, expect } from '@playwright/test'

// ============================================================
// EGGFORM E2E — Mobile responsive tests
// Run only in mobile-chrome project (Pixel 7 viewport)
// ============================================================

test.describe('Mobile layout', () => {
  test('bottom navigation appears on mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Try Demo/i }).click()
    // Bottom nav should be visible on mobile
    await expect(page.getByRole('button', { name: /^Home$|^Dashboard$/ })).toBeVisible({ timeout: 3000 })
    // 5 nav items: Home, Farm, Marketplace, Wallet, Profile
    const bottomNav = page.locator('nav.lg\\:hidden')
    await expect(bottomNav).toBeVisible()
  })

  test('can navigate using bottom nav', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Try Demo/i }).click()
    // Skip onboarding if present
    const skipBtn = page.getByRole('button', { name: /Skip onboarding/i })
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
      await page.waitForTimeout(500)
    }

    // Tap Marketplace in bottom nav
    await page.locator('nav.lg\\:hidden').getByRole('button', { name: /Marketplace/ }).click()
    await expect(page.getByRole('heading', { name: /^Marketplace$/ })).toBeVisible({ timeout: 3000 })

    // Tap Profile
    await page.locator('nav.lg\\:hidden').getByRole('button', { name: /Profile/ }).click()
    await expect(page.getByRole('heading', { name: /Profile & Settings/i })).toBeVisible({ timeout: 3000 })
  })

  test('hamburger menu opens drawer with all sections', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Try Demo/i }).click()
    // Skip onboarding
    const skipBtn = page.getByRole('button', { name: /Skip onboarding/i })
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
      await page.waitForTimeout(500)
    }

    // Tap hamburger
    await page.getByRole('button', { name: /Open menu/i }).click()
    // Drawer should open with all sections
    await expect(page.getByText('EggForm').first()).toBeVisible({ timeout: 2000 })
    await expect(page.getByRole('button', { name: 'Eggs' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Animals' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Inventory' })).toBeVisible()
  })
})
