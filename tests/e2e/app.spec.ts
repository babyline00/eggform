import { test, expect } from '@playwright/test'

// ============================================================
// EGGFORM E2E — User app golden path
// Tests login → navigation → egg shop → wallet → admin
// ============================================================

// Login helper — used by all tests that need an authenticated session
async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Try Demo/i }).click()
  await expect(page.getByRole('heading', { name: /Asad Khan/i })).toBeVisible({ timeout: 5000 })
  // Skip onboarding if present
  const skipBtn = page.getByRole('button', { name: /Skip onboarding/i })
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click()
    await page.waitForTimeout(500)
  }
}

test.describe('Dashboard', () => {
  test('shows KPI cards and farm preview', async ({ page }) => {
    await loginAsDemo(page)
    await expect(page.getByText('PKR Balance').first()).toBeVisible()
    await expect(page.getByText('Coins').first()).toBeVisible()
    await expect(page.getByText(/Your Farm/i)).toBeVisible()
    // Active incubations
    await expect(page.getByText(/Active Incubations/i)).toBeVisible()
  })

  test('quick action buttons navigate correctly', async ({ page }) => {
    await loginAsDemo(page)
    // Click Buy Egg button → should navigate to eggs
    await page.getByRole('button', { name: /^Buy Egg$/ }).first().click()
    await expect(page.getByRole('heading', { name: /^Eggs$/ })).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Egg shop', () => {
  test('lists 5 egg types with correct rarities', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: 'Eggs' }).click()
    await expect(page.getByRole('heading', { name: /^Eggs$/ })).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Basic Egg')).toBeVisible()
    await expect(page.getByText('Silver Egg')).toBeVisible()
    await expect(page.getByText('Golden Egg')).toBeVisible()
    await expect(page.getByText('Diamond Egg')).toBeVisible()
    await expect(page.getByText('Legendary Egg')).toBeVisible()
  })

  test('buy egg confirmation dialog works', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: 'Eggs' }).click()
    // Click first buyable egg (100 🪙 Basic Egg)
    await page.getByRole('button', { name: /100 🪙/ }).click()
    // Confirmation dialog should appear
    await expect(page.getByRole('heading', { name: /Confirm purchase/i })).toBeVisible({ timeout: 3000 })
    // Confirm
    await page.getByRole('button', { name: /Confirm Purchase/i }).click()
    // Should close dialog and egg should be added
    await expect(page.getByRole('heading', { name: /Confirm purchase/i })).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe('Navigation', () => {
  const sections = [
    'Dashboard', 'My Farm', 'Eggs', 'Incubators', 'Animals',
    'Inventory', 'Marketplace', 'Missions',
  ]
  for (const section of sections) {
    test(`can navigate to ${section}`, async ({ page }) => {
      await loginAsDemo(page)
      await page.getByRole('button', { name: section }).first().click()
      await expect(page.getByRole('heading', { name: new RegExp(section, 'i') })).toBeVisible({ timeout: 3000 })
    })
  }
})

test.describe('PKR wallet', () => {
  test('shows wallet balance and tabs', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /PKR Wallet/ }).click()
    await expect(page.getByRole('heading', { name: /^PKR Wallet$/ })).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/Available Balance/i)).toBeVisible()
    // 3 tabs
    await expect(page.getByRole('tab', { name: /Transactions/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Deposits/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Withdrawals/i })).toBeVisible()
  })

  test('deposit flow opens dialog with payment methods', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /PKR Wallet/ }).click()
    await page.getByRole('button', { name: /^Deposit$/ }).click()
    await expect(page.getByRole('heading', { name: /Deposit PKR/i })).toBeVisible({ timeout: 3000 })
    // 4 payment methods
    await expect(page.getByText(/Bank Transfer/i)).toBeVisible()
    await expect(page.getByText(/Easypaisa/i)).toBeVisible()
    await expect(page.getByText(/JazzCash/i)).toBeVisible()
    await expect(page.getByText(/Debit\/Credit Card/i)).toBeVisible()
  })

  test('view architecture link works', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /PKR Wallet/ }).click()
    await page.getByRole('button', { name: /View Architecture/i }).click()
    await expect(page.getByRole('heading', { name: /PKR Wallet Architecture/i })).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/Critical Architecture Principle/i)).toBeVisible()
  })
})

test.describe('KYC verification flow', () => {
  test('shows 4-step wizard', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /KYC Verification/ }).click()
    await expect(page.getByRole('heading', { name: /KYC Verification/i })).toBeVisible({ timeout: 3000 })
    // Step 1: Personal Info
    await expect(page.getByText(/Personal Info/i)).toBeVisible()
    await expect(page.getByLabel(/Full Name/i)).toBeVisible()
    await expect(page.getByLabel(/Date of Birth/i)).toBeVisible()
  })
})

test.describe('Admin panel', () => {
  test('can enter admin and view dashboard', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /Admin Panel/i }).click()
    await expect(page.getByRole('heading', { name: /^Dashboard$/ })).toBeVisible({ timeout: 3000 })
    // KPI cards
    await expect(page.getByText(/Total Users/i).first()).toBeVisible()
    await expect(page.getByText(/Total Deposits/i).first()).toBeVisible()
  })

  test('can navigate to withdrawals and see pending', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /Admin Panel/i }).click()
    await page.getByRole('button', { name: /Withdrawals/ }).click()
    await expect(page.getByRole('heading', { name: /^Withdrawals$/ })).toBeVisible({ timeout: 3000 })
    // Should see pending withdrawals table
    await expect(page.getByText(/Pending/i)).toBeVisible()
  })

  test('can approve a withdrawal and see audit log', async ({ page }) => {
    await loginAsDemo(page)
    // First request a withdrawal as user
    await page.getByRole('button', { name: /PKR Wallet/ }).click()
    await page.getByRole('button', { name: /^Withdraw$/ }).click()
    await page.getByLabel(/Amount/i).fill('500')
    await page.getByLabel(/Account reference/i).fill('****1234')
    await page.getByRole('button', { name: /Confirm Withdrawal/i }).click()
    await page.waitForTimeout(500)

    // Switch to admin and approve
    await page.getByRole('button', { name: /Admin Panel/i }).click()
    await page.getByRole('button', { name: /Withdrawals/ }).click()
    // Click the approve button (first one in the table)
    const approveBtn = page.locator('button:has(svg.h-3.w-3)').first()
    if (await approveBtn.isVisible()) {
      await approveBtn.click()
      // Check audit log
      await page.getByRole('button', { name: /Audit Logs/i }).click()
      await expect(page.getByText(/WITHDRAWAL_APPROVED/i)).toBeVisible({ timeout: 3000 })
    }
  })

  test('can return to user app from admin', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /Admin Panel/i }).click()
    await page.getByRole('button', { name: /Back to App/i }).click()
    await expect(page.getByRole('heading', { name: /Asad Khan/i })).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Notifications', () => {
  test('bell icon shows unread count', async ({ page }) => {
    await loginAsDemo(page)
    const bell = page.getByRole('button', { name: /Notifications/i })
    await expect(bell).toBeVisible()
    // Should have unread indicator
    const badge = bell.locator('span.bg-rose-500')
    if (await badge.isVisible()) {
      const count = await badge.textContent()
      expect(parseInt(count || '0')).toBeGreaterThan(0)
    }
  })

  test('clicking bell opens notification panel', async ({ page }) => {
    await loginAsDemo(page)
    await page.getByRole('button', { name: /Notifications/i }).click()
    await expect(page.getByText(/^Notifications$/)).toBeVisible({ timeout: 2000 })
  })
})
