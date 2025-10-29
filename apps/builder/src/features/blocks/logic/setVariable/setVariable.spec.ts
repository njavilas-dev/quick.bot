
import test, { expect } from '@playwright/test';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { selectVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe.configure({ mode: 'parallel' });

test.describe('Blocks > SetVariable', () => {
  test('Should configure variables correctly', async ({ page }) => {
    const botId = createId();

    await test.step('Import bot data into the database', async () => {
      await importBotInDatabase(getTestAsset('bots/logic/setVariable.json'), { id: botId });
    });

    await test.step('Navigate to bot editor', async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step('Create variable "Num"', async () => {
      await page.click('text=Type a number...');
      await selectVariable(page, 'Num');
    });

    await test.step('Create variable "Total"', async () => {
      await page.click('text=Click to edit...', { force: true });
      await selectVariable(page, 'Total');
      await page.locator('textarea').fill('1000 * {{Num}}');
    });

    await test.step('Create variable "Custom var"', async () => {
      await page.click('text=Click to edit...', { force: true });
      await selectVariable(page, 'Custom var');
      await page.locator('textarea').fill('Custom value');
    });

    await test.step('Create variable "Addition"', async () => {
      await page.click('text=Click to edit...', { force: true });
      await selectVariable(page, 'Addition');
      await page.locator('textarea').fill('1000 + {{Total}}');
    });

    await test.step('Test the variables in preview', async () => {
      const preview = await waitForPreview(page);

      await preview.locator('input[placeholder="Type a number..."]').fill('365');
      await preview.locator('text=Send').click();

      await expect(preview.locator('text=Multiplication: 365000')).toBeVisible({ timeout: 20000 });
      await expect(preview.locator('text=Custom var: Custom value')).toBeVisible({ timeout: 20000 });
      await expect(preview.locator('text=Addition: 366000')).toBeVisible({ timeout: 20000 });
    });
  });

});
