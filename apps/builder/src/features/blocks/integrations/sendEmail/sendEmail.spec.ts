import test, { expect } from '@playwright/test'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { env } from '@quickbot.io/env'
import { waitForPreview } from '@quickbot.io/playwright/testHelpers'

const botId = createId()

test.describe('Blocks > SendEmail', () => {
  test('Should configure send email block correctly', async ({ page }) => {
    await test.step('Check SMTP environment variables', async () => {
      if (!env.SMTP_USERNAME || !env.SMTP_HOST || !env.SMTP_PASSWORD || !env.NEXT_PUBLIC_SMTP_FROM)
        throw new Error('SMTP_ env vars are missing')
    })

    await test.step('Import bot in database', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/sendEmail.json'), {
        id: botId,
      })
    })

    await test.step('Navigate to bot flow and configure SMTP', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await page.locator('text=Configure...').waitFor({ state: 'visible', timeout: 20000 })
      await page.click('text=Configure...')
      await page.click(`input[placeholder="email@example.com, email2@example.com"]`)
      await page.click('text=Add SMTP account')
      const createButton = page.getByRole('button', { name: 'Create' })
      await expect(createButton).toBeDisabled()
      await page.getByLabel('From email').fill(env.NEXT_PUBLIC_SMTP_FROM ?? '')
      await page.getByLabel('From name').fill('John Doe')
      await page.getByLabel('Host').fill(env.SMTP_HOST ?? '')
      await page.getByLabel('Username').fill(env.SMTP_USERNAME ?? '')
      await page.getByLabel('Password').fill(env.SMTP_PASSWORD ?? '')
      await page.fill('input[role="spinbutton"]', env.SMTP_PORT.toString())
      await expect(createButton).toBeEnabled()
      await createButton.click()
    })

    await test.step('Validate configuration and send test email', async () => {
      await page
        .locator(`text=${env.NEXT_PUBLIC_SMTP_FROM}`)
        .waitFor({ state: 'visible', timeout: 20000 })
      await page
        .getByLabel('To:', { exact: true })
        .nth(0)
        .fill('email@example.com, email2@example.com')
      await page.locator('text=email@example.com').waitFor({ state: 'visible', timeout: 20000 })
      await page.locator('text=email2@example.com').waitFor({ state: 'visible', timeout: 20000 })
      await page.getByLabel('Subject:').fill('Email subject')
      await page.click('text="Custom content?"')
      await page.locator('textarea').last().fill('Here is my email')
    })

    await test.step('Preview bot flow and verify email not sent', async () => {
      const preview = await waitForPreview(page)
      await preview.locator('text=Go').click()
      await expect(page.locator('text=Emails are not sent in preview mode >> nth=0')).toBeVisible({
        timeout: 20000,
      })
    })
  })
})
