import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed, options } from '@quickbot.io/lib/api'

export type VerifyAccountData = {
  accountId: string
}

export const getAccountByVerifyToken = async (token: string) => {

  const instance = await prisma.userAuth.findFirst({
    where: {
      is_verified: false, 
      verify_token: token
    }
  })

  console.log(`instance: ${instance}`)

  return instance
}

export const verifyAccount = async (data: VerifyAccountData) => {
  await prisma.userAuth.update({
    where: { id: data.accountId },
    data: {
      is_verified: true,
      verify_token: null,
    },
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') return options(res)

  if (req.method !== 'POST') return methodNotAllowed(res)

  const { token } = req.body

  if (!token) return badRequest(res, 'Token is required.')

  try {

    const existingAccount = await getAccountByVerifyToken(token)

    if (!existingAccount) return badRequest(res, 'Invalid token.')

    await verifyAccount({ accountId: existingAccount.id })

    return res.status(201).send({
      message: 'Email verified successfully.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'An unexpected error occurred.' })
  }
}

export default handler
