import { createId } from '@quickbot.io/lib/createId'
import test, { expect } from '@playwright/test'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'

test.skip(!!process.env.CI, 'Skip payment test in CI environment')

test('Payment redirection should work', async ({ page }) => {
  const botId = createId()

  // Import the Bot asset into the database
  await test.step('Import Bot into the database', async () => {
    await importBotInDatabase(getTestAsset('bots/payment.json'), {
      id: botId,
      version: '6',
      publicId: `${botId}-public`,
    })
  })

  // Navigate to the test page
  await test.step('Navigate to the Bot page', async () => {
    await page.goto(`/${botId}-public`)
    await page.waitForLoadState('domcontentloaded')
  })

  // Select the Stripe iframe and wait for it to fully load
  await test.step('Wait for the Stripe iframe to be visible', async () => {
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]').first()
    await stripeFrame.locator('input[name="number"]').waitFor({ state: 'visible', timeout: 20000 })
  })

  // Fill in the test card details
  await test.step('Fill in the card details', async () => {
    const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]').first()

    await stripeFrame.locator('input[name="number"]').fill('4242 4242 4242 4242') // Test card number
    await stripeFrame.locator('input[name="expiry"]').fill('12/34') // Test expiry date
    await stripeFrame.locator('input[name="cvc"]').fill('123') // Test CVC

    // Fill postal code if the field is visible
    const postalCodeLocator = stripeFrame.locator('input[name="postal"]')
    if (await postalCodeLocator.isVisible()) {
      await postalCodeLocator.fill('12345') // Test postal code
    }
  })

  // Click the submit button and wait for the payment process
  await test.step('Submit the payment form', async () => {
    await page.locator('button[type="submit"]').click()
  })

  // Ensure the payment confirmation page is shown
  await test.step('Verify successful payment', async () => {
    await page.locator('text="Thank you!"').waitFor({ state: 'visible', timeout: 60000 })
    await expect(page.getByText('Thank you!')).toBeVisible()
  })
})
