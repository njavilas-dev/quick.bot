import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'
import { isDefined } from '@quickbot.io/lib'
import { preprocessBot } from '@quickbot.io/schemas/features/bot/helpers/preprocessBot'
import { parseGroups } from '@quickbot.io/schemas/features/bot/group'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { botV5Schema, botV6Schema } from '@quickbot.io/schemas'

const pick = {
  version: true,
  groups: true,
  variables: true,
  name: true,
} as const

const output = z.object({
  bots: z.array(
    z.preprocess(
      preprocessBot,
      z.discriminatedUnion('version', [botV5Schema._def.schema.pick(pick), botV6Schema.pick(pick)]),
    ),
  ),
})

export const getLinkedBots = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/linkedBots',
      protect: true,
      summary: 'Get linked bots',
      tags: ['Bot'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
    }),
  )
  .output(output)
  .query(async ({ input: { botId }, ctx: { user } }) => {
    const bot = await prisma.bot.findFirst({
      where: {
        id: botId,
      },
      select: {
        id: true,
        version: true,
        groups: true,
        variables: true,
        name: true,
        createdAt: true,
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
            type: true,
            userId: true,
          },
        },
      },
    })

    if (!bot || (await isReadBotForbidden(bot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No bot found' })

    const linkedBotIds =
      parseGroups(bot.groups, { botVersion: bot.version })
        .flatMap((group) => group.blocks)
        .reduce<string[]>((botIds, block) => {
          if (block.type !== LogicBlockType.BOT_LINK) return botIds
          const botId = block.options?.botId
          return isDefined(botId) &&
            !botIds.includes(botId) &&
            block.options?.mergeResults !== false
            ? [...botIds, botId]
            : botIds
        }, []) ?? []

    if (!linkedBotIds.length) return { bots: [] }

    const bots = (
      await prisma.bot.findMany({
        where: {
          isArchived: { not: true },
          id: { in: linkedBotIds },
        },
        select: {
          id: true,
          version: true,
          groups: true,
          variables: true,
          name: true,
          createdAt: true,
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
              type: true,
              userId: true,
            },
          },
        },
      })
    )
      .filter(async (bot) => !(await isReadBotForbidden(bot, user)))
      // To avoid the out of sort memory error, we sort the bots manually
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      .map((bot) => ({
        ...bot,
        groups: parseGroups(bot.groups, {
          botVersion: bot.version,
        }),
        variables: botV6Schema.shape.variables.parse(bot.variables),
      }))

    return {
      bots,
    }
  })
