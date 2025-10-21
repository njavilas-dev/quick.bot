import { useBot } from '@/features/editor/providers/BotProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ItemIndices, Item } from '@quickbot.io/schemas'
import { useIsOnlyOneItem } from './useIsOnlyOneItem'

interface ItemActionsConfig {
  isVisible: boolean
  onOpenSettings: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDeleteDisabled: boolean
}

/**
 * Custom hook that provides common ActionsBar configuration and handlers
 * This eliminates duplication between different item node components
 */
export const useItemActions = (
  item: Item,
  indices: ItemIndices,
  isMouseOver: boolean
): ItemActionsConfig => {
  const { deleteItem, duplicateItem } = useBot()
  const { setOpenedItemId } = useGraph()
  const isOnlyOneItem = useIsOnlyOneItem(indices)

  const handleDelete = () => {
    deleteItem(indices)
  }

  const handleDuplicate = () => {
    duplicateItem(indices)
  }

  const handleOpenSettings = () => {
    setOpenedItemId(item.id)
  }

  return {
    isVisible: isMouseOver,
    onOpenSettings: handleOpenSettings,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    isDeleteDisabled: isOnlyOneItem,
  }
}