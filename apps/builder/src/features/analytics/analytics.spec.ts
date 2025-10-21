
import { getTestAsset } from '@/test/utils/getTestAsset';
import test, { expect } from '@playwright/test';
import { createId } from '@quickbot.io/lib/createId';
import { importBotInDatabase, injectFakeResults, personalWorkspaceId } from '@quickbot.io/playwright/helpers';
import { switchToWorkspace } from '@quickbot.io/playwright/testHelpers';

test.describe("Analytics > Analytics", () => {
  test("Should not be available for non-business workspaces", async ({ page }) => {
    const botId = createId();
    await test.step("Create a bot and import it into the database", async () => {
      await importBotInDatabase(getTestAsset('bots/results/submissionHeader.json'), {
        id: botId,
        workspaceId: personalWorkspaceId,
      });
      await injectFakeResults({ botId: botId, count: 10 });
    });

    await test.step("Switch to Personal workspace", async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'Personal workspace');
    });

    await test.step("Navigate to the analytics page", async () => {
      await page.goto(`/analytics/${botId}/flow`);
      // Wait for the page to load
      await page.waitForLoadState('domcontentloaded');
      // Wait for the graph to be rendered
      await page.waitForSelector('svg', { timeout: 30000 });
    });

    await test.step("Verify analytics are not available", async () => {
      // Wait for drop-off boxes to appear (they should render even when blurred for non-business plans)
      const firstDropoffBox = page.locator('[data-testid="drop-off-box"]').first();
      await firstDropoffBox.waitFor({ state: 'visible', timeout: 60000 });
      await firstDropoffBox.hover({ force: true });
      await expect(
        page.locator('text="You need to upgrade your plan in order to unlock in-depth analytics"'),
      ).toBeVisible({ timeout: 30000 });
    });
  });
});
