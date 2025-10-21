import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { getTestAsset } from '@/test/utils/getTestAsset'

test('Transcript set variable should be correctly computed', async ({ page }) => {
  const botId = createId()
  await importBotInDatabase(getTestAsset('bots/transcript.json'), {
    id: botId,
    version: '6',
    publicId: `${botId}-public`,
  })

  await page.goto(`/${botId}-public`)
  await page.getByPlaceholder('Type your answer...').fill('hey')
  await page.getByLabel('Send').click()
  await page.getByPlaceholder('Type your answer...').fill('hey 2')
  await page.getByLabel('Send').click()
  await page.getByPlaceholder('Type your answer...').fill('hey 3')
  await page.getByLabel('Send').click()
  await expect(page.getByText('Assistant: "How are you? You said "')).toBeVisible()
  await expect(page.getByText('Assistant: "How are you? You said hey"')).toBeVisible()
  await expect(page.getByText('Assistant: "How are you? You said hey 2"')).toBeVisible()
  await expect(page.getByText('User: "hey"')).toBeVisible()
  await expect(page.getByText('User: "hey 2"')).toBeVisible()
  await expect(page.getByText('User: "hey 3"')).toBeVisible()
})
