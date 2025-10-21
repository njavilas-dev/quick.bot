
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const botId = createId();

test.describe("Blocks > Wait block", () => {
  test("Should configure and preview wait block", async ({ page }) => {
    await test.step("Setup bot", async () => {
      await importBotInDatabase(getTestAsset('bots/logic/wait.json'), {
        id: botId,
      });
    });
    await test.step("Setup options", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Configure...');
      await page.getByRole('textbox', { name: 'Seconds to wait for:' }).fill('3');
    });
    await test.step("Preview: record and send audio", async () => {
      const preview = await waitForPreview(page);
      await preview.getByRole('button', { name: 'Wait now' }).click();
      await expect(preview.locator('text="Hi there!"')).toBeHidden({ timeout: 20000 });
      await expect(preview.locator('text="Hi there!"')).toBeVisible({ timeout: 20000 });
    });
  });
});
