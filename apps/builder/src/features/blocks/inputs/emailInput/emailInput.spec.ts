
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { defaultEmailInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/email/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > EmailInput", () => {
  test("Should handle email input block functionality", async ({ page }) => {
    const botId = createId();

    await test.step("Create bot", async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Test Email',
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.EMAIL,
          }),
        },
      ]);
    });

    await test.step("Options should work", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click(`text=${defaultEmailInputOptions.labels.placeholder}`);
      await page.fill(`input[value="${defaultEmailInputOptions.labels.placeholder}"]`, 'Type your email...');
      await page.locator('text=Type your email...').waitFor({ state: 'visible' });
      await page.getByLabel('Button label:').fill('Go');
      await page.fill(`input[value="${defaultEmailInputOptions.retryMessageContent}"]`, 'Try again bro');
    });

    await test.step("Preview bot flow", async () => {
      const preview = await waitForPreview(page);
      await preview.getByPlaceholder('Type your email...').waitFor({ state: 'visible' });
      await preview.getByPlaceholder('Type your email...').fill('test@test');
      await preview.getByRole('button', { name: 'Go' }).click();
      await expect(preview.getByText('Try again bro')).toBeVisible({ timeout: 20000 });
      await preview.getByPlaceholder('Type your email...').fill('email.input@test.com');
      await preview.getByRole('button', { name: 'Go' }).click();
      await preview.getByText('email.input@test.com');
    });
  });
});
