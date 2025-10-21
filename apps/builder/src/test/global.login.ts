import fs from 'fs'
import path from 'path'
import test, { expect } from '@playwright/test'
import { env } from '@quickbot.io/env'
import { PRIMARY_TEST_USER } from '@quickbot.io/playwright/helpers'
import { switchToWorkspace } from '@quickbot.io/playwright/testHelpers'

const STORAGE_STATE_PATH = path.resolve(__dirname, '../../../../tests/storageState.json')

test.describe('Global > User Login', () => {
  test('Should set up user for testing', async ({ page, context }) => {
    // 1) Navigate to a page that requires authentication in builder app
    await page.goto(`${env.NEXTAUTH_URL}/bots`)

    let alreadyLoggedIn = false
    try {
      // If we can see this specific text, we assume the session is already active
      await expect(page.locator('text="Francisco\'s Workspace"')).toBeVisible({
        timeout: 3000,
      })
      alreadyLoggedIn = true
    } catch {
      // If the text isn't found or there's a redirect to /signin, user is likely not logged in
    }

    // If the session is already valid, skip the login process
    if (alreadyLoggedIn) {
      test.skip(true, 'Session is already active; skipping login flow.')
    }

    // 2) Since user is not logged in, perform the login flow
    await test.step('Clear existing sessions', async () => {
      await context.clearCookies()
    })

    await test.step('Use test account credentials', async () => {
      await page.goto(`${env.NEXTAUTH_URL}/signin`)
      await page.waitForSelector('input[name="email"]', { timeout: 10000 })
      await page.fill('input[name="email"]', PRIMARY_TEST_USER.email)
      await page.fill('input[name="password"]', PRIMARY_TEST_USER.password)
      await page.click('button[type="submit"]')
    })

    await test.step('Verify redirection and workspace visibility', async () => {
      await page.waitForURL(new RegExp(`${env.NEXTAUTH_URL.replace(/\//g, '\\/')}\\/bots`), {
        timeout: 20000,
      })
      await expect(page.locator('text="Francisco\'s Workspace"').first()).toBeVisible({
        timeout: 20000,
      })
    })

    await test.step('Verify account profile page', async () => {
      await page.goto(`${env.NEXTAUTH_URL}/account/profile`)
      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toHaveValue('user.primary@test.com')
      await expect(emailInput).toBeVisible({ timeout: 20000 })

      console.log('Successfully logged in with test account')
    })

    // 3) Switch to the Business workspace
    await test.step('Switch to Business workspace', async () => {
      await page.goto(`${env.NEXTAUTH_URL}/bots`)
      await switchToWorkspace(page, 'Business workspace')
    })

    // 4) Save the storageState for subsequent tests
    await test.step('Save storage state for future tests', async () => {
      const storageState = await context.storageState()
      const dirPath = path.dirname(STORAGE_STATE_PATH)

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2))
      console.log(`Storage state saved to: ${STORAGE_STATE_PATH}`)
    })
  })
})