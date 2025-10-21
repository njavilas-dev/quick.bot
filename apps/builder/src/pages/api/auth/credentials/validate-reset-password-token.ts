import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed } from '@quickbot.io/lib/api'
import { getAccountByRecoveryPasswordToken } from './reset-password'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const { token } = req.body

  if (!token) return badRequest(res, 'Token is required.')

  try {
    const existingAccount = await getAccountByRecoveryPasswordToken(token)
    if (!existingAccount) return badRequest(res, 'Invalid token.')

    return res.status(201).send({
      message: 'Valid token.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'An unexpected error occurred.' })
  }
}

export default handler
