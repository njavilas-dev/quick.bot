import { Block, Bot, BlockIndices, BlockV6, BotV6 } from '@quickbot.io/schemas'
import { SetBot } from '../BotProvider'
import { produce, Draft } from 'immer'
import { deleteConnectedEdgesDraft, deleteEdgeDraft } from './edges'
import { createId } from '@quickbot.io/lib/createId'
import { byId } from '@quickbot.io/lib'
import { blockHasItems } from '@quickbot.io/schemas/helpers'
import { duplicateItemDraft } from './items'
import { parseNewBlock } from '@/features/bot/helpers/parseNewBlock'
import {
  applyBlockTemplate,
  shouldShowTemplateConfirmation,
} from '@/features/bot/helpers/blockTemplates'

export type BlocksActions = {
  createBlock: (block: BlockV6 | BlockV6['type'], indices: BlockIndices) => string | undefined
  createBlockWithTemplate: (
    block: BlockV6 | BlockV6['type'],
    indices: BlockIndices,
    templateId?: string,
  ) => string | undefined
  createBlockWithoutTemplate: (
    block: BlockV6 | BlockV6['type'],
    indices: BlockIndices,
  ) => string | undefined
  shouldShowTemplateConfirmation: (blockType: BlockV6['type']) => boolean
  updateBlock: (indices: BlockIndices, updates: Partial<Omit<BlockV6, 'id' | 'type'>>) => void
  duplicateBlock: (indices: BlockIndices) => void
  detachBlockFromGroup: (indices: BlockIndices) => void
  deleteBlock: (indices: BlockIndices) => void
}

export const blocksAction = (setBot: SetBot): BlocksActions => ({
  createBlock: (block: BlockV6 | BlockV6['type'], indices: BlockIndices) => {
    let blockId
    setBot((bot) =>
      produce(bot, (bot) => {
        blockId = createBlockDraft(bot, block, indices)
      }),
    )
    return blockId
  },
  createBlockWithTemplate: (
    block: BlockV6 | BlockV6['type'],
    indices: BlockIndices,
    templateId?: string,
  ) => {
    let blockId
    setBot((bot) =>
      produce(bot, (bot) => {
        blockId = createBlockWithTemplateDraft(bot, block, indices, templateId)
      }),
    )
    return blockId
  },
  createBlockWithoutTemplate: (block: BlockV6 | BlockV6['type'], indices: BlockIndices) => {
    let blockId
    setBot((bot) =>
      produce(bot, (bot) => {
        blockId = createBlockDraft(bot, block, indices)
      }),
    )
    return blockId
  },
  shouldShowTemplateConfirmation: (blockType: BlockV6['type']) =>
    shouldShowTemplateConfirmation(blockType),
  updateBlock: (
    { groupIndex, blockIndex }: BlockIndices,
    updates: Partial<Omit<Block, 'id' | 'type'>>,
  ) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        if (!bot.groups[groupIndex]?.blocks[blockIndex]) return
        const block = bot.groups[groupIndex].blocks[blockIndex]
        bot.groups[groupIndex].blocks[blockIndex] = { ...block, ...updates }
      }),
    ),
  duplicateBlock: ({ groupIndex, blockIndex }: BlockIndices) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const block = { ...bot.groups[groupIndex].blocks[blockIndex] }
        const blocks = bot.groups[groupIndex].blocks
        if (blockIndex === blocks.length - 1 && block.outgoingEdgeId)
          deleteEdgeDraft({ bot, edgeId: block.outgoingEdgeId })
        const newBlock = duplicateBlockDraft(block)
        bot.groups[groupIndex].blocks.splice(blockIndex + 1, 0, newBlock)
      }),
    ),
  detachBlockFromGroup: (indices: BlockIndices) =>
    setBot((bot) => produce(bot, removeBlockFromGroup(indices))),
  deleteBlock: ({ groupIndex, blockIndex }: BlockIndices) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const blockId = bot.groups[groupIndex].blocks[blockIndex].id
        deleteConnectedEdgesDraft(bot, blockId)
        removeBlockFromGroup({ groupIndex, blockIndex })(bot)
        removeEmptyGroups(bot)
      }),
    ),
})

const removeBlockFromGroup =
  ({ groupIndex, blockIndex }: BlockIndices) =>
  (bot: Draft<BotV6>) => {
    bot.groups[groupIndex].blocks.splice(blockIndex, 1)
  }

export const createBlockDraft = (
  bot: Draft<BotV6>,
  block: BlockV6 | BlockV6['type'],
  { groupIndex, blockIndex }: BlockIndices,
) => {
  const blocks = bot.groups[groupIndex].blocks
  if (blockIndex === blocks.length && blockIndex > 0 && blocks[blockIndex - 1].outgoingEdgeId)
    deleteEdgeDraft({
      bot,
      edgeId: blocks[blockIndex - 1].outgoingEdgeId as string,
      groupIndex,
    })
  const blockId =
    typeof block === 'string'
      ? createNewBlock(bot, block, { groupIndex, blockIndex })
      : moveBlockToGroup(bot, block, { groupIndex, blockIndex })
  removeEmptyGroups(bot)
  return blockId
}

const createNewBlock = (
  bot: Draft<Bot>,
  type: BlockV6['type'],
  { groupIndex, blockIndex }: BlockIndices,
) => {
  // Standard block creation without template by default
  const newBlock = parseNewBlock(type)
  bot.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)
  return newBlock.id
}

const moveBlockToGroup = (
  bot: Draft<BotV6>,
  block: BlockV6,
  { groupIndex, blockIndex }: BlockIndices,
) => {
  const newBlock = { ...block }
  if (block.outgoingEdgeId) {
    if (bot.groups[groupIndex].blocks.length > blockIndex) {
      deleteEdgeDraft({ bot, edgeId: block.outgoingEdgeId, groupIndex })
      newBlock.outgoingEdgeId = undefined
    } else {
      const edgeIndex = bot.edges.findIndex(byId(block.outgoingEdgeId))
      if (edgeIndex === -1) newBlock.outgoingEdgeId = undefined
    }
  }
  const groupId = bot.groups[groupIndex].id
  bot.edges.forEach((edge) => {
    if (edge.to.blockId === block.id) {
      edge.to.groupId = groupId
    }
  })
  bot.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)
}

export const duplicateBlockDraft = (block: BlockV6): BlockV6 => {
  const blockId = createId()
  if (blockHasItems(block))
    return {
      ...block,
      id: blockId,
      items: block.items?.map(duplicateItemDraft(blockId)),
      outgoingEdgeId: undefined,
    } as BlockV6
  return {
    ...block,
    id: blockId,
    outgoingEdgeId: undefined,
  }
}

export const deleteGroupDraft = (bot: Draft<BotV6>) => (groupIndex: number) => {
  deleteConnectedEdgesDraft(bot, bot.groups[groupIndex].id)
  bot.groups.splice(groupIndex, 1)
}

const removeEmptyGroups = (bot: Draft<BotV6>) => {
  const emptyGroupsIndices = bot.groups.reduce<number[]>((arr, group, idx) => {
    if (group.blocks.length === 0) arr.push(idx)
    return arr
  }, [])
  emptyGroupsIndices.forEach(deleteGroupDraft(bot))
}

export const createBlockWithTemplateDraft = (
  bot: Draft<BotV6>,
  block: BlockV6 | BlockV6['type'],
  { groupIndex, blockIndex }: BlockIndices,
  templateId?: string,
) => {
  const blocks = bot.groups[groupIndex].blocks
  if (blockIndex === blocks.length && blockIndex > 0 && blocks[blockIndex - 1].outgoingEdgeId)
    deleteEdgeDraft({
      bot,
      edgeId: blocks[blockIndex - 1].outgoingEdgeId as string,
      groupIndex,
    })
  const blockId =
    typeof block === 'string'
      ? createNewBlockWithTemplate(bot, block, { groupIndex, blockIndex }, templateId)
      : moveBlockToGroup(bot, block, { groupIndex, blockIndex })
  removeEmptyGroups(bot)
  return blockId
}

const createNewBlockWithTemplate = (
  bot: Draft<Bot>,
  type: BlockV6['type'],
  { groupIndex, blockIndex }: BlockIndices,
  templateId?: string,
) => {
  // Apply block template - this now creates all blocks in order
  const templateResult = applyBlockTemplate(
    bot as Draft<BotV6>,
    type,
    groupIndex,
    blockIndex ?? 0,
    templateId,
  )

  // If the template includes the main block type, use that one
  if (templateResult.hasMainBlockInTemplate) {
    const mainBlock = templateResult.createdBlocks.find((block) => block.type === type)
    return mainBlock!.id
  } else {
    // If template doesn't include the main block, create it as the first block
    const newBlock = parseNewBlock(type)
    bot.groups[groupIndex].blocks.splice(blockIndex ?? 0, 0, newBlock)

    return newBlock.id
  }
}
