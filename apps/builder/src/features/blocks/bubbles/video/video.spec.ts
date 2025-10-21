
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants';
import { VideoBubbleContentType } from '@quickbot.io/schemas/features/blocks/bubbles/video/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

const videoSrc = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
const youtubeVideoSrc = 'https://www.youtube.com/watch?v=NpEaa2P7qZI';
const vimeoVideoSrc = 'https://vimeo.com/649301125';

test.describe('Blocks > Video Bubble', () => {
  test('Should import video URL correctly', async ({ page }) => {
    const botId = createId();

    await test.step('Create video bubble bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
          }),
        },
      ]);
    });

    await test.step('Paste video URL and verify source', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Click to edit...');
      await page.fill('input[placeholder="Paste the video link..."]', videoSrc);
      await expect(page.locator('video > source')).toHaveAttribute('src', videoSrc);
    });
  });

  test('Should render direct video in preview', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot with video URL content', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
            content: {
              type: VideoBubbleContentType.URL,
              url: videoSrc,
            },
          }),
        },
      ]);
    });

    await test.step('Open preview and validate video renders', async () => {
      await page.goto(`/bots/${botId}/flow`);
      const preview = await waitForPreview(page);
      await expect(preview.locator('video')).toHaveAttribute('src', videoSrc);
    });
  });

  test('Should render YouTube embed in preview', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot with YouTube video content', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
            content: {
              type: VideoBubbleContentType.YOUTUBE,
              url: youtubeVideoSrc,
              id: 'dQw4w9WgXcQ',
            },
          }),
        },
      ]);
    });

    await test.step('Open preview and verify YouTube iframe', async () => {
      await page.goto(`/bots/${botId}/flow`);
      const preview = await waitForPreview(page);
      await expect(preview.locator('iframe')).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/NpEaa2P7qZI',
      );
    });
  });

  test('Should render Vimeo embed in preview', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot with Vimeo video content', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.VIDEO,
            content: {
              type: VideoBubbleContentType.VIMEO,
              url: vimeoVideoSrc,
              id: '649301125',
            },
          }),
        },
      ]);
    });

    await test.step('Open preview and verify Vimeo iframe', async () => {
      await page.goto(`/bots/${botId}/flow`);
      const preview = await waitForPreview(page);
      await expect(preview.locator('iframe')).toHaveAttribute(
        'src',
        'https://player.vimeo.com/video/649301125',
      );
    });
  });
});
