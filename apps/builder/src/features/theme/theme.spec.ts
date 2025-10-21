import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase, freeWorkspaceId } from '@quickbot.io/playwright/helpers'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { waitForPreview } from '@quickbot.io/playwright/testHelpers'

const hostAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?...'
const guestAvatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?...'
const backgroundImageUrl = 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?...'

test.skip(!!process.env.CI, 'Skip theme test in CI environment')

test.describe('Theme > Global', () => {
  test('Should reflect global changes in real time', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot with theme config', async () => {
      await importBotInDatabase(getTestAsset('bots/theme.json'), { id: botId })
    })

    await test.step('Open theme page and launch preview', async () => {
      await page.goto(`/bots/${botId}/theme`)
      const preview = await waitForPreview(page)
      await expect(preview.locator('text="Go"')).toBeVisible({ timeout: 10000 })
    })

    await test.step('Change font and background color/image', async () => {
      const accordion = page.locator('button:has-text("Global")')
      if ((await accordion.getAttribute('aria-expanded')) !== 'true') {
        await accordion.click()
      }

      await page.click('text="Show QuickBot brand"')

      await page.getByRole('button', { name: 'Open Sans' }).click()
      await page.getByRole('menuitem', { name: 'Montserrat' }).click()
      await expect(page.locator('.quickbot')).toHaveCSS('font-family', /Montserrat/)

      await page.click('text=Color')
      await page.getByRole('button', { name: 'Pick a color' }).click()
      await page.fill('[aria-label="Color value"] >> nth=-1', '#2a9d8f')
      await expect(page.locator('.quickbot')).toHaveCSS('background-color', 'rgb(42, 157, 143)')
      await page.click('text=Color')

      await page.click('text="Image"')
      await page.getByRole('button', { name: 'Select an image' }).click()
      await page.getByPlaceholder('Paste the image link...').fill(backgroundImageUrl)
      await expect(page.getByRole('img', { name: 'Background image' })).toHaveAttribute(
        'src',
        backgroundImageUrl,
      )
      await expect(page.locator('.quickbot')).toHaveCSS(
        'background-image',
        `url("${backgroundImageUrl}")`,
      )
    })
  })

  test('Should reflect chat section changes in real time', async ({ page }) => {
    const botId = 'chat-theme-bot'

    await test.step('Import theme bot or reuse it', async () => {
      try {
        await importBotInDatabase(getTestAsset('bots/theme.json'), { id: botId })
      } catch {
        /* already exists */
      }
    })

    await test.step('Open theme and preview', async () => {
      await page.goto(`/bots/${botId}/theme`)
      const preview = await waitForPreview(page)
      await expect(preview.locator('text="Go"')).toBeVisible({ timeout: 10000 })
    })

    await test.step('Change host avatar and bubble colors', async () => {
      const accordion = page.locator('button:has-text("Chat")')
      if ((await accordion.getAttribute('aria-expanded')) !== 'true') {
        await accordion.click()
      }

      await expect(page.locator('[data-testid="avatar-placeholder"]').nth(1)).toBeVisible({
        timeout: 20000,
      })
      await page.click('[data-testid="avatar-placeholder"]')
      await page.click('button:has-text("Link")')
      await page.fill('input[placeholder="Paste the image link..."]', hostAvatarUrl)
      await page.waitForTimeout(2000)
      await page.getByRole('button', { name: 'Go' }).click()
      await expect(page.locator('.quickbot img')).toHaveAttribute('src', hostAvatarUrl)

      await page.click('text=Bot avatar')
      await expect(page.locator('.quickbot img')).toBeHidden()
    })

    await test.step('Change button and bubble colors', async () => {
      await page.click('[data-testid="host-bubble-theme"] button:has-text("Background")')
      await page.fill('input[value="#F7F8FF"]', '#2a9d8f')
      await page.click('[data-testid="host-bubble-theme"] button:has-text("Text")')
      await page.fill('input[value="#303235"]', '#ffffff')
      const hostBubble = page.locator('[data-testid="host-bubble"] >> nth=-1')
      await expect(hostBubble).toHaveCSS('background-color', 'rgb(42, 157, 143)')
      await expect(hostBubble).toHaveCSS('color', 'rgb(255, 255, 255)')

      await page.click('[data-testid="buttonsTheme"] button:has-text("Background")')
      await page.fill('input[value="#01a952"]', '#7209b7')
      await page.click('[data-testid="buttonsTheme"] button:has-text("Text")')
      await page.fill('input[value="#FFFFFF"]', '#e9c46a')
      const button = page.getByRole('button', { name: 'Go' })
      await expect(button).toHaveCSS('background-color', 'rgb(114, 9, 183)')
      await expect(button).toHaveCSS('color', 'rgb(233, 196, 106)')
    })

    await test.step('Change guest bubble and input theme', async () => {
      await page.click('[data-testid="guestBubblesTheme"] button:has-text("Background")')
      await page.fill('input[value="#FF8E21"]', '#d8f3dc')
      await page.click('[data-testid="guestBubblesTheme"] button:has-text("Text")')
      await page.fill('input[value="#FFFFFF"]', '#264653')
      const guestBubble = page.locator('[data-testid="guest-bubble"] >> nth=-1')
      await expect(guestBubble).toHaveCSS('background-color', 'rgb(216, 243, 220)')
      await expect(guestBubble).toHaveCSS('color', 'rgb(38, 70, 83)')

      await page.click('text=User avatar')
      await page.click('[data-testid="avatar-placeholder"]')
      await page.click('button:has-text("Link")')
      await page.fill('input[placeholder="Paste the image link..."]', guestAvatarUrl)
      await page.getByRole('button', { name: 'Go' }).click()
      await expect(page.getByRole('img', { name: 'Bot avatar' }).nth(2)).toHaveAttribute(
        'src',
        guestAvatarUrl,
      )

      await page.click('[data-testid="inputsTheme"] button:has-text("Background")')
      await page.fill('input[value="#FFFFFF"]', '#ffe8d6')
      await page.click('[data-testid="inputsTheme"] button:has-text("Text")')
      await page.fill('input[value="#303235"]', '#023e8a')
      const input = page.locator('.input')
      await expect(input).toHaveCSS('background-color', 'rgb(255, 232, 214)')
      await expect(input).toHaveCSS('color', 'rgb(2, 62, 138)')
    })
  })

  test('Should reflect custom CSS changes in real time', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot with theme config', async () => {
      await importBotInDatabase(getTestAsset('bots/theme.json'), { id: botId })
    })

    await test.step('Open theme page and apply custom CSS', async () => {
      await page.goto(`/bots/${botId}/theme`)
      const preview = await waitForPreview(page)
      await expect(preview.locator('text="Go"')).toBeVisible({ timeout: 10000 })

      const accordion = page.locator('button:has-text("Custom CSS")')
      if ((await accordion.getAttribute('aria-expanded')) !== 'true') {
        await accordion.click()
      }

      await page.fill('div[role="textbox"]', '.button {background-color: green}')
      await expect(page.getByRole('button', { name: 'Go' })).toHaveCSS(
        'background-color',
        'rgb(0, 128, 0)',
      )
    })
  })

  test('Should handle template creation and gallery', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot with theme config', async () => {
      await importBotInDatabase(getTestAsset('bots/theme.json'), { id: botId })
    })

    await test.step('Open theme page and preview', async () => {
      await page.goto(`/bots/${botId}/theme`)
      const preview = await waitForPreview(page)
      await expect(preview.locator('text="Go"')).toBeVisible({ timeout: 10000 })
    })

    await test.step('Create, rename, and delete a template', async () => {
      const accordion = page.locator('button:has-text("Templates")')
      if ((await accordion.getAttribute('aria-expanded')) !== 'true') {
        await accordion.click()
      }

      await page.getByRole('button', { name: 'Save current theme' }).click()
      await page.getByPlaceholder('My template').fill('My awesome theme')
      await page.getByRole('button', { name: 'Save' }).click()

      await page.getByRole('button', { name: 'Open template menu' }).click()
      await page.getByRole('menuitem', { name: 'Rename' }).click()
      await page.getByPlaceholder('My template').fill('My awesome theme 2')
      await page.getByRole('button', { name: 'Save as new template' }).click()
      await expect(page.getByRole('button', { name: 'Open template menu' })).toHaveCount(2)
      await page.getByRole('button', { name: 'Open template menu' }).first().click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await expect(page.getByText('My awesome theme 2')).toBeHidden()
    })

    await test.step('Apply theme from gallery', async () => {
      await page.getByRole('button', { name: 'Gallery' }).click()
      await page.getByText('Bot Dark').click()
      await expect(page.getByTestId('host-bubble')).toHaveCSS('background-color', 'rgb(30, 41, 59)')
    })
  })

  test('Should prevent free workspace from removing branding', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot with free workspace', async () => {
      await importBotInDatabase(getTestAsset('bots/settings.json'), {
        id: botId,
        workspaceId: freeWorkspaceId,
      })
    })

    await test.step('Try to remove branding and show lock notice', async () => {
      await page.goto(`/bots/${botId}/theme`)
      const preview = await waitForPreview(page)
      await expect(preview.locator('text="Go"')).toBeVisible({ timeout: 10000 })
      await expect(preview.locator(`text="What's your name?"`)).toBeVisible({ timeout: 10000 })
      await preview.getByRole('button', { name: 'Global' }).click()
      await expect(preview.getByRole('button', { name: 'Remove bot brand' })).toBeVisible({
        timeout: 10000,
      })
      await preview.getByRole('button', { name: 'Remove bot brand' }).hover()
      await expect(
        preview.locator('text="You need to upgrade your plan in order to remove branding"'),
      ).toBeVisible({ timeout: 20000 })
    })
  })
})
