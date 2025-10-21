import test, { expect } from '@playwright/test'
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { env } from '@quickbot.io/env'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { waitForPreview, waitForStripePaymentForm } from '@quickbot.io/playwright/testHelpers'

test.skip(!!process.env.CI, 'Skip stripe test in CI environment')

test.describe('Blocks > Stripe', () => {
  test('Should handle stripe block functionality', async ({ page }) => {
    const botId = createId()

    await test.step('Setup bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.PAYMENT,
          }),
        },
      ])
    })

    await test.step('Navigate to bot editor', async () => {
      await page.goto(`/bots/${botId}/flow`)
    })

    await test.step('Configure Stripe account', async () => {
      await page.click('text=Configure...')
      await page.getByRole('button', { name: 'Select Stripe account' }).click()
      await page.getByRole('menuitem', { name: 'Connect new' }).click()
      await page.fill('[placeholder="Stripe"]', 'My Stripe Account')
      await page.fill('[placeholder="sk_test_..."]', env.STRIPE_SECRET_KEY ?? '')
      await page.fill('[placeholder="sk_live_..."]', env.STRIPE_SECRET_KEY ?? '')
      await page.fill('[placeholder="pk_test_..."]', env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '')
      await page.fill('[placeholder="pk_live_..."]', env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '')
      await expect(page.locator('button >> text="Connect"')).toBeEnabled()
      await page.click('button >> text="Connect"')
      await expect(page.locator('text="Secret test key:"')).toBeHidden()
      await expect(page.locator('text="My Stripe Account"')).toBeVisible({ timeout: 20000 })
    })

    await test.step('Fill payment details', async () => {
      await page.fill('[placeholder="30.00"] >> nth=-1', '30.00')
      await page.click('text=Additional information')
      await page.fill('[placeholder="John Doe"]', 'Francisco')
      await page.fill('[placeholder="email@example.com"]', 'payment@test.com')
      await expect(page.locator('text="Phone number:"')).toBeVisible({ timeout: 20000 })
    })

    await test.step('Test declined payment', async () => {
      const preview = await waitForPreview(page)
      const stripeFrame = await waitForStripePaymentForm(preview)
      await stripeFrame.locator(`[placeholder="1234 1234 1234 1234"]`).fill('4000000000000002')
      await stripeFrame.locator(`[name="expiry"]`).fill('12 / 25')
      await stripeFrame.locator(`[name="cvc"]`).fill('240')
      await page.getByRole('button', { name: 'Pay $30.00' }).click()
      await expect(page.locator(`text="Your card has been declined."`)).toBeVisible({
        timeout: 20000,
      })
    })

    await test.step('Test successful payment', async () => {
      const preview = await waitForPreview(page)
      const stripeFrame = await waitForStripePaymentForm(preview)
      await stripeFrame.locator(`[placeholder="1234 1234 1234 1234"]`).fill('4242424242424242')
      const zipInput = stripeFrame.getByPlaceholder('90210')
      const isZipInputVisible = await zipInput.isVisible()
      if (isZipInputVisible) await zipInput.fill('12345')
      await page.getByRole('button', { name: 'Pay $30.00' }).click()
      await expect(page.locator(`text="Success"`)).toBeVisible({ timeout: 20000 })
    })
  })
})
