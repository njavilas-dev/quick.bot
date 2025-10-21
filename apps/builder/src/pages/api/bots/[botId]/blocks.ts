import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated, notFound } from '@quickbot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const botId = req.query.botId as string
    const bot = await prisma.bot.findFirst({
      where: canReadBots(botId, user),
      select: { groups: true },
    })
    if (!bot) return notFound(res)
    return res.send({ groups: bot.groups })
  }
  methodNotAllowed(res)
}

export default handler
