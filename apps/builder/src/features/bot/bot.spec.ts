import test, { expect } from '@playwright/test'
import { createBots } from '@quickbot.io/playwright/helpers'

test.describe('Features > Bots', () => {
  test('Should be deletable', async ({ page }) => {
    await test.step('Create a bot programmatically', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      await createBots([
        {
          id: 'deletable-bot',
          version: '6',
          name: 'Bot #1',
          createdAt: tomorrow,
        },
      ])
    })

    await test.step('Refresh and locate the bot row', async () => {
      await page.goto('/bots')
      const botRow = page.locator('tr', { hasText: 'Bot #1' })
      await expect(botRow).toBeVisible({ timeout: 20000 })
    })

    await test.step('Open bot actions and click delete', async () => {
      const botRow = page.locator('tr', { hasText: 'Bot #1' })
      const actionsButton = botRow.locator('button[name="actions"]')
      await expect(actionsButton).toBeVisible({ timeout: 20000 })
      await actionsButton.click()
      await page.getByRole('menuitem', { name: 'Delete' }).first().click()
    })

    await test.step('Confirm deletion in dialog', async () => {
      const dialog = page.getByRole('dialog')
      await dialog.waitFor({ state: 'visible', timeout: 20000 })
      const deleteButton = dialog.getByRole('button', { name: 'Delete' }).first()
      await deleteButton.waitFor({ state: 'visible', timeout: 20000 })
      await deleteButton.click()
    })

    await test.step('Ensure the bot is no longer visible', async () => {
      await page.locator('tr', { hasText: 'Bot #1' }).waitFor({ state: 'hidden' })
      await expect(page.locator('tr', { hasText: 'Bot #1' })).not.toBeVisible({ timeout: 20000 })
    })
  })
})
