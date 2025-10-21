import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { defaultTimeFilter, Stats, statsSchema, timeFilterValues } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'
import { formatStatsData } from '../helpers/formatStatsData'

export const getAnalytics = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/analytics/stats',
      protect: true,
      summary: 'Get aggregated analytics stats for multiple bots',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      botIds: z.string().min(1, 'At least one bot ID is required').describe('Comma-separated list of bot IDs'),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
      timeZone: z.string().optional(),
    }).transform((input) => ({
      ...input,
      botIds: input.botIds.split(',').map((id) => id.trim()),
    })),
  )
  .output(
    z.object({
      stats: statsSchema,
    }),
  )
  .query(async ({ input: { botIds, timeFilter, timeZone }, ctx: { user } }) => {
    if (botIds.length === 0) {
      return {
        stats: {
          totalBots: 0,
          totalViews: 0,
          totalStarts: 0,
          totalCompleted: 0,
          totalViewsPerDay: [],
          totalStartsPerDay: [],
          totalCompletedPerDay: [],
          conversionRate: 0,
          viewToStartRate: 0,
          completionRate: 0,
          dropOffRate: 0,
        },
      }
    }

    // Verify user has access to all requested bots
    const accessibleBots = await prisma.bot.findMany({
      where: canReadBots(botIds, user),
      select: { id: true },
    })

    if (accessibleBots.length !== botIds.length) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access one or more of the requested bots',
      })
    }

    const accessibleBotIds = accessibleBots.map((bot) => bot.id)

    const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
    const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

    const [
      totalViews,
      totalStarts,
      totalCompleted,
      totalViewsPerDay,
      totalStartsPerDay,
      totalCompletedPerDay,
    ] = await prisma.$transaction([
      prisma.botResult.count({
        where: {
          botId: {
            in: accessibleBotIds,
          },
          isArchived: false,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
      }),
      prisma.botResult.count({
        where: {
          botId: {
            in: accessibleBotIds,
          },
          isArchived: false,
          hasStarted: true,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
      }),
      prisma.botResult.count({
        where: {
          botId: {
            in: accessibleBotIds,
          },
          isArchived: false,
          isCompleted: true,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
      }),
      prisma.botResult.groupBy({
        by: ['createdAt'],
        where: {
          botId: {
            in: accessibleBotIds,
          },
          isArchived: false,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.botResult.groupBy({
        by: ['createdAt'],
        where: {
          botId: {
            in: accessibleBotIds,
          },
          isArchived: false,
          hasStarted: true,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.botResult.groupBy({
        by: ['createdAt'],
        where: {
          botId: {
            in: accessibleBotIds,
          },
          isArchived: false,
          isCompleted: true,
          createdAt: fromDate
            ? {
              gte: fromDate,
              lte: toDate ?? undefined,
            }
            : undefined,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ])

    const fillMissingType =
      timeFilter === 'last30Days' ? 'last30Days' :
        timeFilter === 'lastMonth' ? 'lastMonth' :
          timeFilter === 'yearToDate' ? 'yearToDate' :
            'none'

    // Calculate conversion rates
    const conversionRate = totalStarts > 0 ? (totalCompleted / totalStarts) * 100 : 0
    const viewToStartRate = totalViews > 0 ? (totalStarts / totalViews) * 100 : 0
    const completionRate = totalViews > 0 ? (totalCompleted / totalViews) * 100 : 0
    const dropOffRate = totalStarts > 0 ? ((totalStarts - totalCompleted) / totalStarts) * 100 : 0

    const stats: Stats = {
      totalBots: accessibleBotIds.length,
      totalViews,
      totalStarts,
      totalCompleted,
      // @ts-expect-error For some reason Typescript don't recognize properties of prisma
      totalViewsPerDay: formatStatsData(totalViewsPerDay, fillMissingType),
      // @ts-expect-error For some reason Typescript don't recognize properties of prisma
      totalStartsPerDay: formatStatsData(totalStartsPerDay, fillMissingType),
      // @ts-expect-error For some reason Typescript don't recognize properties of prisma
      totalCompletedPerDay: formatStatsData(totalCompletedPerDay, fillMissingType),
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
      viewToStartRate: Math.round(viewToStartRate * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      dropOffRate: Math.round(dropOffRate * 100) / 100,
    }

    return {
      stats,
    }
  })
