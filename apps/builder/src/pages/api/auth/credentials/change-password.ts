import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, options, notAuthenticated } from '@quickbot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { crypt } from '@quickbot.io/lib/crypt-password'
import prisma from '@quickbot.io/lib/prisma'
import { sendUserAuthChangedPasswordEmail } from '@quickbot.io/emails'

export const updateNewPassword = async (accountId: string, password: string) => {
  await prisma.userAuth.update({
    where: { id: accountId },
    data: {
      password: password,
      recovery_password_token: null,
    },
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  if (req.method !== 'POST') return methodNotAllowed(res)

  const { password, confirmPassword } = req.body

  if (!password || !confirmPassword) {
    return badRequest(res, 'Password and confirm password are required.')
  }

  if (password !== confirmPassword) {
    return badRequest(res, 'Password and confirm password do not match.')
  }

  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const userAuth = await prisma.userAuth.findFirst({
    where: {
      userId: user.id,
      provider: 'credentials',
    },
  })

  if (!userAuth) {
    return badRequest(res, 'User authentication account not found.')
  }

  const encryptedPassword = crypt(password)

  await updateNewPassword(userAuth.id, encryptedPassword)

  try {

    sendUserAuthChangedPasswordEmail({
      to: user.email || '',
      userName: user.name || 'Usuario',
      changedAt: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Madrid'
      })
    })

    console.log('Password change notification email sent successfully')
  } catch (error) {
    console.error('Error sending password change notification email:', error)
  }

  return res.status(201).send({
    message: 'Password changed successfully.',
  })
}

export default handler