import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { totalAnswersSchema } from '@quickbot.io/schemas/features/analytics'
import { parseGroups } from '@quickbot.io/schemas'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import { defaultTimeFilter, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'

export const getAnalyticsFlow = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/analytics/{botId}/flow',
      protect: true,
      summary: 'List total answers in blocks and off-default paths visited edges',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.object({
      totalAnswers: z.array(totalAnswersSchema),
      offDefaultPathVisitedEdges: z.array(z.object({ edgeId: z.string(), total: z.number() })),
    }),
  )
  .query(async ({ input: { botId, timeFilter, timeZone }, ctx: { user } }) => {
    const bot = await prisma.bot.findFirst({
      where: canReadBots(botId, user),
      select: { publishedBot: true },
    })
    if (!bot?.publishedBot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published bot not found',
      })

    const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
    const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

    const totalAnswersPerBlock = await prisma.answerV2.groupBy({
      by: ['blockId', 'resultId'],
      where: {
        result: {
          botId: bot.publishedBot.botId,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
        blockId: {
          in: parseGroups(bot.publishedBot.groups, {
            botVersion: bot.publishedBot.version,
          }).flatMap((group) => group.blocks.filter(isInputBlock).map((block) => block.id)),
        },
      },
    })

    // eslint-disable
    const uniqueCounts = totalAnswersPerBlock.reduce<{
      [key: string]: Set<string>
    }>((acc, { blockId, resultId }) => {
      acc[blockId] = acc[blockId] || new Set()
      acc[blockId].add(resultId)
      return acc
    }, {})

    const offDefaultPathVisitedEdges = await prisma.botResultVisitedEdge.groupBy({
      by: ['edgeId'],
      where: {
        result: {
          botId: bot.publishedBot.botId,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
      },
      _count: { resultId: true },
    })

    return {
      totalAnswers: Object.keys(uniqueCounts).map((blockId) => ({
        blockId,
        total: uniqueCounts[blockId].size,
      })),
      offDefaultPathVisitedEdges: offDefaultPathVisitedEdges.map((e) => ({
        edgeId: e.edgeId,
        total: e._count.resultId,
      })),
    }
  })
