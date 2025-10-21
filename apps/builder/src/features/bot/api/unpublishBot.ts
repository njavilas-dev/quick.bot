import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isWriteBotForbidden } from '../helpers/isWriteBotForbidden'

export const unpublishBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/bots/{botId}/unpublish',
      protect: true,
      summary: 'Unpublish a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
    }),
  )
  .output(
    z.object({
      message: z.literal('success'),
    }),
  )
  .mutation(async ({ input: { botId }, ctx: { user } }) => {
    const existingBot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      include: {
        botCollaborators: true,
        publishedBot: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    })
    if (!existingBot?.publishedBot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published bot not found',
      })

    if (!existingBot.id || (await isWriteBotForbidden(existingBot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    await prisma.botPublic.deleteMany({
      where: {
        id: existingBot.publishedBot.id,
      },
    })

    return { message: 'success' }
  })
