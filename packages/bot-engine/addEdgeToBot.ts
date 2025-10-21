import { createId } from '@quickbot.io/lib/createId'
import { SessionState, Edge } from '@quickbot.io/schemas'

export const addEdgeToBot = (state: SessionState, edge: Edge): SessionState => ({
  ...state,
  botsQueue: state.botsQueue.map((bot, index) =>
    index === 0
      ? {
          ...bot,
          bot: {
            ...bot.bot,
            edges: [...bot.bot.edges, edge],
          },
        }
      : bot,
  ),
})

export const createPortalEdge = ({ to }: Pick<Edge, 'to'>) => ({
  id: 'virtual-' + createId(),
  from: { blockId: '', groupId: '' },
  to,
})
