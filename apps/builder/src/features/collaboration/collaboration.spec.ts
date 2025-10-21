
import test, { expect } from '@playwright/test'
import { createId } from '@quickbot.io/lib/createId'
import { CollaborationType, WorkspaceRole } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import {
  createBots,
  createFolder,
  injectFakeResults,
  getPrimaryUser,
  getBillingPlanFree,
  parseDefaultGroupWithBlock,
  getBillingPlanEnterprise
} from '@quickbot.io/playwright/helpers'
import {
  switchToWorkspace
} from '@quickbot.io/playwright/testHelpers'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'

test.describe("Collaboration > Bot owner", () => {
  test("Should invite collaborators", async ({ page }) => {
    const botId = createId();
    const guestWorkspaceId = createId();
    const primaryUser = await getPrimaryUser();
    const enterPrisePlan = await getBillingPlanEnterprise();

    await test.step("Create workspace and bot", async () => {
      await prisma.workspace.create({
        data: {
          id: guestWorkspaceId,
          name: 'Guest Workspace #Owner',
          billingPlanId: enterPrisePlan.id,
          members: {
            createMany: {
              data: [{ role: WorkspaceRole.ADMIN, userId: primaryUser.id }],
            },
          },
        },
      });
      await createBots([
        {
          id: botId,
          version: '6',
          name: 'Guest bot',
          workspaceId: guestWorkspaceId,
          ...parseDefaultGroupWithBlock({ type: InputBlockType.TEXT }),
        },
      ]);
    });

    await test.step("Switch to Guest Workspace #Owner", async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'Guest Workspace #Owner');
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Open share dialog and invite users", async () => {
      await page.locator('text=Start').waitFor({ state: 'visible', timeout: 20000 });
      await page.click('button[aria-label="Open share popover"]');
      await expect(page.locator('text=Free user')).toBeHidden();
      await page.locator('input[placeholder="colleague@company.com"]').waitFor();
      await page.waitForFunction(() => {
        const input = document.querySelector('input[placeholder="colleague@company.com"]');
        return input && !(input as HTMLInputElement).disabled;
      });

      await page.fill('input[placeholder="colleague@company.com"]', 'user.guest@test.com');
      await page.getByRole('button', { name: 'Can view' }).nth(0).click();
      await page.getByRole('menuitem', { name: 'Can edit' }).click();
      await page.getByRole('button', { name: 'Invite' }).click();
      await page.locator('text="Pending"').waitFor({ state: 'visible', timeout: 20000 });

      await page.fill('input[placeholder="colleague@company.com"]', 'user.secondary@test.com');
      await page.getByRole('button', { name: 'Can edit' }).nth(0).click();
      await page.getByRole('menuitem', { name: 'Can view' }).click();
      await page.getByRole('button', { name: 'Invite' }).click();
      await expect(page.locator('text=James Doe')).toBeVisible({ timeout: 20000 });

      await page.click('text="user.guest@test.com"');
      await page.click('text="Remove"');
      await expect(page.locator('text="user.guest@test.com"')).toBeHidden({ timeout: 20000 });
    });
  });
});

test.describe("Collaboration > Guest with read access", () => {
  test("Should see shared bot only", async ({ page }) => {
    const botId = createId();
    const guestWorkspaceId = createId();
    const primaryUser = await getPrimaryUser();
    const freePlan = await getBillingPlanFree();

    await test.step("Create workspace, bots and read collaborator", async () => {
      await prisma.workspace.create({
        data: {
          id: guestWorkspaceId,
          name: 'Guest Workspace #Read',
          billingPlanId: freePlan.id,
          members: {
            createMany: {
              data: [{ role: WorkspaceRole.GUEST, userId: primaryUser.id }],
            },
          },
        },
      });
      await createBots([
        {
          id: botId,
          name: 'Guest bot',
          version: '6',
          workspaceId: guestWorkspaceId,
          ...parseDefaultGroupWithBlock({ type: InputBlockType.TEXT }),
        },
        {
          name: 'Another bot',
          version: '6',
          workspaceId: guestWorkspaceId,
        },
      ]);
      await prisma.botCollaborator.create({
        data: {
          botId,
          userId: primaryUser.id,
          type: CollaborationType.READ,
        },
      });
      await createFolder(guestWorkspaceId, 'Guest folder');
      await injectFakeResults({ botId, count: 10 });
    });

    await test.step("Switch to Guest Workspace #Read", async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'Guest Workspace #Read');
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Check shared bot visibility and navigate", async () => {
      await page.locator('text=Guest bot').waitFor({ state: 'visible', timeout: 20000 });
      await expect(page.locator('text=Guest bot')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('text=Another bot')).toBeHidden();
      await expect(page.locator('text=Guest folder')).toBeHidden();
      await page.click('text=Guest bot');
      await page.click('button[aria-label="Open share popover"]');
      await page.click('text=Everyone at Guest workspace');
      await expect(page.locator('text="Remove"')).toBeHidden();
      await expect(page.locator('text=Francisco')).toBeVisible({ timeout: 20000 });
      await page.click('text=Group #1', { force: true });
      await expect(page.locator('input[value="Group #1"]')).toBeHidden();
      await page.goto(`/analytics/${botId}/answers`);
      await expect(page.locator('tr').nth(9)).toBeVisible({ timeout: 20000 });
    });
  });
});

test.describe("Collaboration > Guest with write access", () => {
  test("Should edit shared bot", async ({ page }) => {
    const botId = createId();
    const guestWorkspaceId = createId();
    const primaryUser = await getPrimaryUser();
    const freePlan = await getBillingPlanFree();

    await test.step("Create workspace and assign WRITE collaborator", async () => {
      await prisma.workspace.create({
        data: {
          id: guestWorkspaceId,
          name: 'Guest Workspace #Write',
          billingPlanId: freePlan.id,
          members: {
            createMany: {
              data: [{ role: WorkspaceRole.GUEST, userId: primaryUser.id }],
            },
          },
        },
      });
      await createBots([
        {
          id: botId,
          name: 'Guest bot',
          version: '6',
          workspaceId: guestWorkspaceId,
          ...parseDefaultGroupWithBlock({ type: InputBlockType.TEXT }),
        },
        {
          version: '6',
          name: 'Another bot',
          workspaceId: guestWorkspaceId,
        },
      ]);
      await prisma.botCollaborator.create({
        data: {
          botId,
          userId: primaryUser.id,
          type: CollaborationType.WRITE,
        },
      });
      await createFolder(guestWorkspaceId, 'Guest folder');
    });

    await test.step("Switch to Guest Workspace #Write", async () => {
      await page.goto('/bots');
      await switchToWorkspace(page, 'Guest Workspace #Write');
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Validate write access in bot UI", async () => {
      await page.locator('text=Guest bot').waitFor({ state: 'visible', timeout: 20000 });
      await expect(page.locator('text=Guest bot')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('text=Another bot')).toBeHidden();
      await expect(page.locator('text=Guest folder')).toBeHidden();
      await page.click('text=Guest bot');
      await page.click('button[aria-label="Open share popover"]');
      await page.click('text=Everyone at Guest workspace');
      await page.locator('text=Remove').waitFor({ state: 'hidden', timeout: 20000 });
      await page.locator('text=Francisco').waitFor({ state: 'visible', timeout: 20000 });
      await expect(page.locator('text="Remove"')).toBeHidden();
      await expect(page.locator('text=Francisco')).toBeVisible({ timeout: 20000 });
      await page.click('text=Group #1', { force: true });
      await expect(page.locator('input[value="Group #1"]')).toBeVisible({ timeout: 20000 });
    });
  });
});

test.describe("Collaboration > Guest on public bot", () => {
  test("Should access public bot", async ({ page }) => {
    const botId = createId();
    const guestWorkspaceId = createId();
    const freePlan = await getBillingPlanFree();

    await test.step("Create public bot in guest workspace", async () => {
      await prisma.workspace.create({
        data: {
          id: guestWorkspaceId,
          name: 'Guest Workspace #Public',
          billingPlanId: freePlan.id,
        },
      });
      await createBots([
        {
          id: botId,
          version: '6',
          name: 'Guest bot',
          workspaceId: guestWorkspaceId,
          ...parseDefaultGroupWithBlock({ type: InputBlockType.TEXT }),
          settings: {
            publicShare: { isEnabled: true },
          },
        },
      ]);
    });

    await test.step("Guest Workspace #Public shouldn't be visible", async () => {
      await page.goto('/bots');
      page.getByRole('menuitem', { name: 'Guest Workspace #Public' }).waitFor({ state: 'hidden', timeout: 20000 });
    });

    await test.step("Go to bot flow", async () => {
      await page.goto(`/bots/${botId}/flow`);
    });

    await test.step("Visit public bot and validate visibility", async () => {
      await page.locator('text=Start').waitFor({ state: 'visible', timeout: 20000 });
      await expect(page.getByText('Guest bot')).toBeVisible({ timeout: 20000 });
      await expect(page.getByRole('link', { name: 'Duplicate' }).first()).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('Group #1')).toBeVisible({ timeout: 20000 });
      await page.click('text=Group #1', { force: true });
      await expect(page.locator('input[value="Group #1"]')).toBeHidden();
    });
  });
});
