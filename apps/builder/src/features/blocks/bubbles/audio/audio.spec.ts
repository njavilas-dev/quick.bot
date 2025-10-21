
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants';

const audioSampleUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

test.describe("Blocks > Audio", () => {
  test("Should work as expected", async ({ page }) => {
    const botId = createId();
    await test.step("Create a bot with an audio block", async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Audio bot',
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.AUDIO,
          }),
        },
      ]);
    });

    await test.step("Navigate to bot flow and edit audio block", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.getByText('Click to edit...').click();
      await page.getByPlaceholder('Paste the audio file link...').fill(audioSampleUrl);
      await expect(page.locator('audio')).toHaveAttribute('src', audioSampleUrl);
    });

    await test.step("Upload audio file and verify", async () => {
      await page.getByRole('tab', { name: 'Upload' }).click();
      await page.locator(`input[type="file"]`).setInputFiles([getTestAsset('sample.mp3')]);

      const currentAudio = await page.locator('audio').getAttribute('src');
      await expect(currentAudio).toEqual(audioSampleUrl);
    });
  });
});
