import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { logSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'

export const getResultLogs = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/analytics/{botId}/answers/{resultId}/logs',
      protect: true,
      summary: 'List result logs',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
      resultId: z.string(),
    }),
  )
  .output(z.object({ logs: z.array(logSchema) }))
  .query(async ({ input: { botId, resultId }, ctx: { user } }) => {
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId,
      },
      select: {
        id: true,
        groups: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
        botCollaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })
    if (!bot || (await isReadBotForbidden(bot, user))) throw new Error('Bot not found')
    const logs = await prisma.botLog.findMany({
      where: {
        resultId,
      },
    })

    return { logs }
  })
