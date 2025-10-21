
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { selectVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers';

const botId = createId();

test.describe('Blocks > Condition', () => {
  test('Should configure condition block correctly', async ({ page }) => {
    await test.step('Import condition bot into the database', async () => {
      await importBotInDatabase(getTestAsset('bots/logic/condition.json'), {
        id: botId,
      });
    });

    await test.step('Configure condition group 1: Age > 80 and < 100', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Configure... >> nth=0', { force: true });

      await selectVariable(page, 'Age', 0);

      await page.click('button:has-text("Select an operator")');
      await page.click('button:has-text("Greater than")', { force: true });

      await page.fill('input[placeholder="Type a number..."]', '80');

      await page.click('button:has-text("Add comparison")');

      await selectVariable(page, 'Age', 1);

      await page.click('button:has-text("Select an operator")');
      await page.click('button:has-text("Less than")', { force: true });

      await page.fill(':nth-match(input[placeholder="Type a number..."], 2)', '100');
    });

    await test.step('Configure condition group 2: Age > 20', async () => {
      await page.click('text=Configure...', { force: true });

      await selectVariable(page, 'Age', 0);

      await page.click('button:has-text("Select an operator")');
      await page.click('button:has-text("Greater than")', { force: true });

      await page.fill('input[placeholder="Type a number..."]', '20');
    });

    await test.step('Preview: age < 20', async () => {
      const preview = await waitForPreview(page);
      await preview.locator('input[placeholder="Type a number..."]').fill('15');
      await preview.locator('text=Send').click();
      await expect(preview.getByText('You are younger than 20')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Preview: 20 < age < 80', async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);

      await preview.locator('input[placeholder="Type a number..."]').fill('45');
      await preview.locator('text=Send').click();
      await expect(preview.getByText('You are older than 20')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Preview: 80 < age < 100', async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);

      await preview.locator('input[placeholder="Type a number..."]').fill('90');
      await preview.locator('text=Send').click();
      await expect(preview.getByText('You are older than 80')).toBeVisible({ timeout: 20000 });
    });
  });
});
