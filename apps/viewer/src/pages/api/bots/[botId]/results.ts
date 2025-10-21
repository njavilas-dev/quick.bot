import { authenticateUser } from '@/helpers/authenticateUser'
import prisma from '@quickbot.io/lib/prisma'
import { resultWithAnswersSchema } from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@quickbot.io/lib/api'
import { z } from 'zod'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const botId = req.query.botId as string
    const limit = Number(req.query.limit)
    const results = await prisma.botResult.findMany({
      where: {
        bot: {
          id: botId,
          workspace: { members: { some: { userId: user.id } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        answersV2: {
          select: {
            blockId: true,
            content: true,
            createdAt: true,
            attachedFileUrls: true,
          },
        },
      },
    })
    const formattedResults = z.array(resultWithAnswersSchema).parse(
      results.map(({ answersV2, ...r }) => ({
        ...r,
        answers: answersV2
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map((a) => ({
            blockId: a.blockId,
            content: a.content,
            attachedFileUrls: a.attachedFileUrls === null ? undefined : (a.attachedFileUrls as string[]),
          })),
      })),
    )
    return res.send({ results: formattedResults })
  }
  if (req.method === 'POST') {
    const botId = req.query.botId as string
    const bot = await prisma.bot.findFirst({
      where: { id: botId },
      select: { workspace: { select: { isQuarantined: true } } },
    })
    if (bot?.workspace.isQuarantined) return res.send({ result: null, hasReachedLimit: true })
    const result = await prisma.botResult.create({
      data: {
        botId,
        isCompleted: false,
        variables: [],
      },
    })
    res.send({ result })
    return
  }
  methodNotAllowed(res)
}

export default handler
