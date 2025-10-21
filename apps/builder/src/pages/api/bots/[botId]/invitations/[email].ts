import { BotInvitation } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canEditGuests } from '@quickbot.io/db-rules/canEditGuests'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const botId = req.query.botId as string
  const email = req.query.email as string
  if (req.method === 'PATCH') {
    const data = req.body as BotInvitation
    await prisma.botInvitation.updateMany({
      where: { email, bot: canEditGuests(user, botId) },
      data: { type: data.type },
    })
    return res.send({
      message: 'success',
    })
  }
  if (req.method === 'DELETE') {
    await prisma.botInvitation.deleteMany({
      where: {
        email,
        bot: canEditGuests(user, botId),
      },
    })
    return res.send({
      message: 'success',
    })
  }
  methodNotAllowed(res)
}

export default handler
