import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, options } from '@quickbot.io/lib/api'
import { confirmEmailChange } from '@quickbot.io/lib/email-change-request'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const { token } = req.body

  if (!token || typeof token !== 'string') {
    return badRequest(res, 'Token is required')
  }

  try {
    const updatedUser = await confirmEmailChange(token)

    if (updatedUser.email === null) {
      return badRequest(res, 'This email is not available')
    }

    return res.status(200).json({
      message: 'Email changed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
      },
    })
  } catch (error) {
    console.error('Error confirming email change:', error)

    if (error instanceof Error) {
      if (error.message === 'Invalid or expired token') {
        return badRequest(res, 'Invalid or expired confirmation link')
      }
      if (error.message === 'Email is no longer available') {
        return badRequest(res, 'This email is no longer available')
      }
    }

    return res.status(500).json({
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
