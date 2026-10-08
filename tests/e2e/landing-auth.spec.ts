import { test, expect } from '@playwright/test'

// ============================================================
// EGGFORM E2E — Landing page + auth + dashboard golden path
// ============================================================

test.describe('Landing page', () => {
  test('loads hero with Farm Green CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EggForm/)
    await expect(page.getByRole('heading', { name: /Build Your Egg Empire/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Try Demo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Start Farming/i })).toBeVisible()
  })

  test('has features section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Everything you need/i })).toBeVisible()
    // At least 4 feature cards
    const featureCards = page.locator('section#features article, section#features > div > div > div')
    const count = await featureCards.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('has FAQ accordion', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/What is EggForm/i).first()).toBeVisible()
    // Click to expand
    await page.getByRole('button', { name: /What is EggForm/i }).click()
    // FAQ body should be visible after expansion
    await expect(page.getByText(/virtual egg ecosystem/i).first()).toBeVisible({ timeout: 2000 })
  })

  test('has footer with legal links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Terms of Service/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Privacy Policy/i })).toBeVisible()
  })

  test('theme toggle switches dark/light', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: /Toggle theme/i })
    await toggle.click()
    // Should toggle dark mode class on html
    const htmlClass = await page.evaluate(() => document.documentElement.className)
    expect(htmlClass).toContain('dark')
    await toggle.click()
    const htmlClass2 = await page.evaluate(() => document.documentElement.className)
    expect(htmlClass2).not.toContain('dark')
  })
})

test.describe('Auth flow', () => {
  test('opens auth modal on Get Started', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Get Started/i }).click()
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible()
    await expect(page.getByLabel(/Full name/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
  })

  test('Try Demo logs in and redirects to dashboard', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Try Demo/i }).click()
    // Should now be on dashboard
    await expect(page.getByRole('heading', { name: /Asad Khan/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /Buy Egg/i }).first()).toBeVisible()
  })

  test('register form validates required fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Get Started/i }).click()
    // Try to continue without filling anything
    await page.getByRole('button', { name: /^Continue$/ }).click()
    await expect(page.getByText(/Please fill all required fields/i)).toBeVisible()
  })
})

test.describe('Onboarding mascot', () => {
  test('shows Eggy mascot on first login', async ({ page }) => {
    // Clear onboarding flag to simulate first-time user
    await page.addInitScript(() => {
      localStorage.removeItem('eggform-onboarding-completed')
    })
    await page.goto('/')
    await page.getByRole('button', { name: /Try Demo/i }).click()
    // Mascot should appear after delay
    await expect(page.getByText(/Hi! I'm Eggy/i)).toBeVisible({ timeout: 5000 })
  })

  test('can skip onboarding', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('eggform-onboarding-completed')
    })
    await page.goto('/')
    await page.getByRole('button', { name: /Try Demo/i }).click()
    await expect(page.getByText(/Hi! I'm Eggy/i)).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Skip onboarding/i }).click()
    await expect(page.getByText(/Hi! I'm Eggy/i)).not.toBeVisible({ timeout: 2000 })
  })
})
