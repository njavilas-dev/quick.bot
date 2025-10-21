import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@quickbot.io/lib/prisma'
import { Stats } from '@quickbot.io/schemas'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { methodNotAllowed, notAuthenticated } from '@quickbot.io/lib/api'

// TODO: Delete, as it has been migrated to tRPC
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const botId = req.query.botId as string

    const bot = await prisma.bot.findFirst({
      where: canReadBots(botId, user),
      select: { id: true },
    })

    if (!bot) return res.status(404).send({ message: 'Bot not found' })

    const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction([
      prisma.botResult.count({
        where: {
          botId: bot.id,
          isArchived: false,
        },
      }),
      prisma.botResult.count({
        where: {
          botId: bot.id,
          isArchived: false,
          hasStarted: true,
        },
      }),
      prisma.botResult.count({
        where: {
          botId: bot.id,
          isArchived: false,
          isCompleted: true,
        },
      }),
    ])

    const stats: Stats = {
      totalViews,
      totalStarts,
      totalCompleted,
    }
    return res.status(200).send({ stats })
  }
  return methodNotAllowed(res)
}

export default handler
