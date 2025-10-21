import { byId, isDefined, isNotDefined } from '@quickbot.io/lib'
import { Group, SessionState, VariableWithValue } from '@quickbot.io/schemas'
import { upsertResult } from './queries/upsertResult'
import { BotResultVisitedEdge } from '@quickbot.io/prisma'

type NextGroup = {
  group?: Group
  newSessionState: SessionState
  visitedEdge?: BotResultVisitedEdge
}

export const getNextGroup = async ({
  state,
  edgeId,
  isOffDefaultPath,
}: {
  state: SessionState
  edgeId?: string
  isOffDefaultPath: boolean
}): Promise<NextGroup> => {
  const nextEdge = state.botsQueue[0].bot.edges.find(byId(edgeId))
  if (!nextEdge) {
    if (state.botsQueue.length > 1) {
      const nextEdgeId = state.botsQueue[0].edgeIdToTriggerWhenDone
      const isMergingWithParent = state.botsQueue[0].isMergingWithParent
      const currentResultId = state.botsQueue[0].resultId
      if (!isMergingWithParent && currentResultId)
        await upsertResult({
          resultId: currentResultId,
          bot: state.botsQueue[0].bot,
          isCompleted: true,
          hasStarted: state.botsQueue[0].answers.length > 0,
        })
      let newSessionState = {
        ...state,
        botsQueue: [
          {
            ...state.botsQueue[1],
            bot: isMergingWithParent
              ? {
                  ...state.botsQueue[1].bot,
                  variables: state.botsQueue[1].bot.variables
                    .map((variable) => ({
                      ...variable,
                      value:
                        state.botsQueue[0].bot.variables.find((v) => v.name === variable.name)
                          ?.value ?? variable.value,
                    }))
                    .concat(
                      state.botsQueue[0].bot.variables.filter(
                        (variable) =>
                          isDefined(variable.value) &&
                          isNotDefined(
                            state.botsQueue[1].bot.variables.find((v) => v.name === variable.name),
                          ),
                      ) as VariableWithValue[],
                    ),
                }
              : state.botsQueue[1].bot,
            answers: isMergingWithParent
              ? [
                  ...state.botsQueue[1].answers.filter(
                    (incomingAnswer) =>
                      !state.botsQueue[0].answers.find(
                        (currentAnswer) => currentAnswer.key === incomingAnswer.key,
                      ),
                  ),
                  ...state.botsQueue[0].answers,
                ]
              : state.botsQueue[1].answers,
          },
          ...state.botsQueue.slice(2),
        ],
      } satisfies SessionState
      if (state.progressMetadata)
        newSessionState.progressMetadata = {
          ...state.progressMetadata,
          totalAnswers: state.progressMetadata.totalAnswers + state.botsQueue[0].answers.length,
        }
      const nextGroup = await getNextGroup({
        state: newSessionState,
        edgeId: nextEdgeId,
        isOffDefaultPath,
      })
      newSessionState = nextGroup.newSessionState
      if (!nextGroup)
        return {
          newSessionState,
        }
      return {
        ...nextGroup,
        newSessionState,
      }
    }
    return {
      newSessionState: state,
    }
  }
  const nextGroup = state.botsQueue[0].bot.groups.find(byId(nextEdge.to.groupId))
  if (!nextGroup)
    return {
      newSessionState: state,
    }
  const startBlockIndex = nextEdge.to.blockId
    ? nextGroup.blocks.findIndex(byId(nextEdge.to.blockId))
    : 0
  const currentVisitedEdgeIndex = isOffDefaultPath
    ? (state.currentVisitedEdgeIndex ?? -1) + 1
    : state.currentVisitedEdgeIndex
  const resultId = state.botsQueue[0].resultId
  return {
    group: {
      ...nextGroup,
      blocks: nextGroup.blocks.slice(startBlockIndex),
    } as Group,
    newSessionState: {
      ...state,
      currentVisitedEdgeIndex,
      previewMetadata:
        resultId || !isOffDefaultPath
          ? state.previewMetadata
          : {
              ...state.previewMetadata,
              visitedEdges: (state.previewMetadata?.visitedEdges ?? []).concat(nextEdge.id),
            },
    },
    visitedEdge:
      resultId && isOffDefaultPath && !nextEdge.id.startsWith('virtual-')
        ? {
            index: currentVisitedEdgeIndex as number,
            edgeId: nextEdge.id,
            resultId,
          }
        : undefined,
  }
}
