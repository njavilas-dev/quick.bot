
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe('Blocks > Date Input', () => {
  test('Should handle date input block functionality', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.DATE,
          }),
        },
      ]);
    });

    await test.step('Go to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step('Preview: default date input', async () => {
      const preview = await waitForPreview(page);
      await expect(preview.locator('[data-testid="from-date"]')).toHaveAttribute('type', 'date');
      await preview.locator('[data-testid="from-date"]').fill('2021-01-01');
      await preview.getByLabel('Send').click();
      await expect(preview.locator('text="01/01/2021"')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Options: enable range and time', async () => {
      await page.click('text=Pick a date');
      await page.click('text=Is range?');
      await page.click('text=With time?');
      await page.getByLabel('From label:').fill('Previous:');
      await page.getByLabel('To label:').fill('After:');
      await page.getByLabel('Button label:').fill('Go');
    });

    await test.step('Preview: range + datetime', async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);

      await expect(preview.locator('[data-testid="from-date"]')).toHaveAttribute('type', 'datetime-local');
      await expect(preview.locator('[data-testid="to-date"]')).toHaveAttribute('type', 'datetime-local');

      await preview.locator('[data-testid="from-date"]').fill('2021-01-01T11:00');
      await preview.locator('[data-testid="to-date"]').fill('2022-01-01T09:00');
      await preview.getByRole('button', { name: 'Go' }).click();
      await expect(preview.locator('text="01/01/2021 11:00 to 01/01/2022 09:00"')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Options: set custom format', async () => {
      await page.click('text=Pick a date');
      await page.getByPlaceholder('dd/MM/yyyy HH:mm').fill('dd.MM HH:mm');
    });

    await test.step('Preview: custom format applied', async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);

      await preview.locator('[data-testid="from-date"]').fill('2023-01-01T11:00');
      await preview.locator('[data-testid="to-date"]').fill('2023-02-01T09:00');
      await preview.getByRole('button', { name: 'Go' }).click();
      await expect(preview.locator('text="01.01 11:00 to 01.02 09:00"')).toBeVisible({ timeout: 20000 });
    });
  });
});
