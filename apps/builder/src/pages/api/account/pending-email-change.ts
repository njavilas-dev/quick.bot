import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, notAuthenticated, options } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { getPendingEmailChangeRequest } from '@quickbot.io/lib/email-change-request'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'GET') return methodNotAllowed(res)

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  try {
    const pendingRequest = await getPendingEmailChangeRequest(user.id)

    if (!pendingRequest) {
      return res.status(200).json({
        hasPendingRequest: false,
        pendingRequest: null,
      })
    }

    return res.status(200).json({
      hasPendingRequest: true,
      pendingRequest: {
        id: pendingRequest.id,
        newEmail: pendingRequest.newValue,
        createdAt: pendingRequest.createdAt,
        expiresAt: pendingRequest.expiresAt,
        status: pendingRequest.status,
      },
    })
  } catch (error) {
    console.error('Error getting pending email change:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
