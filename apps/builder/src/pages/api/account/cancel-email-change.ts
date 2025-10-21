import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated, options } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { cancelPendingEmailChangeRequests } from '@quickbot.io/lib/email-change-request'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  try {
    await cancelPendingEmailChangeRequests(user.id)

    return res.status(200).json({
      message: 'Email change request cancelled successfully',
    })
  } catch (error) {
    console.error('Error cancelling email change:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
