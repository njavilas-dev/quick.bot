import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, options } from '@quickbot.io/lib/api'
import { confirmEmailChange, validateEmailChangeToken } from '@quickbot.io/lib/email-change-request'
import { sendUserAuthChangedEmailEmail } from '@quickbot.io/emails/src/emails/user-auth-changed-email-email'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  // Accept both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res)

  // Get token from query parameter (GET) or body (POST)
  // Support both 'token' and 'confirmEmail' query parameters for backward compatibility
  const token =
    req.method === 'GET'
      ? (req.query.token as string) || (req.query.confirmEmail as string)
      : req.body.token

  if (!token || typeof token !== 'string') {
    if (req.method === 'GET') {
      // Redirect to confirm-email page with error for GET
      return res.redirect(302, '/account/confirm-email?error=invalid_token')
    } else {
      return res.status(400).json({
        message: 'Token is required',
        errorType: 'INVALID_TOKEN',
      })
    }
  }

  try {
    // For POST requests, use detailed validation
    if (req.method === 'POST') {
      const tokenValidation = await validateEmailChangeToken(token)

      if (!tokenValidation.isValid) {
        return res.status(400).json({
          message:
            tokenValidation.errorType === 'EXPIRED_TOKEN'
              ? 'Token has expired.'
              : tokenValidation.errorType === 'EMAIL_UNAVAILABLE'
              ? 'This email is no longer available.'
              : 'Invalid token.',
          errorType: tokenValidation.errorType,
        })
      }

      const updatedUser = await confirmEmailChange(token)

      if (updatedUser.email === null) {
        return res.status(400).json({ message: 'This email is not available' })
      }

      // Send success notification email
      try {
        await sendUserAuthChangedEmailEmail({
          to: updatedUser.email || 'example@example.com',
          userName: updatedUser.name || 'User',
          oldEmail: tokenValidation.request.oldValue,
          newEmail: updatedUser.email,
          changedAt: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid',
          }),
        })
      } catch (error) {
        console.error('Error sending email change notification email:', error)
        // Do not fail the operation if the email fails
      }

      return res.status(200).json({
        message: 'Email changed successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
        },
      })
    } else {
      // For GET requests, redirect to the new confirmation page
      return res.redirect(302, `/account/confirm-email?token=${token}`)
    }
  } catch (error) {
    console.error('Error confirming email change:', error)

    if (req.method === 'GET') {
      // Redirect to confirm-email page with error for GET
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired token') {
          return res.redirect(302, '/account/confirm-email?error=expired_token')
        }
        if (error.message === 'Email is no longer available') {
          return res.redirect(302, '/account/confirm-email?error=email_unavailable')
        }
      }
      return res.redirect(302, '/account/confirm-email?error=confirmation_failed')
    } else {
      // JSON error response for POST
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired token') {
          return res.status(400).json({
            message: 'Invalid or expired confirmation link',
            errorType: 'EXPIRED_TOKEN',
          })
        }
        if (error.message === 'Email is no longer available') {
          return res.status(400).json({
            message: 'This email is no longer available',
            errorType: 'EMAIL_UNAVAILABLE',
          })
        }
      }

      return res.status(500).json({
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

export default handler
