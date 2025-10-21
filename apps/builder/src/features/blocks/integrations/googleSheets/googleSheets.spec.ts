
import test, { expect } from '@playwright/test';
import { env } from '@quickbot.io/env';
import { importBotInDatabase } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { selectVariable, insertVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe('Blocks > Google Sheets Integration', () => {
  test.beforeAll(async () => {
    await test.step('Access token should be defined', async () => {
      expect(env.PLAYWRIGHT_GOOGLE_ACCESS_TOKEN).toBeDefined();
    });

    await test.step('Refresh token should be defined', async () => {
      expect(env.PLAYWRIGHT_GOOGLE_REFRESH_TOKEN).toBeDefined();
    });
  });

  test('Should insert row in Google Sheets', async ({ page }) => {
    const botId = createId();

    await test.step('Import bot with Google Sheets block', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/googleSheets.json'), {
        id: botId,
      });
    });

    await test.step('Configure Insert Row operation', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Start').waitFor({ timeout: 20000 });
      await page.click('text=Configure...');
      await page.click('text=Select Sheets account');
      await page.click('text=services@urbiport.com');
      await page.getByRole('button', { name: 'Select the sheet' }).click({ timeout: 10000 });
      await page.click('text=Tab 1');
      await page.getByRole('button', { name: 'Select an operation' }).click();
      await page.getByRole('menuitem', { name: 'Insert a row' }).click();

      // Add values
      await page.click('text=Add a value');
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'Email' }).click();
      await insertVariable(page, 'Email');

      await page.click('text=Add a value');
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'First name' }).click();
      await page.fill('input[placeholder="Type a value..."] >> nth=1', 'John');
    });

    await test.step('Preview and validate inserted row', async () => {
      const preview = await waitForPreview(page);

      await preview.locator('input[placeholder="Type your email..."]').fill('google.sheets@test.com');
      await preview.locator('input[placeholder="Type your email..."]').press('Enter');
      await expect(page.getByText('Succesfully inserted row in BotSheet > Tab 1')).toBeVisible({ timeout: 20000 });
    });
  });

  test('Should update row in Google Sheets', async ({ page }) => {
    const botId = createId();

    await test.step('Import bot with Google Sheets block', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/googleSheets.json'), {
        id: botId,
      });
    });

    await test.step('Configure Update Row operation', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Start').waitFor({ timeout: 20000 });
      await page.click('text=Configure...');
      await page.click('text=Select Sheets account');
      await page.click('text=services@urbiport.com');
      await page.getByRole('button', { name: 'Select the sheet' }).click({ timeout: 10000 });
      await page.click('text=Tab 1');
      await page.getByRole('button', { name: 'Select an operation' }).click();
      await page.getByRole('menuitem', { name: 'Update a row' }).click();

      // Filter rule
      await page.getByRole('button', { name: 'Row(s) to update' }).click();
      await page.getByRole('button', { name: 'Add filter rule' }).click();
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'Email' }).click();
      await page.getByRole('button', { name: 'Select an operator' }).click();
      await page.getByRole('menuitem', { name: 'Equal to' }).click();
      await insertVariable(page, 'Email');

      // Cells to update
      await page.getByRole('button', { name: 'Cells to update' }).click();
      await page.click('text=Add a value');
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'Last name' }).click();
      await page.fill('input[placeholder="Type a value..."] >> nth=1', 'Doe');
    });

    await test.step('Preview and validate updated row', async () => {
      const preview = await waitForPreview(page);

      await preview.locator('input[placeholder="Type your email..."]').fill('google.sheets@test.com');
      await preview.locator('input[placeholder="Type your email..."]').press('Enter');
      await expect(page.getByText('Succesfully updated matching rows')).toBeVisible({ timeout: 60000 });
    });
  });

  test('Should get row from Google Sheets', async ({ page }) => {
    const botId = createId();

    await test.step('Import bot with Google Sheets block', async () => {
      await importBotInDatabase(getTestAsset('bots/integrations/googleSheets.json'), {
        id: botId,
      });
    });

    await test.step('Configure Get Row operation', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Start').waitFor({ timeout: 20000 });
      await page.click('text=Configure...');
      await page.click('text=Select Sheets account');
      await page.click('text=services@urbiport.com');
      await page.getByRole('button', { name: 'Select the sheet' }).click({ timeout: 10000 });
      await page.click('text=Tab 1');
      await page.getByRole('button', { name: 'Select an operation' }).click();
      await page.getByRole('menuitem', { name: 'Get data from sheet' }).click();

      // Filter rules
      await page.getByRole('button', { name: 'Select row(s)' }).click();
      await page.getByRole('button', { name: 'Add filter rule' }).click();
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'Email' }).click();
      await page.getByRole('button', { name: 'Select an operator' }).click();
      await page.getByRole('menuitem', { name: 'Equal to' }).click();
      await insertVariable(page, 'Email');
      await page.getByRole('button', { name: 'Add filter rule' }).click();
      await page.getByRole('button', { name: 'AND', exact: true }).click();
      await page.getByRole('menuitem', { name: 'OR' }).click();

      // Select columns
      await page.getByRole('button', { name: 'Columns to extract' }).click();
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'Email' }).click();
      await page.getByRole('button', { name: 'Select an operator' }).click();
      await page.getByRole('menuitem', { name: 'Equal to' }).click();
      await page.getByPlaceholder('Type a value...').nth(-1).fill('google.sheets@test.com');

      // Create First name var
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'First name' }).click();
      await selectVariable(page, 'First name');

      // Create Last name var
      await page.locator('text=Add a value').nth(-1).click();
      await page.click('text=Select a column');
      await page.getByRole('menuitem', { name: 'Last name' }).click();
      await selectVariable(page, 'Last name');
    });

    await test.step('Preview and validate fetched data', async () => {
      const preview = await waitForPreview(page);
      await preview.locator('input[placeholder="Type your email..."]').fill('google.sheets@test.com');
      await preview.locator('input[placeholder="Type your email..."]').press('Enter');
      await expect(preview.locator('text=John')).toBeVisible({ timeout: 20000 });
    });
  });
});
