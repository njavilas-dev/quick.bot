import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated, options } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { cancelPasswordChangeRequest, getPendingPasswordChangeRequest } from '@quickbot.io/lib/password-change-request'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        message: 'Token is required.',
      })
    }

    // Verify that the user has a pending request with this token
    const pendingRequest = await getPendingPasswordChangeRequest(user.id)
    if (!pendingRequest || pendingRequest.token !== token) {
      return res.status(400).json({
        message: 'No pending password change request found with this token.',
      })
    }

    // Cancel the request
    await cancelPasswordChangeRequest(token)

    return res.status(200).json({
      message: 'Password change request cancelled successfully.',
    })
  } catch (error) {
    console.error('Error cancelling password change request:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
