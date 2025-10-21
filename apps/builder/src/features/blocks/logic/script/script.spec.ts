
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const botId = createId();

test.describe('Blocks > Script', () => {
  test('Should trigger script', async ({ page }) => {
    await test.step('Import bot in database', async () => {
      await importBotInDatabase(getTestAsset('bots/logic/script.json'), {
        id: botId,
      });
    });

    await test.step('Navigate to bot flow and configure script', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Configure...');
      await page.fill('div[role="textbox"]', 'window.location.href = "https://www.google.com"');
    });

    await test.step('Preview bot flow and trigger code', async () => {
      const preview = await waitForPreview(page);
      await preview.getByRole('button', { name: 'Trigger code' }).click();
      await expect(page).toHaveURL(/https:\/\/www\.google\.com/);
    });
  });
});
