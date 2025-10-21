import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, notAuthenticated, options } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { createEmailChangeRequest, isEmailInPendingRequest } from '@quickbot.io/lib/email-change-request'
import { sendChangeEmailConfirmationEmail } from '@quickbot.io/emails'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const { newEmail } = req.body

  if (!newEmail || typeof newEmail !== 'string') {
    return badRequest(res, 'New email is required')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return badRequest(res, 'Invalid email format')
  }

  // Verify it's not the same current email
  if (user.email === newEmail) {
    return badRequest(res, 'New email must be different from current email')
  }

  try {
    // Verify that the email is not in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (existingUser) {
      return badRequest(res, 'This email is already registered')
    }

    // Verify there's no pending request for this email
    const emailInPendingRequest = await isEmailInPendingRequest(newEmail)
    if (emailInPendingRequest) {
      return badRequest(res, 'This email has a pending change request')
    }

    // Create the email change request
    const emailChangeRequest = await createEmailChangeRequest({
      userId: user.id,
      currentEmail: user.email || '',
      newEmail,
    })

    // Send confirmation email
    const confirmationUrl = `${env.NEXTAUTH_URL}/api/account/confirm-email?token=${emailChangeRequest.token}`

    await sendChangeEmailConfirmationEmail({
      to: newEmail,
      userName: user.name || 'User',
      currentEmail: user.email || '',
      newEmail,
      confirmationUrl,
    })

    return res.status(200).json({
      message: 'Email confirmation sent successfully',
      pendingEmail: newEmail,
      expiresAt: emailChangeRequest.expiresAt,
    })
  } catch (error) {
    console.error('Error requesting email change:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
