import { RedirectBlock, SessionState } from '@quickbot.io/schemas'
import { sanitizeUrl } from '@quickbot.io/lib'
import { ExecuteLogicResponse } from '../../../types'
import { parseVariables } from '@quickbot.io/variables/parseVariables'

export const executeRedirect = (
  state: SessionState,
  block: RedirectBlock,
): ExecuteLogicResponse => {
  const { variables } = state.botsQueue[0].bot
  if (!block.options?.url) return { outgoingEdgeId: block.outgoingEdgeId }
  const formattedUrl = sanitizeUrl(parseVariables(variables)(block.options.url))
  return {
    clientSideActions: [
      {
        type: 'redirect',
        redirect: { url: formattedUrl, isNewTab: block.options.isNewTab },
      },
    ],
    outgoingEdgeId: block.outgoingEdgeId,
  }
}
