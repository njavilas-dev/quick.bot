import test, { expect } from '@playwright/test'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { waitForPreview } from '@quickbot.io/playwright/testHelpers'

const botId = createId()

test.describe('Blocks > FreshDesk', () => {
  test('Should handle FreshDesk ticket creation functionality', async ({ page }) => {
    await test.step('Import bot in database', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/freshdesk-bot.json'), {
        id: botId,
      })
    })

    await test.step('Navigate to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await page.locator('text=freshdesk').first().waitFor({ state: 'visible', timeout: 20000 })
      await page.locator('text=freshdesk').first().click()
    })

    await test.step('Auth should work', async () => {
      await page.click('text=Configure...')
      await page.click('text=Add FreshDesk credentials')

      const createButton = page.getByRole('button', { name: 'Create' })
      await expect(createButton).toBeDisabled()

      await page.getByLabel('Name').fill('FreshDeskTest')
      await page.getByLabel('Domain').fill('http://test-domain.com')
      await page.getByLabel('API Key').fill('test-api-key-123')

      await expect(createButton).toBeEnabled()
      await createButton.click()
    })

    await test.step('Configure Create Ticket block', async () => {
      // Navigate to the second FreshDesk block (Create Ticket)
      await page.locator('text=freshdesk').nth(1).click()
      await page.mouse.wheel(0, 1000)

      await page.click('text=Configure')
      await page.click('text=Select FreshDesk credentials')
      await page.click('text=FreshDeskTest') // Select existing credentials

      // Configure ticket fields with variables
      await page.getByLabel('Subject').fill('{{subject}}')
      await page.getByLabel('Description').fill('{{message}}')
      await page.getByLabel('Email').fill('{{email}}')

      // Set ticket type using variable
      await page.getByLabel('Type').fill('{{ticketTypeSelected}}')
    })

    await test.step('Preview bot flow', async () => {
      const preview = await waitForPreview(page)

      // Start the flow
      await preview.getByText('Hola').waitFor({ state: 'visible' })

      // Wait for ticket types to load and select one
      await preview.getByText('Select a ticket type:').waitFor({ state: 'visible' })

      // The choice input should be populated with ticket types from the mock
      await page.click('text=Question')

      // Fill email field
      await preview.getByPlaceholder('Email').waitFor({ state: 'visible' })
      await preview.getByPlaceholder('Email').fill('test@example.com')
      await preview.getByRole('button', { name: 'Send' }).click()

      // Fill subject field
      await preview.getByPlaceholder('Subject').waitFor({ state: 'visible' })
      await preview.getByPlaceholder('Subject').fill('Test Support Ticket')
      await preview.getByRole('button', { name: 'Send' }).click()

      // Fill message field
      await preview.getByPlaceholder('Message').waitFor({ state: 'visible' })
      await preview
        .getByPlaceholder('Message')
        .fill('This is a test message for the support ticket.')
      await preview.getByRole('button', { name: 'Send' }).click()

      // Wait for ticket creation result (should show the mocked ticket data)
      await preview.getByText('12345').waitFor({ state: 'visible', timeout: 10000 }) // Mock ticket ID
    })
  })
})
