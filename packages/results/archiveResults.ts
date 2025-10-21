import { Prisma, PrismaClient } from '@quickbot.io/prisma'
import { Bot } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'
import {
  removeAllObjectsFromResult,
  removeObjectsFromResult,
} from '@quickbot.io/lib/s3/removeObjectsRecursively'
import { env } from '../env/env'

type ArchiveResultsProps = {
  bot: Pick<Bot, 'groups' | 'workspaceId' | 'id'>
  resultsFilter?: Omit<Prisma.BotResultWhereInput, 'botId'> & {
    botId: string
  }
}

export const archiveResults =
  (prisma: PrismaClient) =>
  async ({ bot, resultsFilter }: ArchiveResultsProps) => {
    const batchSize = 100

    let currentTotalResults = 0

    const resultsCount = await prisma.botResult.count({
      where: {
        ...resultsFilter,
        OR: [{ isArchived: false }, { isArchived: null }],
      },
    })

    if (resultsCount === 0) return { success: true }

    let progress = 0

    const isDeletingAllResults = resultsFilter?.id === undefined

    do {
      progress += batchSize
      console.log(`Archiving ${progress} / ${resultsCount} results...`)
      const resultsToDelete = await prisma.botResult.findMany({
        where: {
          ...resultsFilter,
          OR: [{ isArchived: false }, { isArchived: null }],
        },
        select: {
          id: true,
          lastChatSessionId: true,
        },
        take: batchSize,
      })

      if (resultsToDelete.length === 0) break

      currentTotalResults = resultsToDelete.length

      const resultIds = resultsToDelete.map((result) => result.id)

      await prisma.$transaction([
        prisma.botLog.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.answerV2.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.botResultVisitedEdge.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.botResultVariableHistory.deleteMany({
          where: {
            resultId: { in: resultIds },
          },
        }),
        prisma.chatSession.deleteMany({
          where: {
            id: {
              in: resultsToDelete.map((r) => r.lastChatSessionId).filter(isDefined),
            },
          },
        }),
        prisma.botResult.updateMany({
          where: {
            id: { in: resultIds },
          },
          data: {
            isArchived: true,
            variables: [],
          },
        }),
      ])
      if (!isDeletingAllResults && env.S3_BUCKET) {
        await removeObjectsFromResult({
          workspaceId: bot.workspaceId,
          resultIds: resultIds,
          botId: bot.id,
        })
      }
    } while (currentTotalResults >= batchSize)

    if (isDeletingAllResults && env.S3_BUCKET) {
      await removeAllObjectsFromResult({
        workspaceId: bot.workspaceId,
        botId: bot.id,
      })
    }

    return { success: true }
  }
