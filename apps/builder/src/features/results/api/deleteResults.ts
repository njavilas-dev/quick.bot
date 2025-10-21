import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { archiveResults } from '@quickbot.io/results/archiveResults'
import prisma from '@quickbot.io/lib/prisma'
import { isWriteBotForbidden } from '@/features/bot/helpers/isWriteBotForbidden'
import { Bot } from '@quickbot.io/schemas'

export const deleteResults = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/analytics/{botId}/answers',
      protect: true,
      summary: 'Delete results',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
      resultIds: z
        .string()
        .describe('Comma separated list of ids. If not provided, all results will be deleted. ⚠️')
        .optional(),
    }),
  )
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {
    const idsArray = input.resultIds?.split(',')
    const { botId } = input
    const bot = await prisma.bot.findUnique({
      where: {
        id: botId,
      },
      select: {
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
    if (!bot || (await isWriteBotForbidden(bot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
    const { success } = await archiveResults(prisma)({
      bot: {
        id: botId,
        workspaceId: bot.workspace.id,
        groups: bot.groups as Bot['groups'],
      },
      resultsFilter: {
        id: (idsArray?.length ?? 0) > 0 ? { in: idsArray } : undefined,
        botId: botId,
      },
    })

    if (!success)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Bot not found',
      })
  })
