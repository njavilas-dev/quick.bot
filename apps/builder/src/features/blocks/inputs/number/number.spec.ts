import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { defaultNumberInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/number/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > Number Input", () => {
  test("Should work for number input block", async ({ page }) => {
    const botId = createId();

    await test.step("Create bot", async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.NUMBER,
          }),
        },
      ]);
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Preview: default number input", async () => {
      const preview = await waitForPreview(page);
      await expect(
        preview.locator(`input[placeholder="${defaultNumberInputOptions.labels.placeholder}"]`)
      ).toHaveAttribute('type', 'number');
    });

    await test.step("Options: update placeholder and limits", async () => {
      await page.click(`text=${defaultNumberInputOptions.labels.placeholder}`);
      await page.getByLabel('Placeholder:').fill('Your number...');
      await expect(page.locator('text=Your number...')).toBeVisible({ timeout: 20000 });
      await page.getByLabel('Button label:').fill('Go');
      await page.fill('[role="spinbutton"] >> nth=0', '0');     // min
      await page.fill('[role="spinbutton"] >> nth=1', '100');   // max
      await page.fill('[role="spinbutton"] >> nth=2', '10');    // step
    });

    await test.step("Preview: validate number input", async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);
      const input = preview.locator(`input[placeholder="Your number..."]`);

      await input.fill('-1');
      await input.press('Enter');

      await input.fill('150');
      await input.press('Enter');

      await input.fill('50');
      await input.press('Enter');

      await expect(preview.locator('text=50')).toBeVisible({ timeout: 20000 });
    });
  });
});