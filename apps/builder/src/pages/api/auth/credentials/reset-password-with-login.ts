import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, options } from '@quickbot.io/lib/api'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { env } from '@quickbot.io/env'
import { generateId } from '@quickbot.io/lib'
import { sendUserAuthResetPasswordEmail } from '@quickbot.io/emails/src/emails/user-auth-reset-password-email'
import { sendUserForgetMyPasswordTokenEmail } from '@quickbot.io/emails/src/emails/user-forget-my-password-token-email'

export const getCredentialAccount = async (userId: string, email: string) =>
  await prisma.userAuth.findFirst({
    where: {
      userId,
      provider: 'credentials',
      username: email,
    },
  })

export const sendResetPasswordEmail = async (
  email: string,
  verifyToken: string,
  isExternalSite: boolean,
) => {
  if (isExternalSite) {
    await sendUserForgetMyPasswordTokenEmail({ to: email, token: verifyToken })
  } else {
    const url = `${env.NEXTAUTH_URL}/reset-password?token=${verifyToken}`
    await sendUserAuthResetPasswordEmail({ to: email, url })
  }
}

export const createOrUpdateCredentialAccount = async (userId: string, email: string) => {
  const randomPassword = crypt(generateId(12))
  const resetToken = crypt(`QuickBotLinkAccount#${Date.now()}`)

  const existingAccount = await getCredentialAccount(userId, email)

  if (existingAccount) {
    await prisma.userAuth.update({
      where: { id: existingAccount.id },
      data: {
        recovery_password_token: resetToken,
      },
    })
    return { accountId: existingAccount.id, token: resetToken }
  } else {
    const newAccount = await prisma.userAuth.create({
      data: {
        userId,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: email,
        username: email,
        password: randomPassword,
        is_verified: true,
        recovery_password_token: resetToken,
      },
    })
    return { accountId: newAccount.id, token: resetToken }
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  if (req.method !== 'POST') return methodNotAllowed(res)

  const { userId, email } = req.body

  if (!userId || !email) return badRequest(res, 'User ID and email are required.')

  try {
    const isExternalSite = req.headers.origin !== env.NEXTAUTH_URL
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    })

    if (!existingUser) return badRequest(res, 'User not found.')
    if (existingUser.email !== email) return badRequest(res, 'Email does not match user record.')

    const { token } = await createOrUpdateCredentialAccount(userId, email)

    await sendResetPasswordEmail(email, token, isExternalSite)

    return res.status(201).send({
      message: 'Password setup link sent successfully.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({
      message: 'An unexpected error occurred.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default handler
