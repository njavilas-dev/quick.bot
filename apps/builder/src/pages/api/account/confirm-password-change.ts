import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, options } from '@quickbot.io/lib/api'
import { confirmPasswordChangeRequest, validatePasswordChangeToken } from '@quickbot.io/lib/password-change-request'
import { sendUserAuthChangedPasswordEmail } from '@quickbot.io/emails/src/emails/user-auth-changed-password-email'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        message: 'Token is required.',
      })
    }

    // Validate token and distinguish between invalid and expired
    const tokenValidation = await validatePasswordChangeToken(token)

    if (!tokenValidation.isValid) {
      return res.status(400).json({
        message: tokenValidation.isExpired === true ? 'Token has expired.' : 'Invalid token.',
        errorType: tokenValidation.errorType,
      })
    }

    const passwordChangeRequest = tokenValidation.request

    // Confirm the password change
    await confirmPasswordChangeRequest(token)

    // Send success notification email
    try {
      await sendUserAuthChangedPasswordEmail({
        to: passwordChangeRequest.user.email || 'example@example.com',
        userName: passwordChangeRequest.user.name || 'User',
        changedAt: new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Madrid'
        })
      })
    } catch (error) {
      console.error('Error sending password change notification email:', error)
      // Do not fail the operation if the email fails
    }

    return res.status(200).json({
      message: 'Password changed successfully.',
    })
  } catch (error) {
    console.error('Error confirming password change:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
