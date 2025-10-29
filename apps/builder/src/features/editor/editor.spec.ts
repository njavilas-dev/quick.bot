import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import {
  createBots,
  importBotInDatabase,
  parseDefaultGroupWithBlock,
} from '@quickbot.io/playwright/helpers'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { waitForPreview } from '@quickbot.io/playwright/testHelpers'

test.describe('Editor > Connecting and Deleting Edges', () => {
  test('Should connect and delete edges correctly', async ({ page }) => {
    const botId = createId()

    await test.step('Create empty bot', async () => {
      await createBots([{ id: botId, version: '6' }])
    })

    await test.step('Create connections between groups', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await expect(page.locator("text='Start'")).toBeVisible({ timeout: 20000 })

      // Wait for the sidebar to load and blocks to be available
      await page.waitForSelector('[data-testid="block-card-buttons input"]', { timeout: 30000 })

      await page.dragAndDrop('[data-testid="block-card-buttons input"]', '#editor-container', {
        targetPosition: { x: 1000, y: 400 },
      })
      await page.dragAndDrop('text=Text >> nth=0', '[data-testid="group"] >> nth=0', {
        targetPosition: { x: 100, y: 50 },
      })
      await page.dragAndDrop('[data-testid="endpoint"]', '[data-testid="group"] >> nth=0', {
        targetPosition: { x: 100, y: 10 },
      })

      await expect(page.locator('[data-testid="edge"]').first()).toBeAttached({ timeout: 15000 })

      await page.dragAndDrop('text=Date', '#editor-container', {
        targetPosition: { x: 1000, y: 800 },
      })
      await page.dragAndDrop(
        '[data-testid="endpoint"] >> nth=2',
        '[data-testid="group"] >> nth=1',
        { targetPosition: { x: 100, y: 10 } },
      )

      await expect(page.locator('[data-testid="edge"]')).toHaveCount(2, { timeout: 15000 })
    })

    await test.step('Delete group and validate edges are removed', async () => {
      const initialCount = await page.locator('[data-testid="edge"]').count()
      await page
        .getByTestId('group')
        .first()
        .click({ position: { x: 30, y: 30 } })
      await page.getByTestId('graph').getByLabel('Delete').click()
      const finalCount = await page.locator('[data-testid="edge"]').count()
      expect(finalCount).toBeLessThan(initialCount)
    })
  })
})

test.describe('Editor > Renaming and Icon Change', () => {
  test('Should rename and change icon correctly', async ({ page }) => {
    const botId = createId()

    await test.step('Create bot with text input block', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          name: 'My awesome bot',
          ...parseDefaultGroupWithBlock({ type: InputBlockType.TEXT }),
        },
      ])
    })

    await test.step('Update icon and bot name in settings', async () => {
      // Navigate to settings page instead of flow
      await page.goto(`/bots/${botId}/settings`)

      // Wait for settings sidebar to load
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 20000 })

      // Wait for Name accordion to be visible and click it if not already expanded
      const botInfoButton = page.locator('button:has-text("Name")')
      await botInfoButton.waitFor({ state: 'visible', timeout: 10000 })

      // Check if the accordion is already expanded by looking for the icon button
      const editIconButton = page.getByRole('button', { name: 'Edit icon' })
      const isExpanded = await editIconButton.isVisible().catch(() => false)

      if (!isExpanded) {
        await botInfoButton.click()
        await page.waitForTimeout(500) // Wait for accordion animation
      }

      // Click the edit icon button
      await editIconButton.click()

      // Select icon tab and search for heart
      await page.getByRole('tab', { name: 'Icon' }).click()
      await page.getByRole('menu').getByPlaceholder('Search...').fill('heart')
      await page.locator('button:has(img[alt="heart"])').first().click()

      // Close the icon dropdown by pressing Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Now edit bot name using the input field
      const botNameInput = page.getByPlaceholder('Enter bot name')
      await botNameInput.waitFor({ state: 'visible', timeout: 5000 })

      // Clear and fill the input with the new name
      await botNameInput.clear()
      await botNameInput.fill('My superb bot')

      // Wait for debounce and save to complete (InputTextWithVariables has debounce)
      await page.waitForTimeout(1000)

      // Reload the page to verify changes persisted
      await page.reload()

      // Verify the bot name changed in the header dropdown button
      const switchBotButton = page.getByRole('button', { name: 'Switch Bot' })
      await expect(switchBotButton).toContainText('My superb bot', { timeout: 20000 })
    })
  })
})

test.describe('Editor > Preview from Specific Group', () => {
  test('Should preview from specific group correctly', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot with multiple groups', async () => {
      await importBotInDatabase(getTestAsset('bots/editor/previewFromGroup.json'), { id: botId })
    })

    await test.step('Preview each group individually and validate response', async () => {
      await page.goto(`/bots/${botId}/flow`)

      await page.waitForTimeout(3000)

      await expect(page.getByTestId('group').first()).toBeVisible({ timeout: 30000 })

      const preview = await waitForPreview(page)

      // First test - Group that should contain "Hello this is group 1"
      // Using first() instead of nth(0) to avoid strict mode errors
      await page.getByTestId('group').first().waitFor({ state: 'visible', timeout: 20000 })
      await page
        .getByTestId('group')
        .first()
        .click({ position: { x: 100, y: 10 } })
      await page.waitForTimeout(1000)
      await page
        .locator('button[aria-label="Preview bot from this group"]')
        .waitFor({ timeout: 10000 })
      await page.click('button[aria-label="Preview bot from this group"]', { force: true })
      await expect(preview.locator('text="Hello this is group 1"')).toBeVisible({ timeout: 60000 })

      // Second test - Group that should contain "Hello this is group 2"
      // Using nth(1) for the second group
      const secondGroup = page.getByTestId('group').nth(1)
      await secondGroup.waitFor({ state: 'visible', timeout: 20000 })
      await secondGroup.click({ position: { x: 100, y: 10 } })
      await page.waitForTimeout(1000)
      await page
        .locator('button[aria-label="Preview bot from this group"]')
        .waitFor({ timeout: 10000 })
      await page.click('button[aria-label="Preview bot from this group"]', { force: true })
      await expect(preview.locator('text="Hello this is group 2"')).toBeVisible({ timeout: 60000 })

      // Final test - Previewing the entire bot from the start
      await page.locator('button[aria-label="Close"]').waitFor({ timeout: 10000 })
      await page.click('button[aria-label="Close"]')
      await page.waitForTimeout(1000)
      await page.locator('text="Preview"').waitFor({ timeout: 10000 })
      await page.click('text="Preview"')
      await expect(preview.locator('text="Hello this is group 1"')).toBeVisible({ timeout: 60000 })
    })
  })
})

test.describe('Editor > Published Bot Menu Actions', () => {
  test('Should perform published bot menu actions correctly', async ({ page }) => {
    const botId = createId()

    await test.step('Create bot and open editor', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          name: 'My awesome bot',
          ...parseDefaultGroupWithBlock({ type: InputBlockType.TEXT }),
        },
      ])
    })

    await test.step('Toggle publish state and validate UI', async () => {
      await page.goto(`/bots/${botId}/flow`)

      await expect(page.locator("text='Start'")).toBeVisible({ timeout: 30000 })

      const publishedButton = page.locator('button >> text="Published"')
      await publishedButton.waitFor({ state: 'visible', timeout: 30000 })

      const menuButton = page.locator('[aria-label="Show published bot menu"]')
      await menuButton.waitFor({ state: 'visible', timeout: 20000 })
      await menuButton.click({ force: true })
      await page.waitForTimeout(2000)

      const closeOption = page.locator('text="Close bot"')
      await closeOption.waitFor({ state: 'visible', timeout: 30000 })
      await closeOption.click({ force: true })
      await page.waitForTimeout(2000)

      const closedButton = page.locator('button >> text="Closed"')
      await closedButton.waitFor({ state: 'visible', timeout: 30000 })
      await expect(closedButton).toBeDisabled({ timeout: 20000 })
      await page.waitForTimeout(2000)

      await menuButton.click({ force: true })
      await page.waitForTimeout(2000)

      const reopenOption = page.locator('text="Reopen bot"')
      await reopenOption.waitFor({ state: 'visible', timeout: 30000 })
      await reopenOption.click({ force: true })
      await page.waitForTimeout(2000)

      await publishedButton.waitFor({ state: 'visible', timeout: 30000 })
      await expect(publishedButton).toBeDisabled({ timeout: 20000 })

      await page.waitForTimeout(2000)
      await menuButton.click({ force: true })

      await page.waitForTimeout(2000)

      const unpublishOption = page.locator('text="Unpublish bot"')
      await unpublishOption.waitFor({ state: 'visible', timeout: 30000 })
      await unpublishOption.click({ force: true })
      await page.waitForTimeout(2000)

      const publishButton = page.locator('button >> text="Publish"')
      await publishButton.waitFor({ state: 'visible', timeout: 30000 })

      await publishButton.click({ force: true })

      // Wait for confirmation modal to appear
      await expect(page.locator('text="Confirm Publish"')).toBeVisible({ timeout: 20000 })

      // Click the "Yes" confirmation button
      const confirmButton = page.getByRole('button', { name: 'Yes' })
      await confirmButton.click()

      await page.waitForTimeout(2000)
    })
  })
})
