import { useBot } from '@/features/editor/providers/BotProvider'
import { ItemIndices } from '@quickbot.io/schemas'

/**
 * Custom hook to check if the current block has only one item
 * This prevents deletion of the last item in a block
 */
export const useIsOnlyOneItem = (indices: ItemIndices): boolean => {
  const { bot } = useBot()
  
  // Get the current block to check the number of items
  const currentBlock = bot?.groups.at(indices.groupIndex)?.blocks?.at(indices.blockIndex)
  const isOnlyOneItem = currentBlock && 'items' in currentBlock ? currentBlock.items.length === 1 : false
  
  return isOnlyOneItem
}