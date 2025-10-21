import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Bot, publicBotSchema, publicBotSchemaV5, publicBotSchemaV6 } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isReadBotForbidden } from '../helpers/isReadBotForbidden'
import { migratePublicBot } from '@quickbot.io/migrations/migrateBot'

export const getPublishedBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/publishedBot',
      protect: true,
      summary: 'Get published bot',
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
      publishedBot: publicBotSchema.nullable(),
      version: z
        .enum([
          ...publicBotSchemaV5._def.schema.shape.version._def.values,
          publicBotSchemaV6.shape.version._def.value,
        ])
        .optional()
        .describe(
          'Provides the version the published bot was migrated from if `migrateToLatestVersion` is set to `true`.',
        ),
    }),
  )
  .query(async ({ input: { botId, migrateToLatestVersion }, ctx: { user } }) => {
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
              },
            },
          },
        },
      },
    })
    if (!existingBot?.id || (await isReadBotForbidden(existingBot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    if (!existingBot.publishedBot)
      return {
        publishedBot: null,
      }

    try {
      const { botId, ...publishedBot } = existingBot.publishedBot
      const parsedBot = migrateToLatestVersion
        ? await migratePublicBot(publicBotSchema.parse({ botId: botId, ...publishedBot }))
        : publicBotSchema.parse({ botId: botId, ...publishedBot })

      return {
        publishedBot: parsedBot,
        version: migrateToLatestVersion
          ? ((existingBot.version ?? '3') as Bot['version'])
          : undefined,
      }
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse published bot',
        cause: err,
      })
    }
  })
