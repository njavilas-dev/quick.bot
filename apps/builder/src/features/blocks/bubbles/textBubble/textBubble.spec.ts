
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants';
import { insertVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe('Blocks > TextBubble', () => {
  test('Should support rich text features', async ({ page }) => {
    await test.step('Create bot with text bubble block', async () => {
      const botId = createId();
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.TEXT,
          }),
        },
      ]);
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Start').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('Apply bold formatting', async () => {
      await page.getByTestId('block block2').locator('div').first().click();
      await page.click('[data-testid="bold-button"]');
      await page.type('div[role="textbox"]', 'Bold text');
      await page.press('div[role="textbox"]', 'Shift+Enter');
    });

    await test.step('Apply italic formatting', async () => {
      await page.click('[data-testid="bold-button"]');
      await page.click('[data-testid="italic-button"]');
      await page.type('div[role="textbox"]', 'Italic text');
      await page.press('div[role="textbox"]', 'Shift+Enter');
    });

    await test.step('Apply underline formatting', async () => {
      await page.click('[data-testid="underline-button"]');
      await page.click('[data-testid="italic-button"]');
      await page.type('div[role="textbox"]', 'Underlined text');
      await page.press('div[role="textbox"]', 'Shift+Enter');
    });

    await test.step('Apply all formatting', async () => {
      await page.click('[data-testid="bold-button"]');
      await page.click('[data-testid="italic-button"]');
      await page.type('div[role="textbox"]', 'Everything text');
      await page.press('div[role="textbox"]', 'Shift+Enter');
    });

    await test.step('Insert link and variable', async () => {
      await page.type('div[role="textbox"]', 'My super link');
      await page.waitForTimeout(500);
      await page.press('div[role="textbox"]', 'Shift+Meta+ArrowLeft');
      await page.click('[data-testid="link-button"]');
      await page.fill('input[placeholder="Paste link"]', 'https://github.com');
      await page.press('input[placeholder="Paste link"]', 'Enter');
      await page.press('div[role="textbox"]', 'ArrowRight');
      await page.press('div[role="textbox"]', 'Shift+Enter');
      await insertVariable(page, 'test');
    });

    await test.step('Verify text formatting and link', async () => {
      const preview = await waitForPreview(page);
      await expect(preview.locator('span.slate-bold >> nth=0')).toHaveText('Bold text');
      await expect(preview.locator('span.slate-italic >> nth=0')).toHaveText('Italic text');
      await expect(preview.locator('span.slate-underline >> nth=0')).toHaveText('Underlined text');
      await expect(preview.locator('a[href="https://github.com"]')).toHaveText('My super link');
    });
  });
});
