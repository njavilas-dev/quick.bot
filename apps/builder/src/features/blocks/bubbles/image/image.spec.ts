
import test, { expect } from '@playwright/test';
import { createId } from '@quickbot.io/lib/createId';
import { createBots, parseDefaultGroupWithBlock, businessWorkspaceId } from '@quickbot.io/playwright/helpers';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const unsplashImageSrc =
  'https://images.unsplash.com/photo-1504297050568-910d24c426d3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1287&q=80';

test.describe('Blocks > Image Bubble', () => {
  test('Should upload image file', async ({ page }) => {
    const botId = createId();

    await test.step('Create image bubble bot', async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Image bot',
          version: '6',
          ...parseDefaultGroupWithBlock({ type: BubbleBlockType.IMAGE }),
        },
      ]);
    });

    await test.step('Upload image file and verify preview', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Click to edit...').click({ timeout: 10000 });
      await page.click('text=Upload');
      await page.locator('input[type="file"]').setInputFiles([getTestAsset('avatar.jpg')]);
      await page.locator('[data-testid^="block "] img').waitFor({ state: 'visible', timeout: 20000 });
      await expect(page.locator('[data-testid^="block "] img')).toHaveAttribute(
        'src',
        new RegExp(`/public/workspaces/${businessWorkspaceId}/bots/${botId}/blocks`, 'gm'),
      );
    });
  });

  test('Should import image link', async ({ page }) => {
    const botId = createId();

    await test.step('Create image bubble bot', async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Image bot',
          version: '6',
          ...parseDefaultGroupWithBlock({ type: BubbleBlockType.IMAGE }),
        },
      ]);
    });

    await test.step('Paste image URL and verify it loads', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Click to edit...').click({ timeout: 10000 });
      await page.fill('input[placeholder="Paste the image link..."]', unsplashImageSrc);
      await expect(page.locator('[data-testid^="block "] img')).toHaveAttribute('src', unsplashImageSrc);
    });
  });

  test('Should import Giphy GIF', async ({ page }) => {
    const botId = createId();

    await test.step('Create image bubble bot', async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Image bot',
          version: '6',
          ...parseDefaultGroupWithBlock({ type: BubbleBlockType.IMAGE }),
        },
      ]);
    });

    await test.step('Search and select GIF from Giphy', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator('text=Click to edit...').click({ timeout: 10000 });
      await page.click('text=Giphy');

      const trendingImage = page.locator('.giphy-gif-img').first();
      await expect(trendingImage).toHaveAttribute('src', /giphy\.com\/media/);

      const trendingSrc = await trendingImage.getAttribute('src');

      await page.locator('input[placeholder="Search..."]').nth(1).fill('fun');
      await expect(page.locator('input[placeholder="Search..."]').nth(1)).toHaveValue('fun');
      await page.locator('.giphy-gif-img').first().waitFor({ state: 'visible', timeout: 20000 });
      const funImage = page.locator('.giphy-gif-img').first();
      await expect(funImage).toHaveAttribute('src', /giphy\.com\/media/);
      const funSrc = await funImage.getAttribute('src');
      expect(trendingSrc).not.toBe(funSrc);

      await funImage.click({ force: true, position: { x: 0, y: 0 } });

      await expect(page.locator('img[alt="Group image"]')).toHaveAttribute('src', /giphy\.com\/media/);
    });
  });

  test('Should render correctly in preview', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot with predefined image URL', async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Image bot',
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.IMAGE,
            content: { url: unsplashImageSrc },
          }),
        },
      ]);
    });

    await test.step('Open bot preview and validate image', async () => {
      await page.goto(`/bots/${botId}/flow`);
      const preview = await waitForPreview(page);
      await expect(preview.locator('img')).toHaveAttribute('src', unsplashImageSrc);
    });
  });
});
