import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { resultWithAnswersSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'
import { timeFilterValues, defaultTimeFilter } from '@/features/analytics/constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '@/features/analytics/helpers/parseDateFromTimeFilter'

const maxLimit = 100

export const getResults = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/analytics/{botId}/answers',
      protect: true,
      summary: 'List results ordered by descending creation date',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
      limit: z.coerce.number().min(1).max(maxLimit).default(50),
      cursor: z.string().optional(),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.object({
      results: z.array(resultWithAnswersSchema),
      nextCursor: z.string().nullish(),
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    const limit = Number(input.limit)
    if (limit < 1 || limit > maxLimit)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `limit must be between 1 and ${maxLimit}`,
      })
    const { cursor } = input
    const bot = await prisma.bot.findUnique({
      where: {
        id: input.botId,
      },
      select: {
        id: true,
        groups: true,
        botCollaborators: {
          select: {
            userId: true,
            type: true,
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
    if (!bot || (await isReadBotForbidden(bot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    const fromDate = parseFromDateFromTimeFilter(input.timeFilter, input.timeZone)
    const toDate = parseToDateFromTimeFilter(input.timeFilter, input.timeZone)

    const results = await prisma.botResult.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        botId: bot.id,
        hasStarted: true,
        isArchived: false,
        createdAt: fromDate
          ? {
            gte: fromDate,
            lte: toDate ?? undefined,
          }
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        answersV2: {
          select: {
            blockId: true,
            content: true,
            createdAt: true,
            attachedFileUrls: true,
          },
        },
      },
    })

    let nextCursor: typeof cursor | undefined
    if (results.length > limit) {
      const nextResult = results.pop()
      nextCursor = nextResult?.id
    }

    return {
      results: z.array(resultWithAnswersSchema).parse(
        results.map((r) => ({
          ...r,
          answers: r.answersV2
            .map((a) => ({
              ...a,
              attachedFileUrls: a.attachedFileUrls === null ? undefined : a.attachedFileUrls,
            }))
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
        })),
      ),
      nextCursor,
    }
  })
