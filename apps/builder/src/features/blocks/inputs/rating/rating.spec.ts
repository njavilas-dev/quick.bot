
import test, { expect, Page } from '@playwright/test'
import { createBots, parseDefaultGroupWithBlock } from '@quickbot.io/playwright/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { waitForPreview } from '@quickbot.io/playwright/testHelpers'

const boxSvg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>`

test.describe("Blocks > Rating Input", () => {
  test("Should handle rating input block", async ({ page }) => {
    const botId = createId();

    await test.step("Create bot", async () => {
      await createBots([
        {
          id: botId,
          version: '6',
          ...parseDefaultGroupWithBlock({
            type: InputBlockType.RATING,
          }),
        },
      ]);
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Preview: default rating", async () => {
      const preview = await waitForPreview(page);
      await expect(preview.locator(`text=Send`)).toBeHidden();
      await preview.getByRole('checkbox', { name: '8' }).click();
      await preview.locator('text=Send').click();
      await expect(preview.locator('[data-testid="guest-bubble"]')).toHaveText('8');
    });

    await test.step("Options: update labels and icon", async () => {
      await page.click('text=Rate from 0 to 10');
      await page.click('text="10"');
      await page.click('text="5"');
      await page.click('text=Numbers');
      await page.click('text=Icons');
      await page.click('text="Custom icon?"');
      await typeIntoCodeMirror(page, '[data-testid="code-editor"]', boxSvg);
      await page.fill('[placeholder="Not likely at all"]', 'Not likely at all');
      await page.fill('[placeholder="Extremely likely"]', 'Extremely likely');
    });

    await test.step("Preview: custom rating with icon and labels", async () => {
      await page.click('[aria-label="Restart"]');
      const preview = await waitForPreview(page);

      await expect(preview.locator('text=Not likely at all')).toBeVisible({ timeout: 20000 });
      await expect(preview.locator('text=Extremely likely')).toBeVisible({ timeout: 20000 });

      await preview.locator('svg >> nth=4').click();
      await preview.locator('text=Send').click();
      await expect(preview.locator('text=5')).toBeVisible({ timeout: 20000 });
    });
  });
});

// CodeMirror helper
export async function typeIntoCodeMirror(
  page: Page,
  editorSelector: string,
  text: string,
): Promise<void> {
  const editor = page.locator(editorSelector);
  await editor.waitFor({ state: 'visible' });
  await editor.evaluate((node, value) => {
    const cmInstance = (node as any).CodeMirror; // eslint-disable-line
    if (cmInstance) {
      cmInstance.setValue(value);
    } else {
      console.error('CodeMirror not found');
    }
  }, text);
}
