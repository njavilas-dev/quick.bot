
import test from '@playwright/test'
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'

test.describe('Blocks > Google Analytics', () => {
  test('Should configure Google Analytics block correctly', async ({ page }) => {
    const botId = createId();
    await test.step('Create bot with Google Analytics block', async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: IntegrationBlockType.GOOGLE_ANALYTICS,
          }),
        },
      ]);
    });

    await test.step('Navigate to bot flow page', async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step('Configure Google Analytics settings', async () => {
      await page.click('text=Configure...');
      await page.fill('input[placeholder="G-123456..."]', 'G-VWX9WG1TNS');
      await page.fill('input[placeholder="Example: conversion"]', 'conversion');
      await page.click('text=Advanced');
      await page.fill('input[placeholder="Example: Bot"]', 'Bot');
      await page.fill('input[placeholder="Example: Campaign Z"]', 'Campaign Z');
      await page.fill('input[placeholder="Example: 0"]', '0');
    });
  });
});
