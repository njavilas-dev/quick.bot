
import test, { expect } from '@playwright/test';
import { createId } from '@quickbot.io/lib/createId';
import {
  personalWorkspaceId,
  createBots,
  parseDefaultGroupWithBlock,
  enterpriseWorkspaceId
} from '@quickbot.io/playwright/helpers';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { env } from '@quickbot.io/env';
import { switchToWorkspace } from '@quickbot.io/playwright/testHelpers';

test.beforeAll(async () => {
  await test.step('Validate required Vercel env variables are defined', async () => {
    expect(env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME).toBeDefined();
    expect(env.VERCEL_TEAM_ID).toBeDefined();
    expect(env.VERCEL_TOKEN).toBeDefined();
  });
});

test.describe("Custom Domains > Personal Workspace", () => {
  test("Should not allow custom domain in Personal workspace", async ({ page }) => {
    const botId = createId();

    await test.step('Create bot in personal workspace', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          workspaceId: personalWorkspaceId,
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
        },
      ]);
    });

    await test.step("Switch to Personal workspace", async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'Personal workspace');
    });

    await test.step('Verify domain access is locked', async () => {
      await page.goto(`/bots/${botId}/deploy`);
      await page.waitForTimeout(5000);
      await page.locator('text=Add my domain').waitFor({ state: 'visible', timeout: 20000 });

      await page.getByRole('button', { name: 'Add my domain' }).hover();
      await expect(
        page.locator('text="You need to upgrade your plan in order to add custom domains"'),
      ).toBeVisible({ timeout: 20000 });
    });
  });
});

test.describe("Custom Domains > Enterprise Workspace", () => {
  test("Should allow connecting and editing custom domain in Enterprise workspace", async ({ page }) => {
    const botId = createId();

    await test.step('Create bot in enterprise workspace', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          workspaceId: enterpriseWorkspaceId,
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
        },
      ]);
    });

    await test.step("Switch to Enterprise workspace", async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'Enterprise workspace');
    });

    await test.step('Add custom domain', async () => {
      await page.goto(`/bots/${botId}/deploy`);
      await page.waitForTimeout(5000);
      await page.getByRole('button', { name: 'Add my domain' }).click({ timeout: 10000 });
      await page.getByRole('menuitem', { name: 'New Domain' }).click({ timeout: 10000 });

      const modal = page.getByRole('dialog').filter({ hasText: /Add a custom domain/i });
      await expect(modal).toBeVisible({ timeout: 20000 });

      await modal.locator('input[placeholder="bot.my-domain.com"]').fill('test');
      await expect(modal.locator('text=Save')).toBeDisabled();

      await modal.locator('input[placeholder="bot.my-domain.com"]').fill('yolozeeer.com');
      await expect(modal.locator('text="A"')).toBeVisible({ timeout: 20000 });

      await modal.locator('input[placeholder="bot.my-domain.com"]').fill('sub.yolozeeer.com');
      await expect(modal.locator('text="CNAME"')).toBeVisible({ timeout: 20000 });

      await modal.getByRole('button', { name: 'Save' }).click();
    });

    await test.step('Edit custom domain path', async () => {
      await page.getByRole('button', { name: 'Edit' }).nth(2).waitFor({ state: 'visible', timeout: 20000 });
      await page.getByRole('button', { name: 'Edit' }).nth(2).click();

      const urlInput = page.locator('[data-testid="url-input"]').nth(1);
      await urlInput.fill('custom-path');

      const saveButton = page.locator('[data-testid="save-button"]').nth(0);
      await saveButton.click();

      await expect(urlInput).toHaveValue('https://sub.yolozeeer.com/custom-path');
    });

    await test.step('Remove custom domain', async () => {
      await page.goto(`/bots/${botId}/deploy`);
      await page.locator('[aria-label="Remove custom domain"]').click({ timeout: 20000 });
      await expect(page.locator('text=sub.yolozeeer.com')).toBeHidden({ timeout: 2000 });

      await page.click('button >> text=Add my domain');
      await page.click('[aria-label="Remove domain"]');
      await expect(page.locator('[aria-label="Remove domain"]')).toBeHidden({ timeout: 4000 });
    });
  });
});