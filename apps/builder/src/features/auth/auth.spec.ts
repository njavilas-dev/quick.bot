import test, { expect } from '@playwright/test'
import prisma from '@quickbot.io/lib/prisma'
import { deleteUserByEmail } from '@quickbot.io/playwright/helpers'

test.describe.serial('Auth > User Creation Flow', () => {
  const testEmail = 'services@urbiport.com'
  const testPassword = 'SecurePassword123!'
  const testName = 'Test'
  const testLastname = 'User'

  test.beforeAll(async () => {
    await deleteUserByEmail(testEmail);
  });

  test('Should complete the entire signup flow including email verification', async ({ page }) => {
    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup')
      await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=Create an account')).toBeVisible({ timeout: 10000 })
    })

    await test.step('Fill signup form with valid data', async () => {
      await page.fill('input[name="name"]', testName);
      await expect(page.locator('input[name="name"]')).toHaveValue(testName, { timeout: 20000 });
      await page.fill('input[name="lastname"]', testLastname);
      await expect(page.locator('input[name="lastname"]')).toHaveValue(testLastname, { timeout: 20000 });
      await page.fill('input[name="email"]', testEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(testEmail, { timeout: 20000 });
      await page.fill('input[name="password"]', testPassword);
      await expect(page.locator('input[name="password"]')).toHaveValue(testPassword, { timeout: 20000 });
    });

    await test.step('Submit signup form', async () => {
      await page.click('button[type="submit"]')

      // Wait for the success message
      await expect(page.locator('text="Email Verification Sent"')).toBeVisible({ timeout: 20000 });
      await expect(page.locator(`text="A verification email has been sent to ${testEmail}. Please check your inbox and click the verification link to activate your account."`)).toBeVisible({ timeout: 10000 });
    });

    await test.step('Programmatically verify email by updating database', async () => {
      // Find the user auth record
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          username: testEmail,
          is_verified: false,
        },
      })

      expect(userAuth).not.toBeNull()
      expect(userAuth?.verify_token).not.toBeNull()

      // Simulate email verification by marking the account as verified
      await prisma.userAuth.update({
        where: {
          id: userAuth!.id,
        },
        data: {
          is_verified: true,
          verify_token: null,
        },
      })

      console.log(`Email verified programmatically for user ${testEmail}`)
    })

    await test.step('Retry signup with existing email', async () => {
      await test.step('Attempt to register with the same email', async () => {
        await page.goto('/signup')
        await page.fill('input[name="name"]', 'Another')
        await page.fill('input[name="lastname"]', 'User')
        await page.fill('input[name="email"]', testEmail)
        await page.fill('input[name="password"]', 'AnotherPassword123!')
        await page.click('button[type="submit"]')
        // Check for error message
        await expect(page.locator('text="Email is already in use."').first()).toBeVisible({
          timeout: 10000,
        })
      })
    })
  })

  test('Should resend verification email for unverified account', async ({ page }) => {
    // Test specific email for this flow
    const unverifiedEmail = `unverified-${Date.now()}@urbiport.com`

    await test.step('Clean up any existing test users', async () => {
      await deleteUserByEmail(unverifiedEmail)
    })

    await test.step('Register a new user but do not verify the email', async () => {
      await page.goto('/signup')

      // Fill signup form
      await page.fill('input[name="name"]', 'Unverified')
      await page.fill('input[name="lastname"]', 'User')
      await page.fill('input[name="email"]', unverifiedEmail)
      await page.fill('input[name="password"]', testPassword)

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for success message
      await expect(page.locator('text="Email Verification Sent"')).toBeVisible({ timeout: 10000 })

      // Verify the user auth record exists but is not verified
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          username: unverifiedEmail,
          is_verified: false,
        },
      })

      expect(userAuth).not.toBeNull()
      expect(userAuth?.verify_token).not.toBeNull()

      // Store the original verification token for later comparison
      const originalToken = userAuth?.verify_token

      // Attempt to register again with the same email
      await page.goto('/signup')
      await page.fill('input[name="name"]', 'Different')
      await page.fill('input[name="lastname"]', 'Name')
      await page.fill('input[name="email"]', unverifiedEmail)
      await page.fill('input[name="password"]', 'DifferentPassword123!')
      await page.click('button[type="submit"]')

      // Wait for the verification resent message
      await expect(
        page.locator('text="A new verification email has been sent to your address."').first(),
      ).toBeVisible({ timeout: 10000 })

      // Check that we didn't create a duplicate user account
      const users = await prisma.user.findMany({
        where: { email: unverifiedEmail },
      })
      expect(users.length).toBe(1)

      // Verify that the token remains the same (we're not generating a new token)
      const updatedUserAuth = await prisma.userAuth.findFirst({
        where: {
          username: unverifiedEmail,
          is_verified: false,
        },
      })

      expect(updatedUserAuth?.verify_token).toBe(originalToken)
    })

    // Cleanup
    await deleteUserByEmail(unverifiedEmail)
  })

  test('Should login with new registered user', async ({ page }) => {
    await test.step('Log in with newly created and verified account', async () => {
      await page.goto('/signin')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')

      // Wait for successful login and redirection
      await page.waitForURL(/\/bots/, { timeout: 20000 })

      // Check if workspace is visible
      await expect(page.locator(`text="${testName}'s workspace"`).first()).toBeVisible({
        timeout: 20000,
      })
    })

    await test.step('Verify account profile', async () => {
      await page.goto('/account/profile');

      const emailInput = page.locator('input[name="email"]');

      await expect(emailInput).toBeVisible({ timeout: 20000 });
      await expect(emailInput).toHaveValue(testEmail, { timeout: 20000 });

      console.log('Successfully logged in with verified account');
    });
  });

  test('Should successfully logout user', async ({ page }) => {
    await test.step('Login with user account', async () => {
      await page.goto('/signin')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')

      // Wait for successful login and redirection
      await page.waitForURL(/\/bots/, { timeout: 20000 })
    })

    await test.step('Click logout button from user menu', async () => {
      // Open user menu using aria-label
      const userMenu = page.locator('button[aria-label="User Account Menu"]')

      await expect(userMenu).toBeVisible({ timeout: 5000 })
      await userMenu.click()

      // Find and click logout option
      const logoutButton = page.locator('text=Logout')

      await expect(logoutButton).toBeVisible({ timeout: 5000 })
      await logoutButton.click()

      // Verify redirection to login page
      await page.waitForURL(/\/signin/, { timeout: 10000 })
      await expect(page.locator('text=/Sign in/i')).toBeVisible({ timeout: 5000 })
    })

    await test.step('Verify user cannot access protected routes after logout', async () => {
      // Try to access a protected route
      await page.goto('/bots')

      // Should be redirected to login page
      await page.waitForURL(/\/signin/, { timeout: 10000 })
      await expect(page.locator('text=/Sign in/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test('Should validate form fields on signup page', async ({ page }) => {
    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup')
    })

    await test.step('Test empty form submission', async () => {
      await page.click('button[type="submit"]')
      // Check for validation error messages (browser validation should prevent submission)
      await expect(page.locator('input[name="name"]:invalid')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Test email format validation', async () => {
      await page.fill('input[name="name"]', testName)
      await page.fill('input[name="lastname"]', testLastname)
      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      // Check for email validation message
      await expect(page.locator('input[name="email"]:invalid')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Test password validation', async () => {
      // Fill only name, lastname and email
      await page.fill('input[name="name"]', testName)
      await page.fill('input[name="lastname"]', testLastname)
      await page.fill('input[name="email"]', `random-${Date.now()}@urbiport.com`)
      await page.fill('input[name="password"]', 'short')
      await page.click('button[type="submit"]')
      // Check for password validation message
      await expect(page.locator('input[name="password"]:invalid')).toBeVisible({ timeout: 20000 });
    });
  });

  test('Should allow navigation between signup and signin pages', async ({ page }) => {
    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup')
    })

    await test.step('Check for signin link and navigate', async () => {
      const signinLink = page.locator('text=/Sign in/i').first();
      await expect(signinLink).toBeVisible({ timeout: 20000 });
      await signinLink.click();

      // Check URL after navigation
      await expect(page).toHaveURL(/\/signin/)
    })

    await test.step('Check for signup link from signin page and navigate back', async () => {
      const signupLink = page.locator('text=/Sign up/i').first();
      await expect(signupLink).toBeVisible({ timeout: 20000 });
      await signupLink.click();

      // Check URL after navigation back
      await expect(page).toHaveURL(/\/signup/)
    })
  })

  test('Should show error for invalid login credentials', async ({ page }) => {
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin')
    })

    await test.step('Try to log in with non-existent account', async () => {
      await page.fill('input[name="email"]', 'nonexistent@example.com')
      await page.fill('input[name="password"]', 'WrongPassword123!')
      await page.click('button[type="submit"]')

      // Check for error message
      await expect(page.locator('text="Invalid email or password."').first()).toBeVisible({
        timeout: 10000,
      })
    })

    await test.step('Try to log in with correct email but wrong password', async () => {
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', 'WrongPassword123!')
      await page.click('button[type="submit"]')

      // Check for error message
      await expect(page.locator('text="Invalid email or password."').first()).toBeVisible({
        timeout: 10000,
      })
    })
  })

  test('Should handle password recovery flow', async ({ page }) => {
    await test.step('Navigate to forgot password page', async () => {
      await page.goto('/signin');
      const forgotPasswordLink = page.locator('text=/Forgot your password/i').first();
      await expect(forgotPasswordLink).toBeVisible({ timeout: 20000 });
      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    await test.step('Request password reset', async () => {
      await page.fill('input[name="email"]', testEmail)
      await page.click('button[type="submit"]')

      // Check for success message
      await expect(page.locator('text="Password Reset Email Sent"')).toBeVisible({ timeout: 10000 })
    })

    await test.step('Get reset token from database', async () => {
      // Find the user auth record
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          username: testEmail,
        },
      })

      expect(userAuth).not.toBeNull()
      expect(userAuth?.recovery_password_token).not.toBeNull()

      // Simulate clicking the reset link
      await page.goto(`/reset-password?token=${userAuth?.recovery_password_token}`)
      await expect(page.locator('text="Reset Password"')).toBeVisible({ timeout: 10000 })
    })

    await test.step('Set new password', async () => {
      const newPassword = 'NewSecurePassword123!'
      await page.fill('input[name="password"]', newPassword)
      await page.fill('input[name="confirmPassword"]', newPassword)
      await page.click('button[type="submit"]')

      // Check for success message
      await expect(page.locator('text="Password Reset Successful"').nth(0)).toBeVisible({ timeout: 20000 })
    })

    await test.step('Login with new password', async () => {
      await page.goto('/signin')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', 'NewSecurePassword123!')
      await page.click('button[type="submit"]')

      // Wait for successful login and redirection
      await page.waitForURL(/\/bots/, { timeout: 20000 })
    })
  })

  test('Should test social login UI elements', async ({ page }) => {
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin')
    })

    await test.step('Check social login buttons exist', async () => {
      // Check if social login section exists
      const socialSection = page.locator('text=/Or continue with/i');
      await expect(socialSection).toBeVisible({ timeout: 20000 });

      // Check for specific social login buttons that might be available
      const googleButton = page.locator('button:has-text("Continue with Google")').first()
      const githubButton = page.locator('button:has-text("Continue with GitHub")').first()

      // We only assert that at least one social login option is available
      // since implementations may vary
      expect((await googleButton.isVisible()) || (await githubButton.isVisible())).toBeTruthy()
    })
  })

  test("Shouldn't reset the password on unverified accounts", async ({ page }) => {
    // Create a test user that is not verified
    const verificationTestEmail = `verify-test-${Date.now()}@urbiport.com`

    await test.step('Clean up any existing test user', async () => {
      await deleteUserByEmail(verificationTestEmail)
    })

    await test.step('Register a new user for verification test', async () => {
      await page.goto('/signup')
      await page.fill('input[name="name"]', 'Verify')
      await page.fill('input[name="lastname"]', 'User')
      await page.fill('input[name="email"]', verificationTestEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')

      // Wait for the success message
      await expect(page.locator('text="Email Verification Sent"')).toBeVisible({ timeout: 20000 });
    });

    await test.step('Verify unverified account cannot reset password', async () => {
      // Find the user auth record to confirm it's not verified
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          username: verificationTestEmail,
          is_verified: false,
        },
      })

      expect(userAuth).not.toBeNull()
      expect(userAuth?.verify_token).not.toBeNull()

      // Save the original verification token for later use
      const originalVerificationToken = userAuth?.verify_token
      console.log(`Original verification token: ${originalVerificationToken}`)

      // Request password reset before verifying email
      await page.goto('/forgot-password')
      await page.fill('input[name="email"]', verificationTestEmail)
      await page.click('button[type="submit"]')

      // Check for error message indicating account needs to be verified first
      await expect(
        page.locator('text="Account not verified. Please verify your account first."').first(),
      ).toBeVisible({ timeout: 10000 })

      // Verify that no password reset token was generated
      const updatedUserAuth = await prisma.userAuth.findFirst({
        where: {
          username: verificationTestEmail,
        },
      })

      expect(updatedUserAuth).not.toBeNull()
      expect(updatedUserAuth?.recovery_password_token).toBeNull()
    })

    await test.step('Verify original verification token still works', async () => {
      // Get the verification token again
      const userAuth = await prisma.userAuth.findFirst({
        where: {
          username: verificationTestEmail,
          is_verified: false,
        },
      })

      const originalVerificationToken = userAuth?.verify_token

      // Attempt to use the original verification token
      await page.goto(`/verify-email?token=${originalVerificationToken}`)

      // Check for success message (the token should work since it wasn't invalidated)
      await expect(page.locator('text=Email Verification Successful').first()).toBeVisible({
        timeout: 10000,
      })

      // Verify that the account is now verified
      const finalUserAuth = await prisma.userAuth.findFirst({
        where: {
          username: verificationTestEmail,
        },
      })

      expect(finalUserAuth).not.toBeNull()
      expect(finalUserAuth?.is_verified).toBe(true)
    })

    await test.step('Now verified account can reset password', async () => {
      // Now that the account is verified, try requesting a password reset
      await page.goto('/forgot-password')
      await page.fill('input[name="email"]', verificationTestEmail)
      await page.click('button[type="submit"]')

      // Now the password reset should be successful
      await expect(page.locator('text="Password Reset Email Sent"').first()).toBeVisible({
        timeout: 10000,
      })

      // Verify a reset token was generated
      const verifiedUserAuth = await prisma.userAuth.findFirst({
        where: {
          username: verificationTestEmail,
        },
      })

      expect(verifiedUserAuth).not.toBeNull()
      expect(verifiedUserAuth?.recovery_password_token).not.toBeNull()
    })

    // Clean up test user
    await deleteUserByEmail(verificationTestEmail)
  })

  test.afterAll(async () => {
    // Disconnect prisma when done
    await deleteUserByEmail(testEmail)
    await prisma.$disconnect()
  })
})
