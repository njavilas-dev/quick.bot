import { getTestAsset } from '@/test/utils/getTestAsset'
import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { env } from '@quickbot.io/env'

test.skip(!!process.env.CI, 'Skip results test in CI environment')

test('Big groups should work as expected', async ({ page }) => {
  const botId = createId()
  await importBotInDatabase(getTestAsset('bots/hugeGroup.json'), {
    id: botId,
    version: '6',
    publicId: `${botId}-public`,
  })
  await page.goto(`/${botId}-public`)
  await page.waitForLoadState('domcontentloaded')
  await page.locator('textarea').fill('Francisco')
  await page.locator('textarea').press('Enter')
  await page.locator('input').fill('26')
  await page.locator('input').press('Enter')
  await page.getByRole('button', { name: 'Yes' }).click()
  await page.goto(`${env.NEXTAUTH_URL}/analytics/${botId}/answers`)
  await page.waitForTimeout(5000)
  await page.locator('td:has-text("Francisco")').waitFor({ state: 'visible', timeout: 20000 })
  await expect(page.locator('td:has-text("Francisco")')).toBeVisible({
    timeout: 10000,
  })
  await expect(page.locator('text="26"')).toBeVisible()
  await expect(page.locator('text="Yes"')).toBeVisible()
  await page.hover('tbody > tr')
  await page.click('button[aria-label="Expand results"]')
  await expect(page.locator('text="Francisco" >> nth=1')).toBeVisible({
    timeout: 10000,
  })
  await expect(page.locator('text="26" >> nth=1')).toBeVisible()
  await expect(page.locator('text="Yes" >> nth=1')).toBeVisible()
})
