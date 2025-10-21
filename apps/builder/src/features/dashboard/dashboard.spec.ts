
import test, { expect } from '@playwright/test';

test.describe("Dashboard > Metrics", () => {
  test("Should work as expected", async ({ page }) => {
    await test.step("Go to dashboard", async () => {
      await page.goto(`/dashboard`);
    });

    await test.step("Verify dashboard metrics visibility", async () => {
      await expect(page.getByText('Views').first()).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('Started').first()).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('Completed').first()).toBeVisible({ timeout: 20000 });
    });
  });
});
