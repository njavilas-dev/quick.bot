import { env } from '@quickbot.io/env'
import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { getTestAsset } from '@/test/utils/getTestAsset'

// Remove this skip when the migration is updated for this plan "Enterprise"
test('should execute webhooks properly', async ({ page }) => {
  const botId = createId()
  await importBotInDatabase(getTestAsset('bots/webhook.json'), {
    id: botId,
    version: '6',
    publicId: `${botId}-public`,
  })
  await page.goto(`/${botId}-public`)
  await page.locator('text=Send failing webhook').click()
  await page.locator('[placeholder="Type a name..."]').fill('John')
  await page.locator('text="Send"').click()
  await page.locator('[placeholder="Type an age..."]').fill('30')
  await page.locator('text="Send"').click()
  await page.locator('text="Male"').click()
  await expect(page.getByText('{"name":"John","age":25,"gender":"male"}')).toBeVisible()
  await expect(page.getByText('{"name":"John","age":30,"gender":"Male"}')).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/analytics/${botId}/answers`)
  await page.waitForLoadState('domcontentloaded')
  await page.click('button[aria-label="Expand logs"]')
  await expect(page.locator('text="Webhook successfuly executed." >> nth=1')).toBeVisible()
  await expect(page.locator('text="Webhook returned an error."')).toBeVisible()
})
