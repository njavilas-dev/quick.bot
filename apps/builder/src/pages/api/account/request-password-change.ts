import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated, options } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { createPasswordChangeRequest, getPendingPasswordChangeRequest } from '@quickbot.io/lib/password-change-request'
import { sendPasswordChangeConfirmationEmail } from '@quickbot.io/emails/src/emails/password-change-confirmation-email'
import { env } from '@quickbot.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  try {
    const { password, confirmPassword } = req.body

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: 'Password and confirm password are required.',
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Password and confirm password do not match.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      })
    }

    // Verify if there's a pending request
    const existingRequest = await getPendingPasswordChangeRequest(user.id)
    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have a pending password change request. Please check your email or wait for it to expire.',
      })
    }

    // Create the password change request
    const passwordChangeRequest = await createPasswordChangeRequest({
      userId: user.id,
      newPassword: password,
    })

    // Send confirmation email
    try {
      await sendPasswordChangeConfirmationEmail({
        to: user.email || 'example@example.com',
        userName: user.name || 'User',
        confirmationUrl: `${env.NEXTAUTH_URL}/account/confirm-password-change?token=${passwordChangeRequest.token}`,
        expiresAt: passwordChangeRequest.expiresAt,
      })
    } catch (error) {
      console.error('Error sending password change confirmation email:', error)
    }

    return res.status(201).json({
      message: 'Password change request created successfully. Please check your email to confirm the change.',
    })
  } catch (error) {
    console.error('Error creating password change request:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
