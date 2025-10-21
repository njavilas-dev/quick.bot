
import test, { expect } from '@playwright/test';
import { createId } from '@quickbot.io/lib/createId';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { env } from '@quickbot.io/env';

test.describe("Publish > Publish", () => {
  test("Should not be able to submit taken url ID", async ({ page }) => {
    const takenBotId = createId();
    const botId = createId();

    await test.step("Create two bots (one with taken URL ID)", async () => {
      await createBots([
        {
          id: takenBotId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
          publicId: 'taken-url-id',
        },
      ]);
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
          publicId: `${botId}-public`,
        },
      ]);
    });

    await test.step("Go to bot settings and open Domain accordion", async () => {
      await page.goto(`/bots/${botId}/settings`);
      const accordionButton = page.locator('button:has-text("Domain")').first();
      const isExpanded = await accordionButton.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await accordionButton.click();
      }
    });

    await test.step('Try "id with spaces" -> expect error', async () => {
      await page.click('[data-testid="edit-button"]');
      await page.click('[data-testid="url-input"]');
      await page.fill('[data-testid="url-input"]', 'id with spaces');
      await page.click('[data-testid="save-button"]');
      await expect(page.locator('[data-testid="url-input"]')).toHaveAttribute('aria-invalid', 'true');
    });

    await test.step('Try "taken-url-id" -> expect error', async () => {
      await page.fill('[data-testid="url-input"]', 'taken-url-id');
      await page.click('[data-testid="save-button"]');
      await page
        .locator('text=ID is already taken')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('Try "new-valid-id" -> expect error', async () => {
      await page.click('[data-testid="edit-button"]');
      await page.fill('[data-testid="url-input"]', 'new-valid-id');
      await page.click('[data-testid="save-button"]');
      await page.locator('text="ID is already taken"').first().waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step("Go to share page and confirm final URL text", async () => {
      await page.waitForTimeout(1000);
      await page.goto(`/bots/${botId}/deploy`);
      await page.waitForLoadState('domcontentloaded');
      await page.getByRole('button', { name: 'Iframe' }).click();

      const urlPattern = new RegExp(env.NEXT_PUBLIC_VIEWER_URL + '/new-valid-id');
      await page.waitForSelector(`text=${env.NEXT_PUBLIC_VIEWER_URL}/new-valid-id`, { timeout: 30000 });
      await expect(page.getByText(urlPattern)).toBeVisible({ timeout: 30000 });
    });
  });
});
