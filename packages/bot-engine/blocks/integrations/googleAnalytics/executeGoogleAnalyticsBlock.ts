import { ExecuteIntegrationResponse } from '../../../types'
import { GoogleAnalyticsBlock, SessionState } from '@quickbot.io/schemas'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'

export const executeGoogleAnalyticsBlock = (
  state: SessionState,
  block: GoogleAnalyticsBlock,
): ExecuteIntegrationResponse => {
  const { bot, resultId } = state.botsQueue[0]
  if (!resultId || state.whatsApp || !block.options) return { outgoingEdgeId: block.outgoingEdgeId }
  const googleAnalytics = deepParseVariables(bot.variables, {
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  })(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'googleAnalytics',
        googleAnalytics,
      },
    ],
  }
}
