import test, { expect, Page } from '@playwright/test'
import { importBotInDatabase, apiToken } from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { getTestAsset } from '@/test/utils/getTestAsset'
import { env } from '@quickbot.io/env'
import { omit } from '@quickbot.io/lib/utils'
import { selectVariable } from '@quickbot.io/playwright/testHelpers'

const addTestVariable = async (page: Page, name: string, value: string) => {
  await page.click('text=Add an entry')
  await selectVariable(page, name, -1)
  await page.getByLabel('Test value:').nth(-1).fill(value)
}

test.describe.configure({ mode: 'parallel' })

test.describe('Blocks > HTTP Request', () => {
  test('Should configure editor correctly', async ({ page }) => {
    const botId = createId()

    await test.step('Import bot into database', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/webhook.json'), {
        id: botId,
      })
    })

    await test.step('Navigate to bot flow and configure', async () => {
      await page.goto(`/bots/${botId}/flow`)
      await page.click('text=Configure...')
      await page.fill(
        'input[placeholder="Paste URL..."]',
        `${env.NEXTAUTH_URL}/api/mock/webhook-easy-config`,
      )
      await page.click('text=Test the request')
      await expect(page.locator('div[role="textbox"] >> nth=-1')).toContainText(
        `"secret 1": "Go"`,
        { timeout: 20000 },
      )
    })

    await test.step('Advanced configuration', async () => {
      await page.fill('input[placeholder="Paste URL..."]', `${env.NEXTAUTH_URL}/api/mock/webhook`)
      await page.click('text=Advanced configuration')

      await page.click('text=Query params')
      await page.click('text=Add a param')
      await page.fill('input[placeholder="e.g. email"]', 'firstParam')
      await page.fill('input[placeholder="e.g. {{Email}}"]', '{{secret 1}}')

      await page.click('text=Add a param')
      await page.fill('input[placeholder="e.g. email"] >> nth=1', 'secondParam')
      await page.fill('input[placeholder="e.g. {{Email}}"] >> nth=1', '{{secret 2}}')

      await page.click('text=Headers')
      await page.waitForTimeout(200)
      await page.getByRole('button', { name: 'Add a value' }).click()
      await page.fill('input[placeholder="e.g. Content-Type"]', 'Custom-Bot')
      await page.fill('input[placeholder="e.g. application/json"]', '{{secret 3}}')

      await page.click('text=Body')
      await page.click('text=Custom body')
      await page.fill('div[role="textbox"]', '{ "customField": "{{secret 4}}" }')
    })

    await test.step('Set variable values for test', async () => {
      await page.click('text=Variable values for test')
      await addTestVariable(page, 'secret 1', 'secret1')
      await addTestVariable(page, 'secret 2', 'secret2')
      await addTestVariable(page, 'secret 3', 'secret3')
      await addTestVariable(page, 'secret 4', 'secret4')
    })

    await test.step('Test the request and save variables', async () => {
      await page.click('text=Test the request')
      await expect(page.locator('div[role="textbox"] >> nth=-1')).toContainText('"statusCode": 200')

      await page.click('text=Save in variables')
      await page.click('text=Add an entry >> nth=-1')

      const maxRetries = 3
      let retries = 0
      let isModalVisible = false

      while (!isModalVisible && retries < maxRetries) {
        await page.click('input[placeholder="Select the data"]')
        try {
          await page
            .locator('text="data.flatMap(item => item.name)"')
            .waitFor({ state: 'visible', timeout: 5000 })
          isModalVisible = true
        } catch {
          retries++
          console.log(`Retrying to open the modal: Attempt ${retries}`)
        }
      }

      if (!isModalVisible) {
        throw new Error('The modal did not open after multiple attempts')
      }
    })
  })

  test('Should handle Webhook API endpoints', async ({ request }) => {
    const botId = createId()

    await test.step('Import bot into database', async () => {
      await importBotInDatabase(getTestAsset('bots/api.json'), {
        id: botId,
      })
    })

    await test.step('GET webhook blocks', async () => {
      const getResponse = await request.get(`/api/v1/bots/${botId}/webhookBlocks`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      })
      const { webhookBlocks } = await getResponse.json()
      expect(webhookBlocks).toHaveLength(1)
      expect(webhookBlocks[0]).toEqual({
        id: 'webhookBlock',
        label: 'HTTP Request > webhookBlock',
        type: 'http request',
      })
    })

    await test.step('Subscribe webhook', async () => {
      const url = 'https://test.com'
      const subscribeResponse = await request.post(
        `/api/v1/bots/${botId}/webhookBlocks/webhookBlock/subscribe`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          data: { url },
        },
      )
      expect(await subscribeResponse.json()).toEqual({
        id: 'webhookBlock',
        url,
      })
    })

    await test.step('Unsubscribe webhook', async () => {
      const unsubResponse = await request.post(
        `/api/v1/bots/${botId}/webhookBlocks/webhookBlock/unsubscribe`,
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      )
      expect(await unsubResponse.json()).toEqual({
        id: 'webhookBlock',
        url: null,
      })
    })

    await test.step('Get sample result', async () => {
      const sampleResponse = await request.get(
        `/api/v1/bots/${botId}/webhookBlocks/webhookBlock/getResultExample`,
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        },
      )
      const sample = await sampleResponse.json()

      expect(omit(sample.resultExample, 'submittedAt')).toMatchObject({
        message: 'This is a sample result, it has been generated ⬇️',
        Welcome: 'Hi!',
        Email: 'user.primary@test.com',
        Name: 'answer value',
        Services: 'Website dev, Content Marketing, Social Media, UI / UX Design',
        'Additional information': 'answer value',
      })
    })
  })
})
