import test, { expect } from '@playwright/test'
import {
  importBotInDatabase,
  wordpressConnectionName,
  wordpressClientId,
  wordpressClientSecret,
  wordpressTokenEndpoint,
  wordpressEmail,
  wordpressPassword,
} from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { selectVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers'

const botId = createId()

test.describe('Blocks > WordPress', () => {
  test('Should handle WordPress login functionality', async ({ page }) => {
    await test.step('Import bot in database', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/wordpress.json'), {
        id: botId,
      })
    })

    await test.step('Navigate to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await page.locator('text=Configure...').waitFor({ state: 'visible', timeout: 20000 })
      await page.click('text=Configure...')
    })

    await test.step('Auth should work', async () => {
      await page.click('text=Add WordPress Authentication')

      const createButton = page.getByRole('button', { name: 'Create' })
      await expect(createButton).toBeDisabled()

      await page.getByLabel('Name').fill(wordpressConnectionName)
      await page.getByLabel('Client ID').fill(wordpressClientId)
      await page.getByLabel('Client Secret').fill(wordpressClientSecret)
      await page.getByLabel('Token Endpoint').fill(wordpressTokenEndpoint)
      await page.getByLabel('Admin Email').fill(wordpressEmail)
      await page.getByLabel('Application Password').fill(wordpressPassword)

      await expect(createButton).toBeEnabled()
      await createButton.click()
    })

    await test.step('Options should work', async () => {
      await page.click('text=Select an action')
      await page.click('text=Login with WordPress')

      await page.getByLabel('Email').fill('{{email}}')
      await page.getByLabel('Password').fill('{{pass}}')

      const popupBody = page.locator('.chakra-stack.css-11nrrcx')
      await popupBody.click({ position: { x: 0, y: 100 } })
      await selectVariable(page, 'message', -1)
    })

    await test.step('Preview bot flow', async () => {
      const preview = await waitForPreview(page)

      await preview.getByPlaceholder('Type your email').waitFor({ state: 'visible' })
      await preview.getByPlaceholder('Type your email').fill(wordpressEmail)
      await preview.getByRole('button', { name: 'Send' }).click()

      await preview.getByPlaceholder('Type your password').waitFor({ state: 'visible' })
      await preview.getByPlaceholder('Type your password').fill(wordpressPassword)
      await preview.getByRole('button', { name: 'Send' }).click()

      await preview
        .getByText('✅ Login successful! You have been logged in correctly.')
        .isVisible({ timeout: 5000 })
    })
  })
})
