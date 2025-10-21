import test, { expect } from '@playwright/test'
import { getTestAsset } from '@/test/utils/getTestAsset'

test.describe('Templates > Page', () => {
  test('Should create a blank bot from scratch', async ({ page }) => {
    await test.step('Navigate to bots page', async () => {
      await page.goto('/bots')
    })

    // Bots are currently limited to one per workspace
    await test.step('Create a new bot', async () => {
      await page.getByRole('button', { name: 'Create' }).click({ timeout: 20000 })
      await page.waitForTimeout(5000)
      await expect(page).toHaveURL(/\/flow/, { timeout: 30000 })
    })
  })

  test('Should import correctly from file', async ({ page }) => {
    await test.step('Navigate to bots page', async () => {
      await page.goto('/bots')
    })

    // Bots are currently limited to one per workspace
    await test.step('Import bot from file', async () => {
      await page.waitForTimeout(5000)
      await page
        .locator(`input[type="file"]`)
        .setInputFiles([getTestAsset('bots/singleChoiceTarget.json')])
      await page.waitForTimeout(5000)
      await expect(page).toHaveURL(/\/flow/, { timeout: 20000 })
    })
  })

  test('Should preview and use templates', async ({ page }) => {
    await test.step('Navigate to bots page', async () => {
      await page.goto('/bots')
    })

    await test.step('Preview and use a template', async () => {
      await page.getByRole('button', { name: 'Template' }).click()
      await page.getByRole('button', { name: 'Customer Support' }).click({ timeout: 20000 })
      await expect(page.locator('text=How can I help you?')).toBeVisible({ timeout: 20000 })
      await page.getByRole('button', { name: 'Import' }).click()
      await expect(page).toHaveURL(/\/flow/, { timeout: 20000 })
    })
  })
})
