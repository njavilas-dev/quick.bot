import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@quickbot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const bots = await prisma.bot.findMany({
      where: {
        workspace: { members: { some: { userId: user.id } } },
        isArchived: { not: true },
      },
      select: {
        name: true,
        publishedBot: { select: { id: true } },
        id: true,
      },
    })
    return res.send({
      bots: bots.map((bot) => ({
        id: bot.id,
        name: bot.name,
        publishedBotId: bot.publishedBot?.id,
      })),
    })
  }
  return methodNotAllowed(res)
}

export default handler
