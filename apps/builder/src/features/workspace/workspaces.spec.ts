import test, { expect } from '@playwright/test';
import { createId } from '@quickbot.io/lib/createId';
import { createBots, businessWorkspaceId, personalWorkspaceId, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { switchToWorkspace } from '@quickbot.io/playwright/testHelpers';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';

const proBotId = createId();
const starterBotId = createId();

test.beforeAll(async () => {
  await createBots([
    {
      id: proBotId,
      version: '6',
      name: 'Business bot',
      workspaceId: businessWorkspaceId,
    },
  ]);
  await createBots([
    {
      id: starterBotId,
      version: '6',
      name: 'Personal bot',
      workspaceId: personalWorkspaceId,
      ...parseDefaultGroupWithBlock({
        type: InputBlockType.TEXT,
        options: {
          labels: {
            placeholder: 'Hey there',
          },
        },
      }),
    },
  ]);
});

test.describe.serial("Workspace > Settings", () => {
  test("Should create and delete a new workspace", async ({ page }) => {

    await test.step('Navigate to workspace settings page', async () => {
      await page.goto('/workspace/settings');
      await switchToWorkspace(page, 'Francisco\'s Workspace');
    });

    await test.step('Check workspace and go to settings', async () => {
      await expect(page.locator('text="Francisco\'s Workspace"').first()).toBeVisible({ timeout: 20000 });
      await expect(page.locator('text="Delete workspace"')).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step('Delete new workspace', async () => {
      await page.click('text="Delete workspace"');
      await expect(
        page.locator("text=Are you sure you want to delete Francisco's workspace workspace?"),
      ).toBeVisible({
        timeout: 20000,
      });
      await page.click('text="Delete"');
      await expect(page.locator('text="Francisco\'s Workspace"').first()).toBeHidden();
    });
  });

  test("Should update workspace info", async ({ page }) => {

    await test.step('Update workspace name and icon', async () => {
      await page.goto('/workspace/settings');
      await page.getByRole('button', { name: 'Edit icon' }).click();
      await page.getByRole('tab', { name: 'Icon' }).click()
      await page.getByRole('menu').getByPlaceholder('Search...').fill('apple');
      await page.locator('button:has(img[alt="apple-whole"])').first().click();
      await page.waitForTimeout(500);
      await page.fill('input[value="Business workspace"]', 'My awesome workspace');
      await page.getByRole('button', { name: 'Edit icon' }).click();
      await expect(page.locator('text="My awesome workspace"')).toBeVisible({ timeout: 20000 });
    });
  });

  test("Should not add new members when limit is reached", async ({ page }) => {

    await test.step('Navigate to workspace members page', async () => {
      await page.goto('/workspace/members');
      await switchToWorkspace(page, 'Free workspace');
    });

    await test.step('Check invite button is disabled', async () => {
      await expect(page.locator('text="Members"')).toBeVisible({
        timeout: 20000,
      });
      await expect(page.locator('button >> text="Invite"')).toBeDisabled();
      await expect(
        page.locator(
          'text="Upgrade your plan to work with more team members, and unlock awesome power features"',
        ),
      ).toBeVisible({ timeout: 20000 });
    });

    await test.step('Go to Personal workspace and verify invite is still blocked', async () => {

      await test.step('Switch to Personal workspace', async () => {
        await page.goto('/workspace/members');
        await switchToWorkspace(page, 'Personal workspace');
      });

      await expect(page.locator('text="Members"')).toBeVisible({
        timeout: 20000,
      });

      await page.fill('input[placeholder="colleague@company.com"]', 'user.guest@test.com');
      await page.click('button >> text="Invite"');
      await expect(
        page.locator(
          'text="Upgrade your plan to work with more team members, and unlock awesome power features"',
        ),
      ).toBeVisible({ timeout: 20000 });
      await expect(page.locator('button >> text="Invite"')).toBeDisabled();
    });
  });

  test("Should switch between workspaces and access bot", async ({ page }) => {

    await test.step('Navigate to bots page', async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'My awesome workspace');
      await expect(page.locator('text="Business bot"').nth(0)).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step('Switch to Personal workspace', async () => {
      await switchToWorkspace(page, 'Personal workspace');
      await page.click('text="Personal bot"');
      await expect(page).toHaveURL(/\/flow/, { timeout: 20000 });
    });
  });
});