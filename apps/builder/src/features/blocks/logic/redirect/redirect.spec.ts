
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const botId = createId();

test.describe('Blocks > Redirect', () => {
  test('Should configure redirect block correctly', async ({ page, context }) => {
    await test.step('Import bot into database', async () => {
      await importBotInDatabase(getTestAsset('bots/logic/redirect.json'), {
        id: botId,
      });
    });

    await test.step('Navigate to bot flow and configure redirect', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Configure...');
      await page.fill('input[placeholder="Type a URL..."]', 'google.com');
    });

    await test.step('Preview bot flow and verify redirection', async () => {
      let preview = await waitForPreview(page);
      await preview.locator('text=Go to URL').click();
      await expect(page).toHaveURL(/https:\/\/www\.google\.com/);
      await page.goBack();

      await page.click('text=Redirect to google.com');
      await page.click('text=Open in new tab');

      preview = await waitForPreview(page);
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        preview.locator('text=Go to URL').click(),
      ]);
      await newPage.waitForLoadState();
      await expect(newPage).toHaveURL(/https:\/\/www\.google\.com/);
    });
  });
});
