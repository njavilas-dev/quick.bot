
import { expect, test } from '@playwright/test';

test.describe("Credentials > Management", () => {
  test("Should be able to create, update and delete credentials", async ({ page }) => {

    await test.step("Go to credentials page", async () => {
      await page.goto('/workspace/credentials');
    });

    await test.step("Create a new OpenAI credential", async () => {
      await page.getByRole('button', { name: 'Create' }).click();

      const openAIOption = page.getByRole('menuitem', { name: 'OpenAI' });
      await openAIOption.waitFor({ state: 'visible' });
      await openAIOption.click();

      await page.getByPlaceholder('My account').fill('Bot 1');
      await page.getByPlaceholder('sk-').fill('sk-test-test-test');

      const createButton = page.getByRole('button', { name: 'Create' });
      await expect(createButton).toBeVisible({ timeout: 20000 });
      await expect(createButton).toBeEnabled();
      await createButton.click();

      const botRow1 = page.locator('tr', { hasText: 'Bot 1' });
      await botRow1.waitFor({ state: 'visible' });
      await expect(botRow1).toBeVisible({ timeout: 20000 });
    });

    await test.step("Edit the credential", async () => {
      const botRow1 = page.locator('tr', { hasText: 'Bot 1' });
      await botRow1.getByRole('button', { name: 'Edit' }).click();

      await expect(page.getByPlaceholder('My account')).toHaveValue('Bot 1');
      await expect(page.getByPlaceholder('sk-')).toHaveValue('sk-test-test-test');

      await page.getByPlaceholder('sk-').fill('sk-test-test-test-2');
      await page.getByPlaceholder('My account').fill('Bot 2');

      const updateButton = page.getByRole('button', { name: 'Update' });
      await expect(updateButton).toBeVisible({ timeout: 20000 });
      await expect(updateButton).toBeEnabled();
      await updateButton.click();

      const botRow2 = page.locator('tr', { hasText: 'Bot 2' });
      await botRow2.waitFor({ state: 'visible' });
      await expect(botRow2.getByText('Bot 2')).toBeVisible({ timeout: 20000 });
    });

    await test.step("Delete the credential", async () => {
      const botRow2 = page.locator('tr', { hasText: 'Bot 2' });
      await botRow2.getByRole('button', { name: 'Delete' }).click();

      const popover = page
        .getByRole('menu')
        .filter({ hasText: /Are you sure/i });

      await expect(popover).toBeVisible({ timeout: 20000 });

      await popover.getByRole('button', { name: 'Delete' }).click();

      await expect(botRow2).toBeHidden({ timeout: 5000 });
    });
  });
});
