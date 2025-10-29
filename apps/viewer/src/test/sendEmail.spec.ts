import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { SmtpCredentials } from '@quickbot.io/schemas'
import { env } from '@quickbot.io/env'
import { createSmtpCredentials } from '@/test/utils/createSmtpCredentials'
import { getTestAsset } from '@/test/utils/getTestAsset'

export const mockSmtpCredentials: SmtpCredentials['data'] = {
  from: {
    email: 'notifications@quick.bot',
    name: 'QuickBot Notifications',
  },
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD,
}

test.beforeAll(async () => {
  try {
    const credentialsId = 'send-email-credentials'
    await createSmtpCredentials(credentialsId, mockSmtpCredentials)
  } catch (err) {
    console.error(err)
  }
})

test('should send an email', async ({ page }) => {
  const botId = createId()
  await importBotInDatabase(getTestAsset('bots/sendEmail.json'), {
    id: botId,
    version: '6',
    publicId: `${botId}-public`,
  })
  await page.goto(`/${botId}-public`)
  await page.locator('text="Send email"').click()
  await page.waitForTimeout(5000)
  await expect(page.getByText('Email successfully sent')).toBeVisible({
    timeout: 30000,
  })
  await page.waitForTimeout(5000)
  await page.goto(`${env.NEXTAUTH_URL}/analytics/${botId}/answers`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000)
  await page.click('button[aria-label="Expand logs"]', { timeout: 20000 })
  await expect(page.locator('text="Email successfully sent"')).toBeVisible({ timeout: 20000 })
})
