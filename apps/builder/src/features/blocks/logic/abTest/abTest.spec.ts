
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const botId = createId();

test.describe('Blocks > AB Test', () => {
  test('Should configure AB Test block correctly', async ({ page }) => {
    await test.step('Import bot configuration into database', async () => {
      await importBotInDatabase(getTestAsset('bots/logic/abTest.json'), {
        id: botId,
      });
    });

    await test.step('Navigate to bot flow page', async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step('Configure AB Test percentages', async () => {
      await page.getByRole('button', { name: 'A 50%' }).click({ timeout: 10000 });
      await page.getByLabel('Percent of users to follow A:').fill('100');
      await page.getByRole('button', { name: 'A 100%' }).click();
      await page.getByRole('button', { name: 'B 0%' }).click();
    });

    await test.step('Preview bot flow and verify output', async () => {
      const preview = await waitForPreview(page);
      await expect(preview.getByText('How are you?')).toBeVisible({ timeout: 20000 });
    });
  });
});
