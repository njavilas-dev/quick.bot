import { PixelBlock, SessionState } from '@quickbot.io/schemas'
import { ExecuteIntegrationResponse } from '../../../types'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'

export const executePixelBlock = (
  state: SessionState,
  block: PixelBlock,
): ExecuteIntegrationResponse => {
  const { bot, resultId } = state.botsQueue[0]
  if (!resultId || !block.options?.pixelId || !block.options.eventType || state.whatsApp)
    return { outgoingEdgeId: block.outgoingEdgeId }
  const pixel = deepParseVariables(bot.variables, {
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  })(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'pixel',
        pixel: {
          ...pixel,
          pixelId: block.options.pixelId,
        },
      },
    ],
  }
}
