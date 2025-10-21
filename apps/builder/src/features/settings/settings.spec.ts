
import test, { expect } from '@playwright/test'
import { env } from '@quickbot.io/env'
import { createId } from '@quickbot.io/lib/createId'
import { importBotInDatabase } from '@quickbot.io/playwright/helpers'
import { getTestAsset } from '@/test/utils/getTestAsset'

test.describe("Settings > General", () => {
  test("Should reflect real-time changes in General", async ({ page }) => {
    const botId = createId();

    await test.step("Import bot with settings data", async () => {
      await importBotInDatabase(getTestAsset('bots/settings.json'), { id: botId });
    });

    await test.step("Navigate to General section in settings", async () => {
      await page.goto(`/bots/${botId}/settings`);
      const accordionButton = page.locator('button:has-text("General")');
      const isExpanded = await accordionButton.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await accordionButton.click();
      }
    });

    await test.step("Toggle user memory and validate persistence type", async () => {
      await page.locator('text="Remember user"').first().waitFor({ timeout: 20000 });
      await page.click('text="Remember user"');
      await page.click('text=local');
      await page.click('text=session');
    });
  });
});

test.describe("Settings > Typing Emulation", () => {
  test("Should allow filling Typing emulation config", async ({ page }) => {
    const botId = createId();

    await test.step("Import bot with settings data", async () => {
      await importBotInDatabase(getTestAsset('bots/settings.json'), { id: botId });
    });

    await test.step("Navigate to Typing emulation section", async () => {
      await page.goto(`/bots/${botId}/settings`);
      await page.click('button:has-text("Typing")');
      await page.click('button:has-text("Typing emulation")');
    });

    await test.step("Fill typing speed and delay", async () => {
      await page.fill('[data-testid="speed"] input', '351');
      await page.fill('[data-testid="max-delay"] input', '1.6');
      await page.click('text="Typing emulation" >> nth=-1'); // collapse section
      await page.click('button:has-text("Typing")');
      await expect(page.locator('[data-testid="speed"]')).toBeHidden();
      await expect(page.locator('[data-testid="max-delay"]')).toBeHidden();
    });
  });
});

test.describe("Settings > Metadata", () => {
  test("Should allow editing Metadata", async ({ page }) => {
    const favIconUrl = 'https://placehold.co/32x32/EEEEEE/333333.png';
    const imageUrl = 'https://placehold.co/600x400/EEEEEE/333333.png';
    const botId = createId();

    await test.step("Import bot with settings data", async () => {
      await importBotInDatabase(getTestAsset('bots/settings.json'), { id: botId });
    });

    await test.step("Navigate to Metadata section", async () => {
      await page.goto(`/bots/${botId}/settings`);
      await page.click('text="Metadata"');
    });

    await test.step("Change favicon using link", async () => {
      await page.click('text="Favicon"');

      const favIconImg = page.locator(`img[src="${env.NEXT_PUBLIC_VIEWER_URL}/favicon.png"]`);
      await expect(favIconImg).toHaveAttribute('src', `${env.NEXT_PUBLIC_VIEWER_URL}/favicon.png`);
      await favIconImg.click();

      await page.click('button:has-text("Link")');
      await page.fill('input[placeholder="Paste the image link..."]', favIconUrl);
      const favIconImgUpdated = page.locator(`img[src="${favIconUrl}"]`);
      await page.keyboard.press('Enter');
      await expect(favIconImgUpdated).toHaveAttribute('src', favIconUrl, { timeout: 10000 });
    });

    await test.step("Change preview image using link", async () => {
      await page.click('text="Preview"');
      const websiteImg = page.locator('img >> nth=2');
      await page.locator('input[placeholder="Paste the image link..."]').nth(1).fill(imageUrl);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      await expect(websiteImg).toHaveAttribute('src', imageUrl);
    });

    await test.step("Edit title and description fields", async () => {
      await page.click('text="Title"');
      await page.getByRole('textbox', { name: 'Title' }).fill('Awesome bot');

      await page.click('text="Description"');
      await page.getByRole('textbox', { name: 'Description' }).fill('Lorem ipsum');

      await page.fill('div[contenteditable=true]', '<script>Lorem ipsum</script>');
    });
  });
});
