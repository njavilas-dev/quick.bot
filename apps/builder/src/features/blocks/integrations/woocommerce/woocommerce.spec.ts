import test, { expect } from '@playwright/test'
import {
  importBotInDatabase,
  wooCommerceTestConsumerKey,
  wooCommerceTestConsumerSecret,
  wooCommerceTestUrl,
} from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { waitForPreview } from '@quickbot.io/playwright/testHelpers'

const botId = createId()

test.describe('Blocks > WooCommerce', () => {
  test('Should handle WooCommerce searchProducts functionality', async ({ page }) => {
    await test.step('Import bot in database', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/woocommerce-bot.json'), {
        id: botId,
      })
    })

    await test.step('Navigate to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await page.locator('text=woocommerce').waitFor({ state: 'visible', timeout: 20000 })
      await page.click('text=woocommerce')
    })

    await test.step('Auth should work', async () => {
      await page.click('text=Configure...')
      await page.click('text=Add WooCommerce credentials')

      const createButton = page.getByRole('button', { name: 'Create' })
      await expect(createButton).toBeDisabled()

      await page.getByLabel('Name').fill('WooCommerceTest')
      await page.getByLabel('Site URL').fill(wooCommerceTestUrl)
      await page.getByLabel('Consumer Key').fill(wooCommerceTestConsumerKey)
      await page.getByLabel('Consumer Secret').fill(wooCommerceTestConsumerSecret)

      await expect(createButton).toBeEnabled()
      await createButton.click()
    })

    await test.step('Options should work', async () => {
      // Set the action to Search Products
      await page.click('text=Select an action')
      await page.click('text=Search Products')

      // Fill search term
      await page.getByLabel('Search Term').fill('{{wooSearchTerm}}')

      // Set results per page
      await page.getByLabel('Results Per Page').fill('10')

      // Set output variable
      await page.click('text=Select a Variable')
      await page.click('button:has-text("searchResult")')
    })

    await test.step('Preview bot flow', async () => {
      const preview = await waitForPreview(page)

      // Enter search term
      await preview.getByPlaceholder('Type tearm search').waitFor({ state: 'visible' })
      await preview.getByPlaceholder('Type tearm search').fill('t-shirt')
      await preview.getByRole('button', { name: 'Search' }).click()

      await preview.getByText('T-Shirt with Logo').isVisible({ timeout: 5000 })
      await preview.getByText('V-Neck T-Shirt').isVisible()
      await preview.getByText('T-Shirt').isVisible()
    })
  })
})
