
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > Logic > Jump", () => {
  test("Should work as expected", async ({ page }) => {
    const botId = createId();
    await test.step("Import bot into database", async () => {
      await importBotInDatabase(getTestAsset('bots/logic/jump.json'), {
        id: botId,
      });
    });

    await test.step("Navigate to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Configure bot flow", async () => {
      await page.getByText('Configure...').click();
      await page.getByRole('button', { name: 'Select a group' }).click();
      await expect(page.getByRole('menuitem', { name: 'Group #2' })).toBeHidden();
      await page.getByRole('menuitem', { name: 'Group #1' }).click();
      await page.getByRole('button', { name: 'Select a block' }).click();
      await page.getByRole('menuitem', { name: 'Block #2' }).click();
    });

    await test.step("Preview and interact with bot flow", async () => {
      const preview = await waitForPreview(page);
      await page.getByRole('textbox', { name: 'Type your answer...' }).fill('Hi there!');
      await page.getByRole('button', { name: 'Send' }).click();
      await expect(preview.getByText('How are you?').nth(1)).toBeVisible({ timeout: 20000 });
      await expect(preview.getByText('Hello this is a test!').nth(1)).toBeHidden();
    });
  });
});
