import test, { expect } from '@playwright/test'
import {
  createBots,
  parseDefaultGroupWithBlock,
  freeWorkspaceId,
  personalWorkspaceId,
} from '@quickbot.io/playwright/helpers'
import { switchToWorkspace, waitForPreview } from '@quickbot.io/playwright/testHelpers'
import { createId } from '@quickbot.io/lib/createId'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { getTestAsset } from '@/test/utils/getTestAsset'

test.describe.configure({ mode: 'parallel' })

test.describe('Blocks > File Upload', () => {
  test('Should work with file input block options', async ({ page }) => {
    const botId = createId()

    await test.step('Create bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          workspaceId: personalWorkspaceId,
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.FILE,
          }),
        },
      ])
    })

    await test.step('Switch to Personal workspace', async () => {
      await page.goto('/bots')
      await switchToWorkspace(page, 'Personal workspace')
    })

    await test.step('Go to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`)
    })

    await test.step('Preview: default file input', async () => {
      const preview = await waitForPreview(page)

      await expect(preview.locator('text=Click to upload')).toBeVisible({ timeout: 20000 })
      await expect(preview.locator('text="Skip"')).toBeHidden()

      await preview.locator('input[type="file"]').setInputFiles([getTestAsset('avatar.jpg')])
      await expect(preview.getByRole('img', { name: 'Attached image 1' })).toBeVisible({
        timeout: 20000,
      })
    })

    await test.step('Options: update config and labels', async () => {
      await page.click('text="Upload"')
      await page.click('text="Required?"')
      await page.click('text="Allow multiple files?"')
      await page.fill('div[contenteditable=true]', '<strong>Upload now!!</strong>')
      await page.click('text="Labels"')
      await page.fill('[value="Upload"]', 'Go')
      await page.fill('[value="Clear"]', 'Reset')
      await page.fill('[value="Skip"]', 'Pass')
    })

    await test.step('Preview: upload multiple files with custom labels', async () => {
      await page.click('[aria-label="Restart"]')
      const preview = await waitForPreview(page)

      await preview.locator('text="Pass"').waitFor({ state: 'visible' })
      await preview.locator('text="Upload now!!"').waitFor({ state: 'visible' })

      await preview
        .locator('input[type="file"]')
        .setInputFiles([
          getTestAsset('avatar.jpg'),
          getTestAsset('avatar.jpg'),
          getTestAsset('avatar.jpg'),
        ])

      await preview.getByRole('img', { name: 'avatar.jpg' }).first().waitFor({ state: 'visible' })
      await preview.getByRole('img', { name: 'avatar.jpg' }).nth(1).waitFor({ state: 'visible' })
      await preview.getByRole('img', { name: 'avatar.jpg' }).nth(2).waitFor({ state: 'visible' })
      await expect(preview.getByRole('img', { name: 'avatar.jpg' })).toHaveCount(3)

      await preview.locator('text="Go"').click()
      await expect(preview.getByRole('img', { name: 'Attached image 1' })).toBeVisible({
        timeout: 20000,
      })
    })
  })

  test('Should not allow file input block to be published in free plan', async ({ page }) => {
    const botId = createId()

    await test.step('Create bot in free workspace', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          workspaceId: freeWorkspaceId,
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.FILE,
          }),
        },
      ])
    })

    await test.step('Switch to Free workspace', async () => {
      await page.goto('/bots')
      await switchToWorkspace(page, 'Free workspace')
    })

    await test.step('Go to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`)
    })

    await test.step('Try to publish and expect restriction message', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await page.click('text="Upload"')
      await page.click('text="Allow multiple files?"')
      await page.click('text="Save"')

      // Wait for confirmation modal to appear
      await expect(page.locator('text="Confirm Publish"')).toBeVisible({ timeout: 20000 })

      // Click the "Yes" confirmation button
      const confirmButton = page.getByRole('button', { name: 'Yes' })
      await confirmButton.click()

      await expect(page.locator('text="Subscription Plans"')).toBeVisible({ timeout: 20000 })
    })
  })
})
