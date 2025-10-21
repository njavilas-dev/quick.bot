import { getTestAsset } from '@/test/utils/getTestAsset'
import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'

test('should correctly be injected', async ({ page }) => {
  const botId = createId()
  await importBotInDatabase(getTestAsset('bots/predefinedVariables.json'), {
    id: botId,
    version: '4',
    publicId: `${botId}-public`,
  })
  await page.goto(`/${botId}-public`)
  await expect(page.locator('text="Your name is"')).toBeVisible()
  await page.goto(`/${botId}-public?Name=Francisco&Email=variable@test.com`)
  await expect(page.locator('text="Francisco"')).toBeVisible()
  await expect(page.getByPlaceholder('Type your email...')).toHaveValue('variable@test.com')
})
