
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { defaultUrlInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/url/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe("Blocks > URL Input", () => {
  test("Should handle URL input block functionality", async ({ page }) => {
    const botId = createId();

    await test.step("Create bot", async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.URL,
          }),
        },
      ]);
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Preview: default url input", async () => {
      const preview = await waitForPreview(page);

      await expect(
        preview.locator(`input[placeholder="${defaultUrlInputOptions.labels.placeholder}"]`)
      ).toHaveAttribute('type', 'url');
    });

    await test.step("Options: update placeholder, button label and retry message", async () => {
      await page.click(`text=${defaultUrlInputOptions.labels.placeholder}`);
      await page.getByLabel('Placeholder:').fill('Your URL...');
      await expect(page.locator('text=Your URL...')).toBeVisible({ timeout: 20000 });
      await page.getByLabel('Button label:').fill('Go');
      await page.fill(
        `input[value="${defaultUrlInputOptions.retryMessageContent}"]`,
        'Try again bro'
      );
    });

    await test.step("Preview: invalid then valid URL input", async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);
      const input = preview.locator(`input[placeholder="Your URL..."]`);
      const button = preview.locator('button', { hasText: 'Go' });

      await input.fill('test');
      await button.click();
      page.once('dialog', async dialog => {
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toBe('Please enter a URL.');
        await dialog.dismiss();
      });

      await input.fill('https://website.com');
      await button.click();
      await expect(preview.locator('text=https://website.com')).toBeVisible({ timeout: 20000 });
    });
  });
});
