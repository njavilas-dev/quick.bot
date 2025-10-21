
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants';
import { defaultChatwootOptions } from '@quickbot.io/schemas/features/blocks/integrations/chatwoot/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const botId = createId();

const chatwootTestWebsiteToken = 'tueXiiqEmrWUCZ4NUyoR7nhE';

test.describe('Blocks > Chatwoot', () => {
  test('Should be configurable', async ({ page }) => {
    await test.step('Create bots with Chatwoot integration block', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: IntegrationBlockType.CHATWOOT,
          }),
        },
      ]);
    });

    await test.step('Navigate to bot flow and open configuration', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.getByText('Configure...').click();
    });

    await test.step('Verify base URL and fill website token', async () => {
      await expect(page.getByLabel('Base URL')).toHaveAttribute(
        'value',
        defaultChatwootOptions.baseUrl,
      );
      await page.getByLabel('Website token').fill(chatwootTestWebsiteToken);
    });

    await test.step('Open Chatwoot and set user details', async () => {
      await expect(page.getByText('Open Chatwoot')).toBeVisible({ timeout: 20000 });
      await page.getByRole('button', { name: 'Set user details' }).click();
      await page.getByLabel('ID').fill('123');
      await page.getByLabel('Name').fill('John');
      await page.getByLabel('Email').fill('john@gmail.com');
      await page.getByLabel('Avatar URL').fill('https://my-site.com/avatar.png');
      await page.getByLabel('Phone number').fill('+33654347543');
    });

    await test.step('Preview bot flow and verify unsupported message', async () => {
      await waitForPreview(page);
      await expect(page.getByText('Chatwoot block is not supported in preview').nth(0)).toBeVisible({ timeout: 20000 });
    });
  });
});
