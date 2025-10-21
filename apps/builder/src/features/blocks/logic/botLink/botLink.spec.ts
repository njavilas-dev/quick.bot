
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > BotLink", () => {
  test("Should be configurable", async ({ page }) => {
    const botId = createId();
    const linkedBotId = createId();

    await test.step("Import bots into the database", async () => {
      await importBotInDatabase(getTestAsset('bots/logic/linkBots/1.json'), {
        id: botId,
        name: 'My link bot 1',
      });
      await importBotInDatabase(getTestAsset('bots/logic/linkBots/2.json'), {
        id: linkedBotId,
        name: 'My link bot 2',
      });
    });

    await test.step("Navigate to the bot editor and configure linked bot", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Configure...');
      await page.locator('text="Select a bot"').waitFor({ state: 'visible', timeout: 20000 });
      await page.getByRole('button', { name: 'Select a bot' }).click();
      await page.locator('input[placeholder="Select a bot"]').nth(0).fill('My link bot 2');
      await page.click('text=My link bot 2');
      await expect(page.getByText('Jump in My link bot 2')).toBeVisible({ timeout: 20000 });
    });

    await test.step("Navigate to linked bot and back", async () => {
      await page.click('[aria-label="Navigate to bot"]');
      await expect(page).toHaveURL(`/bots/${linkedBotId}/flow?parentId=${botId}`);
      await page.waitForTimeout(500);
      await page.click('[aria-label="Navigate back"]');
      await expect(page).toHaveURL(`/bots/${botId}/flow`);
    });

    await test.step("Jump to linked bot and configure group", async () => {
      await page.click('text=Jump in My link bot 2');
      await expect(page.getByText('Jump in My link bot 2')).toBeVisible({ timeout: 20000 });
      await page.getByRole('button', { name: 'Select a group' }).click();
      await page.click('text=Group #2');
    });

    await test.step("Preview and verify linked bot group", async () => {
      const preview = await waitForPreview(page);

      await expect(preview.locator('text=Second block')).toBeVisible({ timeout: 20000 });
    });

    await test.step("Clear group and verify input interaction", async () => {
      await page.click('[aria-label="Close"]');
      await page.click('text=Jump to Group #2 in My link bot 2');
      await page.getByRole('button', { name: 'Group #2' }).click();
      await page.locator('[aria-label="Clear"]').nth(1).click();
      const preview = await waitForPreview(page);
      await preview.getByPlaceholder('Type your answer...').fill('Hello there!');
      await preview.getByPlaceholder('Type your answer...').press('Enter');
      await expect(preview.locator('text=Hello there!')).toBeVisible({ timeout: 20000 });
    });

    await test.step("Configure and preview \"Hello\" group", async () => {
      await page.click('[aria-label="Close"]');
      await page.click('text=Jump in My link bot 2');

      await page.getByRole('button', { name: 'My link bot 2' }).click();

      await page.locator('input[placeholder="Select a bot"]').fill('Current bot');
      await page.waitForTimeout(500);

      const currentBotOption = page.locator('[role="menuitem"]').filter({ hasText: 'Current bot' }).first();
      await currentBotOption.waitFor({ state: 'visible', timeout: 10000 });
      await currentBotOption.click();

      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Select a group' }).click();
      await page.waitForTimeout(1000);

      await page.locator('input[placeholder="Select a group"]').fill('Hello');
      await page.waitForTimeout(1000);

      const helloGroupOption = page.locator('[role="menuitem"]').filter({ hasText: 'Hello' }).first();
      await helloGroupOption.waitFor({ state: 'visible', timeout: 10000 });
      await helloGroupOption.click();

      await page.waitForTimeout(2000);
      const preview = await waitForPreview(page);

      await expect(preview).toBeVisible({ timeout: 20000 });

      await expect(preview.getByText('Hello world')).toBeVisible({ timeout: 30000 });
    });
  });
});
