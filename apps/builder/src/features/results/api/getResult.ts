import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { resultWithAnswersSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden'

export const getResult = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/analytics/{botId}/answers/{resultId}',
      protect: true,
      summary: 'Get result by id',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      botId: z.string().describe("[Where to find my bot's ID?](https://docs.quick.bot/api/authentication#how-to-find-my-botid)"),
      resultId: z
        .string()
        .describe(
          'The `resultId` is returned by the /startChat endpoint or you can find it by listing results with `/results` endpoint',
        ),
    }),
  )
  .output(
    z.object({
      result: resultWithAnswersSchema,
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    const bot = await prisma.bot.findUnique({
      where: {
        id: input.botId,
      },
      select: {
        id: true,
        groups: true,
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
            userId: true,
            type: true,
          },
        },
      },
    })
    if (!bot || (await isReadBotForbidden(bot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })
    const results = await prisma.botResult.findMany({
      where: {
        id: input.resultId,
        botId: bot.id,
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

    if (results.length === 0)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Result not found' })

    const { answersV2, ...result } = results[0]

    return {
      result: resultWithAnswersSchema.parse({
        ...result,
        answers: answersV2
          .map((a) => ({
            ...a,
            attachedFileUrls: a.attachedFileUrls === null ? undefined : a.attachedFileUrls,
          }))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      }),
    }
  })
