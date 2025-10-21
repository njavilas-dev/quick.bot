import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, notAuthenticated, options } from '@quickbot.io/lib/api'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)
  if (req.method !== 'POST') return methodNotAllowed(res)

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  try {
    const { password, confirmPassword, token } = req.body

    if (!password || !confirmPassword || !token) {
      return badRequest(res, 'Password, confirmation password, and token are required.')
    }

    if (password !== confirmPassword) {
      return badRequest(res, 'Passwords do not match.')
    }

    const userAuth = await prisma.userAuth.findFirst({
      where: {
        userId: user.id,
        recovery_password_token: token,
        provider: 'credentials',
      },
      include: {
        user: true,
      },
    })

    if (!userAuth) {
      return badRequest(res, 'Invalid or expired token.')
    }

    const hashedPassword = crypt(password)
    await prisma.userAuth.update({
      where: {
        id: userAuth.id,
      },
      data: {
        password: hashedPassword,
        recovery_password_token: null,
      },
    })

    return res.status(200).json({ message: 'Password updated successfully.' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
