import prisma from '@quickbot.io/lib/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { badRequest, methodNotAllowed, options } from '@quickbot.io/lib/api'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { env } from '@quickbot.io/env'
import { sendUserAuthResetPasswordEmail } from '@quickbot.io/emails/src/emails/user-auth-reset-password-email'
import { sendUserForgetMyPasswordTokenEmail } from '@quickbot.io/emails/src/emails/user-forget-my-password-token-email'

export type ForgotPasswordData = {
  accountId: string
  token: string
}

export const getAccountByEmail = async (email: string) =>
  await prisma.userAuth.findUnique({
    where: {
      provider_providerAccountId: {
        provider: 'credentials',
        providerAccountId: email,
      },
    },
  })

export const getUserByEmail = async (email: string) =>
  await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  })

export const createCredentialsAccountForGoogleUser = async (userId: string, email: string) => {
  const randomPassword = crypt(`QuickBotTempPassword#${Date.now()}`)
  const resetToken = crypt(`QuickBotForgotPassword#${Date.now()}`)

  return await prisma.userAuth.create({
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
}

export const sendForgetPasswordEmail = async (
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

export const createForgotPasswordToken = async (data: ForgotPasswordData) => {
  await prisma.userAuth.update({
    where: { id: data.accountId },
    data: {
      recovery_password_token: data.token,
    },
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  if (req.method !== 'POST') return methodNotAllowed(res)

  const { email } = req.body

  if (!email) return badRequest(res, 'All fields are required.')

  try {
    const isExternalSite = req.headers.origin !== env.NEXTAUTH_URL

    let existingAccount = await getAccountByEmail(email)

    if (!existingAccount) {

      const user = await getUserByEmail(email)

      if (!user) {
        return badRequest(res, `Account doesn't exist.`)
      }

      const hasOAuthProvider = user.accounts.some(account =>
        ['google', 'github', 'facebook', 'azure-ad', 'keycloak', 'custom-oauth'].includes(account.provider)
      )


      if (!hasOAuthProvider) {
        return badRequest(res, `Account doesn't exist.`)
      }

      existingAccount = await createCredentialsAccountForGoogleUser(user.id, email)

    }

    if (existingAccount.is_verified !== true) {
      return badRequest(res, `Account not verified. Please verify your account first.`)
    }

    const forgotPasswordToken = crypt(`QuickBotForgotPassword#${Date.now()}`)

    await createForgotPasswordToken({
      accountId: existingAccount.id,
      token: forgotPasswordToken,
    })

    await sendForgetPasswordEmail(email, forgotPasswordToken, isExternalSite)

    return res.status(201).send({
      message: 'Request recovery password successfully.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'An unexpected error occurred.' })
  }
}

export default handler
