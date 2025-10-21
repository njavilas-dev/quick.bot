import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'

const botId = createId()

const chatwootTestWebsiteToken = 'tueXiiqEmrWUCZ4NUyoR7nhE'

test('should work as expected', async ({ page }) => {
  await createBots([
    {
      id: botId,
      ...parseDefaultGroupWithBlock(
        {
          type: IntegrationBlockType.CHATWOOT,
          options: {
            websiteToken: chatwootTestWebsiteToken,
          },
        },
        { withGoButton: true },
      ),
    },
  ])
  await page.goto(`/${botId}-public`)
  await page.getByRole('button', { name: 'Go' }).click()
  await expect(page.locator('#chatwoot_live_chat_widget')).toBeVisible()
})
