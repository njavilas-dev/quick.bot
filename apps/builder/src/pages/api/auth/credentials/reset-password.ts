import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, options } from '@quickbot.io/lib/api'
import { crypt } from '@quickbot.io/lib/crypt-password'

export type LinkAccountData = {
  accountId: string
  password: string
}

export const getAccountByRecoveryPasswordToken = async (token: string) =>
  await prisma.userAuth.findFirst({
    where: {
      recovery_password_token: token,
    },
  })

export const updateNewPassword = async (data: LinkAccountData) => {
  await prisma.userAuth.update({
    where: { id: data.accountId },
    data: {
      password: data.password,
      recovery_password_token: null,
    },
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  if (req.method !== 'POST') return methodNotAllowed(res)

  const { token, password, confirmPassword } = req.body

  if (!token || !password || !confirmPassword)
    return badRequest(res, 'All fields are required.')

  if (password !== confirmPassword) return badRequest(res, 'Password does not match.')

  try {
    const existingAccount = await getAccountByRecoveryPasswordToken(token)
    if (!existingAccount) return badRequest(res, `Account doesn't exist.`)

    const encryptedPassword = crypt(password)

    await updateNewPassword({
      accountId: existingAccount.id,
      password: encryptedPassword,
    })

    return res.status(201).send({
      message: 'Recover password successfully.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'An unexpected error occurred.' })
  }
}

export default handler
