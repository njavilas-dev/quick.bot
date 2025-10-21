
import { getTestAsset } from '@/test/utils/getTestAsset';
import test, { expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe("Account > Profile", () => {
  test("Should display user info properly", async ({ page }) => {
    await test.step("Navigate to profile page", async () => {
      await page.goto('/account/profile');
    });

    await test.step("Verify name and email fields are visible", async () => {
      await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 20000 });
      expect(page.locator('input[name="email"]').getAttribute('disabled')).toBeDefined();
    });

    await test.step("Verify current image and upload new avatar", async () => {
      const currentImage = await page.locator('img').nth(1).getAttribute('src');
      await expect(currentImage).toEqual('https://avatars.githubusercontent.com/u/6652831?v=4');
      await page.locator(`input[type="file"]`).setInputFiles([getTestAsset('avatar.jpg')]);

      await page.waitForFunction(
        (originalSrc) => {
          const img = document.querySelector('img[alt="Francisco"]') || document.querySelectorAll('img')[1];
          return img instanceof HTMLImageElement &&
            img.src !== originalSrc &&
            img.src?.includes('s3');
        },
        currentImage,
        { timeout: 20000 }
      );

      const newImage = await page.locator('img').nth(1).getAttribute('src');
      await expect(newImage).not.toEqual(currentImage);
      await expect(newImage).toContain('s3');
    });
  });
});

async function cleanupExistingTokens(page, tokenName) {
  let tokenExists = true;
  let cleanupAttempts = 0;
  const maxAttempts = 5;

  while (tokenExists && cleanupAttempts < maxAttempts) {
    tokenExists = await page.locator('tr', {
      has: page.locator('td', { hasText: tokenName })
    }).count() > 0;

    if (tokenExists) {
      console.log(`Found existing ${tokenName} token (attempt ${cleanupAttempts + 1}), cleaning up...`);
      try {
        const tokenRow = page.locator('tr', {
          has: page.locator('td', { hasText: tokenName })
        }).first();

        await tokenRow.waitFor({ state: 'visible', timeout: 5000 });
        await tokenRow.locator('text="Delete"').click();
        await page.locator('button >> text="Delete"').last().click();
        await page.waitForTimeout(1000);
        cleanupAttempts++;
      } catch (error) {
        console.error(`Error cleaning up token: ${error}`);
        break;
      }
    }
  }

  if (cleanupAttempts > 0) {
    await page.reload();
  }
}

test.describe("Account > API Tokens", () => {
  test("Should be able to create and delete api tokens", async ({ page }) => {
    await test.step("Clean up existing CLI tokens", async () => {
      await page.goto('/account/api-tokens');
      await page.locator('text="API tokens"').waitFor({ state: 'visible', timeout: 20000 });
      await cleanupExistingTokens(page, 'CLI');
    });

    await test.step("Create a new CLI token", async () => {
      console.log('Creating new CLI token...');
      await page.click('text="Create"', { strict: true, timeout: 20000 });
      await expect(page.locator('button >> text="Create token"')).toBeDisabled();
      await page.fill('[placeholder="I.e. Zapier, Github, Make.com"]', 'CLI');
      await expect(page.locator('button >> text="Create token"')).toBeEnabled();
      await page.click('button >> text="Create token"');
      await page.locator('text="Done"').waitFor({ state: 'visible', timeout: 20000 });
      await expect(page.locator('button[aria-label="Copy"]')).toBeVisible({ timeout: 20000 });
      await page.getByRole('button', { name: 'Done' }).click({ timeout: 20000 });
    });

    await test.step("Verify token is created and delete it", async () => {
      await page.goto('/account/api-tokens');
      const newCliRow = page.locator('tr', { has: page.locator('td', { hasText: 'CLI' }) });
      await newCliRow.waitFor({ state: 'visible', timeout: 20000 });
      await newCliRow.locator('text="Delete"').click();
      await page.locator('button >> text="Delete"').last().click();
    });

    await test.step("Verify CLI token is gone", async () => {
      await expect(page.locator('td', { hasText: 'CLI' })).toBeHidden({ timeout: 30000 });
    });

    await test.step("Verify other tokens still exist", async () => {
      await expect(page.locator('td', { hasText: 'Github' })).toBeVisible({ timeout: 5000 });
    });
  });
});
