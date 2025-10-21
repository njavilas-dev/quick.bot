import { Page } from '@playwright/test'

export async function switchToWorkspace(
  page: Page,
  workspaceName: string,
  options?: { menuTimeout?: number; postClickDelay?: number },
) {
  await page.waitForLoadState('domcontentloaded')

  const { menuTimeout = 5000, postClickDelay = 1000 } = options || {}

  await page.locator('button[aria-label="Switch Workspace"]').click({ timeout: 10000 })

  const menuItem = page.getByRole('menuitem', { name: workspaceName })

  if (!(await menuItem.isVisible())) {
    await menuItem.scrollIntoViewIfNeeded()
  }
  await menuItem.waitFor({ state: 'visible', timeout: menuTimeout })

  await menuItem.click()

  await page.waitForTimeout(postClickDelay)
}

export async function waitForPreview(page: Page) {
  let preview = page.locator('quickbot-standard')
  if (preview && (await preview.isVisible())) {
    return preview
  }
  await page
    .getByRole('button', { name: 'Preview bot flow', exact: true })
    .click({ timeout: 60000 })
  preview = page.locator('quickbot-standard')
  await preview.waitFor({ state: 'visible' })
  return preview
}

export const selectStripeCardTab = async (page: Page) => {
  const frame = page.frameLocator('iframe[src*="elements-inner-payment"]')

  const cardTab = frame.locator('button:has-text("Card")')

  await cardTab.waitFor({ state: 'visible', timeout: 10000 })

  await cardTab.click()
}

export const waitForStripePaymentForm = async (page: Page) => {
  const stripeContainer = page.locator('.StripeElement')
  await stripeContainer.waitFor({ state: 'visible', timeout: 10000 })

  const stripeFrame = page.frameLocator('iframe[src*="elements-inner-payment"]')

  const cardTab = stripeFrame.locator('button:has-text("Card")')

  if (!(await cardTab.isVisible())) {
    await cardTab.scrollIntoViewIfNeeded()
  }

  await cardTab.waitFor({ state: 'visible', timeout: 10000 })

  try {
    await cardTab.click({ force: true })
  } catch (err) {
    console.error('Card tab click failed:', err)
  }

  const inputFrames = stripeContainer.locator('iframe')
  await inputFrames.first().waitFor({ state: 'visible', timeout: 10000 })

  return stripeFrame
}

export const deleteButtonInConfirmDialog = (page: Page) =>
  page.getByRole('dialog').getByRole('button', { name: 'Delete' }).first()

export const selectVariable = async (page: Page, name: string, nth: number = -1) => {
  await page.locator('button[aria-label="Select a variable"]').nth(nth).click()

  // Wait for dropdown menu to load
  await page.waitForTimeout(500)

  // Check if variable already exists by finding the menuitem that contains the variable name
  const variableItem = page.getByRole('menuitem').filter({ has: page.getByText(name, { exact: true }) });
  try {
    await variableItem.waitFor({ state: 'visible', timeout: 2000 });
    await variableItem.click();
    return;
  } catch (error) {
    // Variable doesn't exist, create it
  }

  await createVariable(page, name)

  // Close the dropdown to reset state
  await page.locator('button[aria-label="Select a variable"]').nth(-1).click()
}

export const insertVariable = async (page: Page, name: string, nth: number = -1) => {

  await page.locator('button[aria-label="Insert a variable"]').nth(nth).click();

  // Wait for dropdown menu to load
  await page.waitForTimeout(500)

  // Check if variable already exists by finding the menuitem that contains the variable name
  const variableItem = page.getByRole('menuitem').filter({ has: page.getByText(name, { exact: true }) });
  try {
    await variableItem.waitFor({ state: 'visible', timeout: 2000 });
    await variableItem.click();
    return;
  } catch (error) {
    // Variable doesn't exist, create it
  }

  await createVariable(page, name);
}

const createVariable = async (page: Page, name: string) => {
  // Wait for the "Add variable" button to be stable and clickable
  const addVariableButton = page.getByRole('button', { name: 'Add variable' })
  await addVariableButton.waitFor({ state: 'visible' })
  await addVariableButton.click()

  // Fill the variable name in the modal
  await page.locator('input[placeholder="Variable name"]').fill(name)

  // Click "Create" button
  await page.getByRole('button', { name: 'Create' }).click()
}
