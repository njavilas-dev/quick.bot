import test, { expect } from '@playwright/test'
import {
  createBots,
  importBotInDatabase,
  parseDefaultGroupWithBlock,
} from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { selectVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers'

test.describe('Blocks > Inputs > Buttons', () => {
  test('Should edit button items', async ({ page }) => {
    const botId = createId()

    await test.step('Create bot with a default group and block', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.CHOICE,
            items: [{ id: 'choice1' }],
          }),
        },
      ])
    })

    await test.step('Navigate to edit page of the bot', async () => {
      await page.goto(`/bots/${botId}/flow`)
    })

    await test.step('Add and edit items in the input block', async () => {
      await page.getByRole('textbox').last().fill('Item 1')
      await page.getByRole('textbox').last().press('Enter')
      await page.getByRole('textbox').last().fill('Item 2')
      await page.getByRole('textbox').last().press('Enter')
      await page.getByRole('textbox').last().fill('Item 3')
      await page.getByRole('textbox').last().press('Enter')
      await page.getByRole('textbox').last().press('Escape')
    })

    await test.step('Delete an item and verify', async () => {
      const item2 = await page.locator('text=Item 2').first()
      await item2.hover()
      await page.locator('[aria-label="Delete item"]').click()
      await expect(page.locator('text=Item 2')).toBeHidden()
    })

    await test.step('Preview and validate item interactions (single choice)', async () => {
      const preview = await waitForPreview(page)
      await preview.getByRole('button', { name: 'Item 3' }).click()
      await expect(preview.getByRole('button', { name: 'Item 3' })).toBeHidden()
      await expect(preview.getByTestId('guest-bubble')).toHaveText('Item 3')
      await page.click('button[aria-label="Close"]')
    })

    await test.step('Edit block settings', async () => {
      await page.getByTestId('block block2').click({ position: { x: 0, y: 0 } })
      await page.click('text=Multiple choice?')
      await page.getByLabel('Button label:').fill('Go')
      await selectVariable(page, 'var1', 1)
    })

    await test.step('Add a new item via UI interactions', async () => {
      const item1Container = page.locator('text=Item 1').first()
      await item1Container.hover()

      const addButton = page.locator('[aria-label="Add item"]')
      await addButton.waitFor({ state: 'visible', timeout: 5000 })

      await addButton.click()
      const block = page.getByTestId('block block2')
      await block.getByRole('textbox').fill('Item 2')
      await block.getByRole('textbox').press('Enter')
    })

    await test.step('Final preview and validate multi-selection', async () => {
      const preview = await waitForPreview(page)

      await preview.getByRole('checkbox', { name: 'Item 3' }).click()
      await preview.getByRole('checkbox', { name: 'Item 1' }).click()
      await preview.getByRole('button', { name: 'Go' }).click()
      await expect(preview.locator('text="Item 3, Item 1"')).toBeVisible({ timeout: 10000 })
    })
  })

  test('Should verify variable buttons functionality', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot with variable buttons', async () => {
      await importBotInDatabase(getTestAsset('bots/inputs/variableButton.json'), {
        id: botId,
      })
    })

    await test.step('Interact with variable button and verify', async () => {
      await page.goto(`/bots/${botId}/flow`)
      const preview = await waitForPreview(page)
      await preview.getByRole('button', { name: 'Variable item' }).click()
      await expect(preview.getByTestId('guest-bubble')).toHaveText('Variable item')
      await expect(preview.locator('text=Ok great!')).toBeVisible({ timeout: 20000 })
    })

    await test.step('Edit and restart the block', async () => {
      await page.click('text="Item 1"')
      await page.getByRole('textbox').last().fill('{{Item 2}}')
      await page.getByTestId('block block1').click({ position: { x: 0, y: 0 } })
      await page.click('text=Multiple choice?')
      await page.click('[aria-label="Restart"]')
    })

    await test.step('Validate multiple selections and submission', async () => {
      const preview = await waitForPreview(page)
      await preview.getByRole('checkbox', { name: 'Variable item' }).nth(0).click()
      await preview.getByRole('checkbox', { name: 'Variable item' }).nth(1).click()
      await preview.locator('text="Send"').click()
      await expect(preview.locator('text="Variable item, Variable item"')).toBeVisible({
        timeout: 20000,
      })
    })
  })
})
