import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'
import { invitationSchema } from '@quickbot.io/schemas/features/invitations'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'

export const getInvitations = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/invitations',
      protect: true,
      summary: 'Get invitations',
      tags: ['Invitations'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
    }),
  )
  .output(
    z.object({
      invitations: z.array(invitationSchema),
    }),
  )
  .query(async ({ input: { botId }, ctx: { user } }) => {
    const existingBot = await prisma.bot.findFirst({
      where: {
        ...canReadBots(botId, user),
      },
      include: {
        botInvitations: true,
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
      invitations: existingBot.botInvitations,
    }
  })
