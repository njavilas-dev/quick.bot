import prisma from '@quickbot.io/lib/prisma'
import { Prisma, BotResultVariableHistory, BotResultVisitedEdge } from '@quickbot.io/prisma'
import { ContinueChatResponse, BotInSession } from '@quickbot.io/schemas'
import { filterSavedVariablesWithValues } from '@quickbot.io/variables/filterVariablesWithValues'
import { formatLogDetails } from '../logs/helpers/formatLogDetails'

type Props = {
  resultId: string
  bot: BotInSession
  hasStarted: boolean
  isCompleted: boolean
  lastChatSessionId?: string
  logs?: ContinueChatResponse['logs']
  visitedEdges?: BotResultVisitedEdge[]
  setVariableHistory?: BotResultVariableHistory[]
}
export const upsertResult = ({
  resultId,
  bot,
  hasStarted,
  isCompleted,
  lastChatSessionId,
  logs,
  visitedEdges,
  setVariableHistory,
}: Props): Prisma.PrismaPromise<any> => {
  const variablesWithValue = filterSavedVariablesWithValues(bot.variables)
  const logsToCreate =
    logs && logs.length > 0
      ? {
          createMany: {
            data: logs.map((log) => ({
              ...log,
              details: formatLogDetails(log.details),
            })),
            skipDuplicates: true,
          },
        }
      : undefined

  const setVariableHistoryToCreate =
    setVariableHistory && setVariableHistory.length > 0
      ? ({
          createMany: {
            data: setVariableHistory.map((item) => ({
              ...item,
              value: item.value === null ? Prisma.JsonNull : item.value,
              resultId: undefined,
            })),
            skipDuplicates: true,
          },
        } as Prisma.BotResultVariableHistoryUpdateManyWithoutResultNestedInput)
      : undefined

  const visitedEdgesToCreate =
    visitedEdges && visitedEdges.length > 0
      ? {
          createMany: {
            data: visitedEdges.map((edge) => ({
              ...edge,
              resultId: undefined,
            })),
            skipDuplicates: true,
          },
        }
      : undefined

  return prisma.botResult.upsert({
    where: { id: resultId },
    update: {
      isCompleted: isCompleted ? true : undefined,
      hasStarted,
      variables: variablesWithValue,
      lastChatSessionId,
      logs: logsToCreate,
      setVariableHistory: setVariableHistoryToCreate,
      edges: visitedEdgesToCreate,
    },
    create: {
      id: resultId,
      botId: bot.id,
      isCompleted: isCompleted ? true : false,
      hasStarted,
      variables: variablesWithValue,
      lastChatSessionId,
      logs: logsToCreate,
      setVariableHistory: setVariableHistoryToCreate,
      edges: visitedEdgesToCreate,
    },
    select: { id: true },
  })
}
