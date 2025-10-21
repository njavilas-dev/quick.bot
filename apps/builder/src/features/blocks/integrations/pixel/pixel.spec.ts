
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > Pixel", () => {
  test("Should configure and display preview notice", async ({ page }) => {
    const botId = createId();

    await test.step("Create bot with Pixel block", async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: IntegrationBlockType.PIXEL,
          }),
        },
      ]);
    });

    await test.step("Configure Pixel ID and event", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Configure...');
      await page.getByPlaceholder('Pixel ID (e.g. 123456789)').fill('pixelid');
      await expect(page.getByText('Init Pixel')).toBeVisible({ timeout: 20000 });

      await page.getByText('Track event').click();
      await page.getByRole('button', { name: 'Select event type' }).click();
      await page.getByRole('menuitem', { name: 'Lead' }).click();
      await expect(page.getByText('Track "Lead"')).toBeVisible({ timeout: 20000 });

      await page.getByRole('button', { name: 'Add parameter' }).click();
      await page.getByRole('button', { name: 'Select key' }).click();
      await page.getByRole('menuitem', { name: 'currency' }).click();
      await page.getByPlaceholder('Value').fill('USD');
    });

    await test.step("Preview bot and verify Pixel notice", async () => {
      await waitForPreview(page);
      await expect(page.getByText('Pixel is not enabled in Preview mode')).toBeVisible({ timeout: 20000 });
    });
  });
});
