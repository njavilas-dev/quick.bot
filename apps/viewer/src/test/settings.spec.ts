import test, { expect } from '@playwright/test'
import { env } from '@quickbot.io/env'
import { createId } from '@quickbot.io/lib/createId'
import { createBots, updateBot, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { Settings } from '@quickbot.io/schemas'
import { defaultTextInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/text/constants'

test('Result should be overwritten on page refresh', async ({ page }) => {
  const botId = createId()
  await createBots([
    {
      id: botId,
      settings: {
        general: {
          rememberUser: {
            isEnabled: true,
            storage: 'session',
          },
        },
      },
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])

  const [, response] = await Promise.all([
    page.goto(`/${botId}-public`),
    page.waitForResponse(/startChat/),
  ])
  const { resultId } = await response.json()
  expect(resultId).toBeDefined()
  await expect(page.getByRole('textbox')).toBeVisible()

  const [, secondResponse] = await Promise.all([page.reload(), page.waitForResponse(/startChat/)])
  const { resultId: secondResultId } = await secondResponse.json()
  expect(secondResultId).toBe(resultId)
})

test.describe('Create result on page refresh enabled', () => {
  test('should work', async ({ page }) => {
    const botId = createId()
    await createBots([
      {
        id: botId,
        ...parseDefaultGroupWithBlock({
          type: InputBlockType.TEXT,
        }),
      },
    ])
    const [, response] = await Promise.all([
      page.goto(`/${botId}-public`),
      page.waitForResponse(/startChat/),
    ])
    const { resultId } = await response.json()
    expect(resultId).toBeDefined()

    await expect(page.getByRole('textbox')).toBeVisible()
    const [, secondResponse] = await Promise.all([page.reload(), page.waitForResponse(/startChat/)])
    const { resultId: secondResultId } = await secondResponse.json()
    expect(secondResultId).not.toBe(resultId)
  })
})

test('Hide query params', async ({ page }) => {
  const botId = createId()
  await createBots([
    {
      id: botId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])
  await page.goto(`/${botId}-public?Name=John`)
  await page.waitForTimeout(1000)
  expect(page.url()).toEqual(`${env.NEXT_PUBLIC_VIEWER_URL}/${botId}-public`)
  await updateBot({
    id: botId,
    settings: {
      general: { isHideQueryParamsEnabled: false },
    },
  })
  await page.goto(`/${botId}-public?Name=John`)
  await page.waitForTimeout(1000)
  expect(page.url()).toEqual(`${env.NEXT_PUBLIC_VIEWER_URL}/${botId}-public?Name=John`)
})

test('Show close message', async ({ page }) => {
  const botId = createId()
  await createBots([
    {
      id: botId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
      isClosed: true,
    },
  ])
  await page.goto(`/${botId}-public`)
  await expect(page.locator('text=This bot is now closed')).toBeVisible()
})

test('Should correctly parse metadata', async ({ page }) => {
  const botId = createId()
  const customMetadata: Settings['metadata'] = {
    description: 'My custom description',
    title: 'Custom title',
    favIconUrl: 'https://placehold.co/32x32/EEEEEE/333333.png',
    imageUrl: 'https://placehold.co/600x400/EEEEEE/333333.png',
    customHeadCode: '<meta name="author" content="Francisco">',
  }
  await createBots([
    {
      id: botId,
      settings: {
        metadata: customMetadata,
      },
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
      }),
    },
  ])
  await page.goto(`/${botId}-public`)
  expect(await page.evaluate(`document.querySelector('title').textContent`)).toBe(
    customMetadata.title,
  )
  expect(
    await page.evaluate(
      () => (document.querySelector('meta[name="description"]') as HTMLMetaElement).content,
    ),
  ).toBe(customMetadata.description)
  expect(
    await page.evaluate(
      () => (document.querySelector('meta[property="og:image"]') as HTMLMetaElement).content,
    ),
  ).toBe(customMetadata.imageUrl)
  expect(
    await page.evaluate(() =>
      (document.querySelector('link[rel="icon"]') as HTMLLinkElement).getAttribute('href'),
    ),
  ).toBe(customMetadata.favIconUrl)
  await expect(
    page.locator(`textarea[placeholder="${defaultTextInputOptions.labels.placeholder}"]`),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => (document.querySelector('meta[name="author"]') as HTMLMetaElement).content,
    ),
  ).toBe('Francisco')
})
