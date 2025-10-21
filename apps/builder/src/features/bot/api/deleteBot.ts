import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Bot } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isWriteBotForbidden } from '../helpers/isWriteBotForbidden'
import { archiveResults } from '@quickbot.io/results/archiveResults'
import { removeObjectsFromBot } from '@quickbot.io/lib/s3/removeObjectsRecursively'
import { env } from '@quickbot.io/env'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'

export const deleteBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/bots/{botId}',
      protect: true,
      summary: 'Delete a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      botId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)",
        ),
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
      select: {
        id: true,
        name: true,
        groups: true,
        workspace: {
          select: {
            id: true,
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
        botCollaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })
    if (!existingBot?.id || (await isWriteBotForbidden(existingBot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    const { success } = await archiveResults(prisma)({
      bot: {
        id: botId,
        workspaceId: existingBot.workspace.id,
        groups: existingBot.groups as Bot['groups'],
      },
      resultsFilter: { botId },
    })
    if (!success)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to archive results',
      })

    await trackEvents([
      {
        name: 'Bot deleted',
        workspaceId: existingBot.workspace.id,
        botId: existingBot.id,
        userId: user.id,
        data: {
          name: existingBot.name,
        },
      },
    ])

    await prisma.botPublic.deleteMany({
      where: { botId: botId },
    })
    await prisma.bot.updateMany({
      where: { id: botId },
      data: { isArchived: true, publicId: null, customDomain: null },
    })
    if (env.S3_BUCKET)
      await removeObjectsFromBot({
        workspaceId: existingBot.workspace.id,
        botId,
      })
    return {
      message: 'success',
    }
  })
