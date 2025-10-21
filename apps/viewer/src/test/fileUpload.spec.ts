import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { parse } from 'papaparse'
import { readFileSync } from 'fs'
import { isDefined } from '@quickbot.io/lib'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { env } from '@quickbot.io/env'

test('should work as expected', async ({ page, browser }) => {
  const botId = createId()
  await importBotInDatabase(getTestAsset('bots/fileUpload.json'), {
    id: botId,
    version: '6',
    publicId: `${botId}-public`,
  })
  await page.goto(`/${botId}-public`)
  await page
    .locator(`input[type="file"]`)
    .setInputFiles([
      getTestAsset('bots/api.json'),
      getTestAsset('bots/fileUpload.json'),
      getTestAsset('bots/hugeGroup.json'),
    ])
  await page.locator('text="Upload 3 files"').click()
  await page.locator('text="3 files uploaded"').waitFor({ state: 'visible', timeout: 20000 })
  await page.goto(`${env.NEXTAUTH_URL}/analytics/${botId}/answers`)
  await page.waitForTimeout(5000)
  await expect(page.getByRole('link', { name: 'api.json' })).toHaveAttribute(
    'href',
    /.+\/api\.json/,
    {
      timeout: 30000,
    },
  )
  await expect(page.getByRole('link', { name: 'fileUpload.json' })).toHaveAttribute(
    'href',
    /.+\/fileUpload\.json/,
  )
  await expect(page.getByRole('link', { name: 'hugeGroup.json' })).toHaveAttribute(
    'href',
    /.+\/hugeGroup\.json/,
  )

  await page.click('[data-testid="checkbox"] >> nth=0')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button[aria-label="Export"]'),
  ])
  const downloadPath = await download.path()
  expect(downloadPath).toBeDefined()
  const file = readFileSync(downloadPath as string).toString()
  const { data } = parse(file)
  expect(data).toHaveLength(2)
  expect((data[1] as unknown[])[1]).toContain(env.S3_ENDPOINT)

  const urls = (
    await Promise.all(
      [
        page.getByRole('link', { name: 'api.json' }),
        page.getByRole('link', { name: 'fileUpload.json' }),
        page.getByRole('link', { name: 'hugeGroup.json' }),
      ].map((elem) => elem.getAttribute('href')),
    )
  ).filter(isDefined)

  const page2 = await browser.newPage()
  await page2.goto(urls[0])
  await expect(page2.locator('pre')).toBeVisible()

  page.getByRole('button', { name: 'Delete' }).click()
  await page.locator('button >> text="Delete"').click()
  await expect(page.locator('text="api.json"')).toBeHidden({
    timeout: 10000,
  })
  const page3 = await browser.newPage()
  await page3.goto(urls[0])
  await expect(page3.locator('pre')).toBeHidden()
})
