
import test, { expect } from '@playwright/test';
import { createId } from '@quickbot.io/lib/createId';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants';

const pdfSrc = 'https://www.orimi.com/pdf-test.pdf';
const siteSrc = 'https://app.cal.com/urbiport/15min';

test.describe("Blocks > Embed", () => {
  test("Should render embed and support config", async ({ page }) => {
    const botId = createId();

    await test.step("Create embed bubble bot", async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Embed bot',
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.EMBED,
          }),
        },
      ]);
    });

    await test.step("Paste embed URL and verify UI update", async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click('text=Click to edit...');
      await page.fill('input[placeholder="Paste the link or code..."]', pdfSrc);
      await expect(page.locator('text="Show embed"')).toBeVisible({ timeout: 20000 });
    });
  });

  test("Should render iframe in preview", async ({ page }) => {
    const botId = createId();

    await test.step("Create embed bot with predefined Cal.com URL", async () => {
      await createBots([
        {
          id: botId,
          name: 'My Bot: Embed bot',
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: BubbleBlockType.EMBED,
            content: {
              url: siteSrc,
              height: 700,
            },
          }),
        },
      ]);
    });

    await test.step("Validate iframe embed is visible in preview", async () => {
      await page.goto(`/bots/${botId}/flow`);
      const preview = await waitForPreview(page);
      await preview.locator('iframe#embed-bubble-content').waitFor({ state: 'visible', timeout: 20000 });
      await expect(preview.locator('iframe#embed-bubble-content')).toHaveAttribute('src', siteSrc);
    });
  });
});
