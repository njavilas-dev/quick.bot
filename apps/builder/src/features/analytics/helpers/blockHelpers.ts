import { byId } from '@quickbot.io/lib'
import type { PublicBotV6, Group, Block } from '@quickbot.io/schemas'

/**
 * Shared utilities for block operations
 * Consolidates duplicate functions between different components
 */

/**
 * Finds a block by its ID in all bot groups
 */
export function findBlockById(publishedBot: PublicBotV6 | undefined, blockId: string): Block | undefined {
  if (!publishedBot) return undefined
  return publishedBot.groups.flatMap((group) => group.blocks).find(byId(blockId))
}

/**
 * Finds the group that contains a specific block
 */
export function findGroupContainingBlock(publishedBot: PublicBotV6 | undefined, blockId: string | undefined): Group | undefined {
  if (!publishedBot || !blockId) return undefined
  return publishedBot.groups.find((group) =>
    group.blocks.some((block) => block.id === blockId)
  )
}

/**
 * Verifies if a block is the last one in its group
 */
export function isLastBlockInGroup(blockGroup: Group | undefined, blockId: string | undefined): boolean {
  if (!blockGroup || !blockId) return false
  const lastBlock = blockGroup.blocks.at(-1)
  return lastBlock?.id === blockId
}

/**
 * Gets the ID of a block (compatibility function)
 */
export function getBlockId(publishedBot: PublicBotV6 | undefined, blockId: string): string | undefined {
  const block = findBlockById(publishedBot, blockId)
  return block?.id
}