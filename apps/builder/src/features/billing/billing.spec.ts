
import test, { expect } from '@playwright/test';
import { env } from '@quickbot.io/env';
import {
  cleanFakeResults,
  createBots,
  createWorkspaces,
  customPlanId,
  deleteWorkspaces,
  getBillingPlanPersonal,
  injectFakeResults,
} from '@quickbot.io/playwright/helpers';
import { switchToWorkspace } from '@quickbot.io/playwright/testHelpers';

const usageWorkspaceId = 'usageWorkspaceId';
const usageBotId = 'usageBotId';
const planChangeWorkspaceId = 'planChangeWorkspaceId';
const customEnterpriseWorkspaceId = 'customEnterpriseWorkspaceId';

test.beforeAll(async () => {
  const personalPlan = await getBillingPlanPersonal();

  await createWorkspaces([
    {
      id: usageWorkspaceId,
      name: 'Usage Workspace',
      billingPlanId: personalPlan.id,
    },
    {
      id: planChangeWorkspaceId,
      name: 'Plan Change Workspace',
    },
    {
      id: customEnterpriseWorkspaceId,
      name: 'Custom Workspace',
      billingPlanId: customPlanId,
    },
  ]);

  await createBots([
    {
      id: usageBotId,
      name: 'My Bot: Usage',
      version: '6',
      workspaceId: usageWorkspaceId,
    },
  ]);

  await injectFakeResults({
    count: 10,
    botId: usageBotId,
  });
});

test.afterAll(async () => {
  await deleteWorkspaces([
    usageWorkspaceId,
    planChangeWorkspaceId,
    customEnterpriseWorkspaceId,
  ]);
  await cleanFakeResults(usageBotId);
});

test.describe.serial('Billing > Plan', () => {
  test('Should verify Stripe setup', async () => {
    await test.step('should be defined stripe personal customer id', async () => {
      expect(env.PLAYWRIGHT_STRIPE_PERSONAL_CUSTOMER_ID).toBeDefined();
    });

    await test.step('should have a stripe business customer id', async () => {
      expect(env.PLAYWRIGHT_STRIPE_BUSINESS_CUSTOMER_ID).toBeDefined();
    });

    await test.step('should have a stripe enterprise customer id', async () => {
      expect(env.PLAYWRIGHT_STRIPE_ENTERPRISE_CUSTOMER_ID).toBeDefined();
    });
  });

  test('Should verify plan usage', async ({ page }) => {

    await test.step('navigate to the billing section', async () => {
      // Switch to Free workspace
      await page.goto('/workspace/billing');
      await switchToWorkspace(page, 'Free workspace');
      await page.locator('text="FREE"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 1"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 200"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('switch to plan usage workspace', async () => {
      // Test Usage Workspace
      await switchToWorkspace(page, 'Usage Workspace');
      await page.locator('text="PERSONAL"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 2"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="10 / 2000"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('switch to plan change workspace', async () => {
      // Test Business workspace
      await switchToWorkspace(page, 'Business workspace');
      await page.locator('text="BUSINESS"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 5"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 10000"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('switch to plan change workspace', async () => {
      // Switch to Custom Workspace
      await switchToWorkspace(page, 'Custom Workspace');
      await page.locator('text="CUSTOM"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 20"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 100000"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('switch to plan change workspace', async () => {
      // Test Usage Workspace
      await injectFakeResults({
        botId: usageBotId,
        count: 1090,
      });
      await page.goto('/workspace/billing');
      await switchToWorkspace(page, 'Usage workspace');
      await page.locator('text="PERSONAL"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 2"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1100 / 2000"').waitFor({ state: 'visible', timeout: 20000 });
    });
  });

  test('Should upgrade plan', async ({ page }) => {
    await test.step('navigate to the billing section', async () => {
      await page.goto('/workspace/billing');
      await switchToWorkspace(page, 'Plan Change Workspace');
      await page.click('text=Billing', { force: true });
      await page.locator('text="FREE"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 1"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 200"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('open stripe payments page', async () => {
      await page.click('text="Upgrade Plans"');
      await page.click('text="Upgrade Plan"');
      await page.getByLabel('Company Name').nth(1).fill('Juan Francisco');
      await page.getByLabel('Billing Email').nth(1).fill('billing@test.com');
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Go to checkout' }).click({ timeout: 20000 });
      await page.waitForNavigation({ url: /https:\/\/checkout\.stripe\.com/, timeout: 30000 });
      expect(page.url()).toContain('https://checkout.stripe.com');
      await page.locator('text=$39 >> nth=0').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('fill stripe payment page form', async () => {
      await page.locator('text="billing@test.com"').waitFor({ state: 'visible', timeout: 20000 });
      const cardTextOption = page.locator('text="Card"');

      if ((await cardTextOption.count()) === 1) {
        await page.click(`#payment-method-accordion-item-title-card`, { force: true });
      }

      await page.fill('[name="cardNumber"]', '4242 4242 4242 4242');
      await page.fill('[name="cardExpiry"]', '12 / 34');
      await page.fill('[name="cardCvc"]', '123');
      const cardholderNameLocator = page.locator('input[name="billingName"]');
      if (await cardholderNameLocator.isVisible()) {
        await cardholderNameLocator.fill('Test User');
      }
      const billingCountryLocator = page.locator('select[name="billingCountry"]');
      if (await billingCountryLocator.isVisible()) {
        await billingCountryLocator.selectOption('Spain');
      }
      const billingAddressLocator = page.locator('input[name="billingAddressLine1"]');
      if (await billingAddressLocator.isVisible()) {
        await billingAddressLocator.fill('123 Test St.');
      }
      const postalCodeLocator = page.locator('input[name="billingPostalCode"]');
      if (await postalCodeLocator.isVisible()) {
        await postalCodeLocator.fill('08012');
      }
      const billingLocality = page.locator('input[name="billingLocality"]');
      if (await billingLocality.isVisible()) {
        await billingLocality.fill('Barcelona');
      }
      const billingAdministrativeArea = page.locator('select[name="billingAdministrativeArea"]');
      if (await billingAdministrativeArea.isVisible()) {
        await billingAdministrativeArea.selectOption('B');
      }
      await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 20000 });
      await page.locator('button[type="submit"]').click();
      await page.locator('text=Workspace upgraded to Personal').waitFor({
        state: 'visible',
        timeout: 60000,
      });
    });

    await test.step('has starder plan been created?', async () => {
      await page.locator('text="PERSONAL"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 2"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 2000"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('upgrade personal plan to business', async () => {
      await page.locator('text="Upgrade Plans"').waitFor({ state: 'visible', timeout: 20000 });
      await page.click('text="Upgrade Plans"');
      await page.locator('text="Actual Plan"').waitFor({ state: 'visible', timeout: 20000 });
      await page.click('button[aria-label="BUSINESS"]');
      await page.locator('text="BUSINESS"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 5"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 10000"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('upgrade business plan to enterprise', async () => {
      const modal = page.getByRole('dialog').filter({ hasText: /Subscription Plans/i });
      await modal.getByRole('button', { name: 'Close' }).click();
      await page.locator('text="Upgrade Plans"').waitFor({ state: 'visible', timeout: 20000 });
      await page.click('text="Upgrade Plans"');
      await page.locator('text="Actual Plan"').waitFor({ state: 'visible', timeout: 20000 });
      await page.click('button[aria-label="ENTERPRISE"]');
      await modal.getByRole('button', { name: 'Close' }).click();
      await page.locator('text="ENTERPRISE"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="1 / 9999"').waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('text="0 / 50000"').waitFor({ state: 'visible', timeout: 20000 });
    });

    await test.step('should display invoices', async () => {
      await page.locator('text="Invoices"').waitFor({ state: 'visible', timeout: 20000 });
      await page.click('text="Invoices"');
      await page.locator('text="Invoices"').nth(1).waitFor({ state: 'visible', timeout: 30000 });
      await page.locator('text="$39.00"').waitFor({ state: 'visible', timeout: 30000 });
      await page.locator('text="$50.00"').waitFor({ state: 'visible', timeout: 30000 });
    });
  });
});
/**
 * TODO: Implement this test
 * Claimable custom plan
 * This test is disabled because it's not working as expected
 * Custom plans are not limited to the workspace
 * import { createCustomPlan } from '@quickbot.io/playwright/helpers'
 *
test('custom plans should work', async ({ page }) => {
  await test.step('navigate to the billing section', async () => {
    await switchToWorkspace(page, 'Custom Workspace')
  })

  const customPlan = (await createCustomPlan({
    currency: 'usd',
    price: 239,
    chatsLimit: 100000,
    storageLimit: 50,
    membersLimit: 10,
    name: 'Acme custom plan',
    description: 'Description of the deal',
    isSystem: false,
  })) as PlanWithoutChatTiers

  await prisma.workspace.update({
    where: {
      id: customEnterpriseWorkspaceId,
    },
    data: {
      billingPlanId: customPlan.id,
    },
  })

  await test.step('verify custom plan details', async () => {
    await page.goto('/workspace/billing?claimCustomPlan=true&subscribePlan=CUSTOM')
    // await expect(page.getByRole('list').getByText('$239.00')).toBeVisible()
    await expect(page.getByText('Subscribe to Acme custom plan')).toBeVisible()
  })
})
*/
