import prisma from '@quickbot.io/lib/prisma'
import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { botSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isReadBotForbidden } from '../helpers/isReadBotForbidden'
import { migrateBot } from '@quickbot.io/migrations/migrateBot'
import { CollaborationType } from '@quickbot.io/prisma'
import { env } from '@quickbot.io/env'

export const getBot = publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}',
      protect: true,
      summary: 'Get a bot',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
      migrateToLatestVersion: z
        .boolean()
        .optional()
        .default(false)
        .describe('If enabled, the bot will be converted to the latest schema version'),
    }),
  )
  .output(
    z.object({
      bot: botSchema,
      currentUserMode: z.enum(['guest', 'read', 'write']),
    }),
  )
  .query(async ({ input: { botId, migrateToLatestVersion }, ctx: { user } }) => {
    const existingBot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      include: {
        botCollaborators: true,
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

    try {
      const parsedBot = migrateToLatestVersion
        ? await migrateBot(botSchema.parse(existingBot))
        : botSchema.parse(existingBot)

      return {
        bot: parsedBot,
        currentUserMode: getCurrentUserMode(user, existingBot),
      }
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse bot',
        cause: err,
      })
    }
  })

const getCurrentUserMode = (
  user: { email: string | null; id: string } | undefined,
  bot: { botCollaborators: { userId: string; type: CollaborationType }[] } & {
    workspace: { members: { userId: string }[] }
  },
) => {
  const collaborator = bot.botCollaborators.find((c) => c.userId === user?.id)
  const isMemberOfWorkspace = bot.workspace.members.some((m) => m.userId === user?.id)

  if (isMemberOfWorkspace && ['WRITE', 'FULL_ACCESS'].includes(collaborator?.type ?? 'WRITE'))
    return 'write'

  if (collaborator) return 'read'
  if (user?.email && env.ADMIN_EMAIL?.includes(user.email)) return 'read'
  return 'guest'
}
