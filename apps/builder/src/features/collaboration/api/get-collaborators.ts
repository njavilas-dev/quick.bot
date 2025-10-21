import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { collaboratorSchema } from '@quickbot.io/schemas/features/collaborators'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'

export const getCollaborators = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/collaborators',
      protect: true,
      summary: 'Get collaborators',
      tags: ['Collaborators'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
    }),
  )
  .output(
    z.object({
      collaborators: z.array(collaboratorSchema),
    }),
  )
  .query(async ({ input: { botId }, ctx: { user } }) => {
    const existingBot = await prisma.bot.findFirst({
      where: {
        ...canReadBots(botId, user),
      },
      include: {
        botCollaborators: {
          include: {
            user: true,
          },
        },
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
      },
    })
    if (!existingBot?.id || (await isReadBotForbidden(existingBot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    return {
      collaborators: existingBot.botCollaborators,
    }
  })
