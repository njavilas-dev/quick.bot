import {
  Bot,
  Edge,
  BlockWithItems,
  BlockIndices,
  ItemIndices,
  Block,
  BotV6,
} from '@quickbot.io/schemas'
import { SetBot } from '../BotProvider'
import { Draft, produce } from 'immer'
import { byId, isDefined } from '@quickbot.io/lib'
import { blockHasItems } from '@quickbot.io/schemas/helpers'
import { createId } from '@quickbot.io/lib/createId'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, 'id'>) => void
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) => void
  deleteEdge: (edgeId: string) => void
}

export const edgesAction = (setBot: SetBot): EdgesActions => ({
  createEdge: (edge: Omit<Edge, 'id'>) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const newEdge = {
          ...edge,
          id: createId(),
        }
        removeExistingEdge(bot, edge)
        bot.edges.push(newEdge)
        if ('eventId' in edge.from) {
          const eventIndex = bot.events.findIndex(byId(edge.from.eventId))
          addEdgeIdToEvent(bot, newEdge.id, {
            eventIndex,
          })
        } else {
          const groupIndex = bot.groups.findIndex((g) =>
            g.blocks.some((b) => 'blockId' in edge.from && b.id === edge.from.blockId),
          )
          const blockIndex = bot.groups[groupIndex].blocks.findIndex(byId(edge.from.blockId))
          const itemIndex = edge.from.itemId
            ? (
                bot.groups[groupIndex].blocks[blockIndex] as BlockWithItems | undefined
              )?.items.findIndex(byId(edge.from.itemId))
            : null

          if (isDefined(itemIndex) && itemIndex !== -1) {
            addEdgeIdToItem(bot, newEdge.id, {
              groupIndex,
              blockIndex,
              itemIndex,
            })
          } else {
            addEdgeIdToBlock(bot, newEdge.id, {
              groupIndex,
              blockIndex,
            })
          }

          const block = bot.groups[groupIndex].blocks[blockIndex]
          if (isDefined(itemIndex) && isDefined(block.outgoingEdgeId)) {
            const areAllItemsConnected = (block as BlockWithItems).items.every((item) =>
              isDefined(item.outgoingEdgeId),
            )
            if (
              areAllItemsConnected &&
              block.type === InputBlockType.CHOICE
            ) {
              deleteEdgeDraft({
                bot,
                edgeId: block.outgoingEdgeId,
                groupIndex,
              })
            }
          }
        }
      }),
    ),
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, 'id'>>) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const currentEdge = bot.edges[edgeIndex]
        bot.edges[edgeIndex] = {
          ...currentEdge,
          ...updates,
        }
      }),
    ),
  deleteEdge: (edgeId: string) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        deleteEdgeDraft({ bot: bot, edgeId })
      }),
    ),
})

const addEdgeIdToEvent = (
  bot: Draft<BotV6>,
  edgeId: string,
  { eventIndex }: { eventIndex: number },
) => (bot.events[eventIndex].outgoingEdgeId = edgeId)

const addEdgeIdToBlock = (
  bot: Draft<Bot>,
  edgeId: string,
  { groupIndex, blockIndex }: BlockIndices,
) => {
  bot.groups[groupIndex].blocks[blockIndex].outgoingEdgeId = edgeId
}

const addEdgeIdToItem = (
  bot: Draft<Bot>,
  edgeId: string,
  { groupIndex, blockIndex, itemIndex }: ItemIndices,
) =>
  ((bot.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[itemIndex].outgoingEdgeId =
    edgeId)

export const deleteEdgeDraft = ({
  bot,
  edgeId,
  groupIndex,
}: {
  bot: Draft<BotV6>
  edgeId: string
  groupIndex?: number
}) => {
  const edgeIndex = bot.edges.findIndex(byId(edgeId))
  if (edgeIndex === -1) return
  deleteOutgoingEdgeIdProps({ bot: bot, edgeId, groupIndex })
  bot.edges.splice(edgeIndex, 1)
}

const deleteOutgoingEdgeIdProps = ({
  bot,
  edgeId,
  groupIndex,
}: {
  bot: Draft<BotV6>
  edgeId: string
  groupIndex?: number
}) => {
  const edge = bot.edges.find(byId(edgeId))
  if (!edge) return
  if ('eventId' in edge.from) {
    const eventIndex = bot.events.findIndex(byId(edge.from.eventId))
    if (eventIndex === -1) return
    bot.events[eventIndex].outgoingEdgeId = undefined
    return
  }
  const fromGroupIndex =
    groupIndex ??
    bot.groups.findIndex(
      (g) =>
        edge.to.groupId === g.id ||
        g.blocks.some(
          (b) => 'blockId' in edge.from && (b.id === edge.from.blockId || b.id === edge.to.blockId),
        ),
    )
  const fromBlockIndex = bot.groups[fromGroupIndex].blocks.findIndex(byId(edge.from.blockId))
  const block = bot.groups[fromGroupIndex].blocks[fromBlockIndex] as Block | undefined
  if (!block) return
  const fromItemIndex =
    edge.from.itemId && blockHasItems(block) ? block.items?.findIndex(byId(edge.from.itemId)) : -1
  if (fromItemIndex !== -1) {
    ;(bot.groups[fromGroupIndex].blocks[fromBlockIndex] as BlockWithItems).items[
      fromItemIndex ?? 0
    ].outgoingEdgeId = undefined
  } else if (fromBlockIndex !== -1)
    bot.groups[fromGroupIndex].blocks[fromBlockIndex].outgoingEdgeId = undefined
}

export const deleteConnectedEdgesDraft = (bot: Draft<BotV6>, deletedNodeId: string) => {
  const edgesToDelete = bot.edges.filter((edge) => {
    if ('eventId' in edge.from)
      return [edge.from.eventId, edge.to.groupId, edge.to.blockId].includes(deletedNodeId)

    return [edge.from.blockId, edge.from.itemId, edge.to.groupId, edge.to.blockId].includes(
      deletedNodeId,
    )
  })

  edgesToDelete.forEach((edge) => deleteEdgeDraft({ bot: bot, edgeId: edge.id }))
}

const removeExistingEdge = (bot: Draft<Bot>, edge: Omit<Edge, 'id'>) => {
  bot.edges = bot.edges.filter((e) => {
    if ('eventId' in edge.from) {
      if ('eventId' in e.from) return e.from.eventId !== edge.from.eventId
      return true
    }

    if ('eventId' in e.from) return true

    return edge.from.itemId
      ? e.from && e.from.itemId !== edge.from.itemId
      : isDefined(e.from.itemId) || e.from.blockId !== edge.from.blockId
  })
}
