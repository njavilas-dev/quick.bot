import { SessionState } from '@quickbot.io/schemas/features/chat/sessionState'

export const resetSessionState = (state: SessionState): SessionState => ({
  ...state,
  currentSetVariableHistoryIndex: undefined,
  currentVisitedEdgeIndex: undefined,
  previewMetadata: undefined,
  progressMetadata: undefined,
  botsQueue: state.botsQueue.map((queueItem) => ({
    ...queueItem,
    answers: [],
    bot: {
      ...queueItem.bot,
      variables: queueItem.bot.variables.map((variable) => ({
        ...variable,
        value: undefined,
      })),
    },
  })),
})
