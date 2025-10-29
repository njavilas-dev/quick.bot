import { env } from '@quickbot.io/env'

import { getTestAsset } from '@/test/utils/getTestAsset'
import test, { expect } from '@playwright/test'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'

const botId = 'cl0ibhi7s0018n21aarlmg0cm'
const linkedBotId = 'cl0ibhv8d0130n21aw8doxhj5'
const botWithMergeDisabledId = 'cl0ibhi7s0018n21aarlag0cm'

test.beforeAll(async () => {
  try {
    await importBotInDatabase(getTestAsset('bots/linkBots/1.json'), {
      id: botId,
      version: '6',
      publicId: `${botId}-public`,
    })
    await importBotInDatabase(getTestAsset('bots/linkBots/2.json'), {
      id: linkedBotId,
      version: '6',
      publicId: `${linkedBotId}-public`,
    })
    await importBotInDatabase(getTestAsset('bots/linkBots/1-merge-disabled.json'), {
      id: botWithMergeDisabledId,
      version: '6',
      publicId: `${botWithMergeDisabledId}-public`,
    })
  } catch (err) {
    console.error(err)
  }
})

test('should work as expected', async ({ page }) => {
  await page.goto(`/${botId}-public`)
  await page.getByPlaceholder('Type your answer...').fill('Hello there!')
  await page.getByPlaceholder('Type your answer...').press('Enter')
  await expect(page.getByText('Cheers!')).toBeVisible()
  await page.goto(`${env.NEXTAUTH_URL}/analytics/${botId}/answers`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000)
  await expect(page.getByRole('cell', { name: 'Hello there!' }).first()).toBeVisible({ timeout: 30000 })
})

test.describe('Merge disabled', () => {
  test('should work as expected', async ({ page }) => {
    await page.goto(`/${botWithMergeDisabledId}-public`)
    await page.waitForLoadState('domcontentloaded')
    await page.getByPlaceholder('Type your answer...').fill('Hello there!')
    await page.getByPlaceholder('Type your answer...').press('Enter')
    await expect(page.getByText('Cheers!')).toBeVisible()
    await page.goto(`${env.NEXTAUTH_URL}/analytics/${botWithMergeDisabledId}/answers`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Submitted at').first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Hello there!' })).toBeHidden()
    await page.goto(`${env.NEXTAUTH_URL}/analytics/${linkedBotId}/answers`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('cell', { name: 'Hello there!' }).first()).toBeVisible()
  })
})
