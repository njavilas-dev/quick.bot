
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { defaultPhoneInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/phone/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > Phone Input", () => {
  test("Should handle phone input block functionality", async ({ page }) => {
    const botId = createId();

    await test.step("Create bot", async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Test phone',
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.PHONE,
          }),
        },
      ]);
    });

    await test.step("Options should work", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click(`text=${defaultPhoneInputOptions.labels.placeholder}`);
      await page.getByLabel('Placeholder:').fill('+33 XX XX XX XX');
      await page.getByLabel('Button label:').fill('Go');
      await page.fill(`input[value="${defaultPhoneInputOptions.retryMessageContent}"]`, 'Try again bro');
    });

    await test.step("Preview bot flow", async () => {
      const preview = await waitForPreview(page);
      await preview.getByPlaceholder('+33 XX XX XX XX').waitFor({ state: 'visible' });
      await preview.getByPlaceholder('+33 XX XX XX XX').fill('+33 6 73');
      await preview.getByRole('button', { name: 'Go' }).click();
      await expect(preview.getByText('Try again bro')).toBeVisible({ timeout: 20000 });
      await preview.getByPlaceholder('+33 XX XX XX XX').fill('+33 6 73 54 45 67');
      await preview.getByRole('button', { name: 'Go' }).click();
      await preview.getByText('+33 6 73 54 45 67');
    });
  });
});
