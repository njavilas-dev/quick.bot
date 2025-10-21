import { TRPCError } from '@trpc/server'
import {
  ContinueChatResponse,
  SessionState,
  SetVariableHistoryItem,
  StartFrom,
} from '@quickbot.io/schemas'
import { executeGroup } from './executeGroup'
import { getNextGroup } from './getNextGroup'
import { BotResultVisitedEdge } from '@quickbot.io/prisma'
import { getFirstEdgeId } from './getFirstEdgeId'

type Props = {
  version: 1 | 2
  state: SessionState
  startFrom?: StartFrom
  startTime?: number
  textBubbleContentFormat: 'richText' | 'markdown'
}

export const startBotFlow = async ({
  version,
  state,
  startFrom,
  startTime,
  textBubbleContentFormat,
}: Props): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState
    visitedEdges: BotResultVisitedEdge[]
    setVariableHistory: SetVariableHistoryItem[]
  }
> => {
  let newSessionState = state
  const visitedEdges: BotResultVisitedEdge[] = []
  const setVariableHistory: SetVariableHistoryItem[] = []
  if (startFrom?.type === 'group') {
    const group = state.botsQueue[0].bot.groups.find((group) => group.id === startFrom.groupId)
    if (!group)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Start group doesn't exist",
      })
    return executeGroup(group, {
      version,
      state: newSessionState,
      visitedEdges,
      setVariableHistory,
      startTime,
      textBubbleContentFormat,
    })
  }
  const firstEdgeId = getFirstEdgeId({
    bot: newSessionState.botsQueue[0].bot,
    startEventId: startFrom?.type === 'event' ? startFrom.eventId : undefined,
  })
  if (!firstEdgeId)
    return {
      messages: [],
      newSessionState,
      setVariableHistory: [],
      visitedEdges: [],
    }
  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: firstEdgeId,
    isOffDefaultPath: false,
  })
  newSessionState = nextGroup.newSessionState
  if (!nextGroup.group) return { messages: [], newSessionState, visitedEdges, setVariableHistory }
  return executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    visitedEdges,
    setVariableHistory,
    startTime,
    textBubbleContentFormat,
  })
}
