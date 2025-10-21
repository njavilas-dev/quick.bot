
import test, { expect } from '@playwright/test';
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers';
import { createId } from '@quickbot.io/lib/createId';
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants';
import { defaultTextInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/text/constants';
import { getTestAsset } from '@/test/utils/getTestAsset';
import { insertVariable, selectVariable, waitForPreview } from '@quickbot.io/playwright/testHelpers';

test.describe.serial('Blocks > TextInput', () => {

  test('Should handle text input correctly', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
        },
      ]);
    });

    await test.step('Go to bot flow', async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step('Preview: default input visible', async () => {
      const preview = await waitForPreview(page);
      await expect(preview.locator(`textarea[placeholder="${defaultTextInputOptions.labels.placeholder}"]`)).toBeVisible({ timeout: 20000 });
    });

    await test.step('Options: change to long text and update labels', async () => {
      await page.click(`text=${defaultTextInputOptions.labels.placeholder}`);
      await page.getByLabel('Placeholder:').fill('Your name...');
      await page.getByLabel('Button label:').fill('Go');
    });

    await test.step('Preview: textarea with new labels', async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);
      await expect(preview.locator(`textarea[placeholder="Your name..."]`)).toBeVisible({ timeout: 20000 });
      await expect(preview.getByRole('button', { name: 'Go' })).toBeVisible({ timeout: 20000 });
    });
  });

  test('Should configure and preview attachments', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
        },
      ]);
    });

    await test.step('Configure attachments', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.click(`text=${defaultTextInputOptions.labels.placeholder}`);
      await page.getByText('Allow attachments').click();
      await selectVariable(page, 'var1', 0);
    });

    await test.step('Preview: send message with attachments', async () => {
      const preview = await waitForPreview(page);

      await preview.getByPlaceholder('Type your answer...').fill('Help me with these');
      await preview.getByLabel('Add attachments').click();
      await expect(preview.getByRole('menuitem', { name: 'Document' })).toBeVisible({ timeout: 20000 });
      await expect(preview.getByRole('menuitem', { name: 'Photos & videos' })).toBeVisible({ timeout: 20000 });

      await preview.locator('#document-upload').setInputFiles(getTestAsset('bots/theme.json'));
      await expect(preview.getByText('theme.json')).toBeVisible({ timeout: 20000 });

      await preview
        .locator('#photos-upload')
        .setInputFiles([getTestAsset('avatar.jpg'), getTestAsset('avatar.jpg')]);
      await expect(preview.getByRole('img', { name: 'avatar.jpg' })).toHaveCount(2);

      await preview.getByRole('img', { name: 'avatar.jpg' }).first().hover();
      await preview.getByLabel('Remove attachment').first().click();
      await expect(preview.getByRole('img', { name: 'avatar.jpg' })).toHaveCount(1);

      await preview.getByLabel('Send').click();
      await expect(preview.getByRole('img', { name: 'Attached image 1' })).toBeVisible({ timeout: 20000 });
      await expect(preview.getByText('Help me with these')).toBeVisible({ timeout: 20000 });
    });
  });

  test('Should enable and preview audio clips', async ({ page }) => {
    const botId = createId();

    await test.step('Create bot', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.TEXT,
          }),
        },
      ]);
    });

    await test.step('Enable audio clip option', async () => {
      await page.goto(`/bots/${botId}/flow`);
      await page.locator(`text=${defaultTextInputOptions.labels.placeholder}`).waitFor({ timeout: 20000 });
      await page.click(`text=${defaultTextInputOptions.labels.placeholder}`);
      await page.getByText('Allow audio clip').click();
      await insertVariable(page, 'var1', 0);
    });

    await test.step('Preview: record and send audio', async () => {
      const preview = await waitForPreview(page);

      await preview.getByRole('button', { name: 'Record voice' }).click();
      await expect(preview.getByRole('button', { name: 'Send' })).toBeEnabled({ timeout: 20000 });
      await preview.getByRole('button', { name: 'Send' }).click({ timeout: 20000 });
      await preview.locator('audio').waitFor({ state: 'visible', timeout: 30000 });
      await expect(preview.locator('audio')).toHaveAttribute('src', new RegExp(`/public/tmp/${botId}/`, 'gm'));
    });
  });

});
