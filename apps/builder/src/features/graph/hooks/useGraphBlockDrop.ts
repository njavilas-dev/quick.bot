import { RefObject } from 'react'
import { useEventListener } from '@chakra-ui/react'
import { BlockV6, BotV6, PublicBotV6, BlockIndices } from '@quickbot.io/schemas'
import { createId } from '@quickbot.io/lib/createId'
import { projectMouse } from '../helpers/projectMouse'
import { Coordinates } from '../types'
import { DraggableItem } from '../providers/GraphDragAndDropProvider'

interface UseBlockDropParams {
  graphContainerRef: RefObject<HTMLDivElement>
  bot: BotV6 | PublicBotV6
  graphPosition: {
    x: number
    y: number
    scale: number
  }
  draggedBlock: (BlockV6 & { groupId: string }) | undefined
  draggedBlockType: BlockV6['type'] | undefined
  draggedItem: DraggableItem | undefined
  setDraggedBlock: React.Dispatch<React.SetStateAction<(BlockV6 & { groupId: string }) | undefined>>
  setDraggedBlockType: React.Dispatch<React.SetStateAction<BlockV6['type'] | undefined>>
  setDraggedItem: React.Dispatch<React.SetStateAction<DraggableItem | undefined>>
  setOpenedBlockId: (id: string | undefined) => void
  updateGroupCoordinates: (id: string, coordinates: { x: number; y: number }) => void
  createGroup: (props: Coordinates & {
    id: string
    block: BlockV6 | BlockV6['type']
    indices: BlockIndices
    useTemplate?: boolean
    templateId?: string
  }) => string | undefined
  checkTemplate: (blockType: BlockV6['type']) => boolean
  showTemplateConfirmation: (
    blockType: BlockV6['type'],
    groupIndex: number,
    blockIndex: number,
    onConfirm: (templateId?: string) => void,
    onCreateBasic: () => void,
    onCancel: () => void,
  ) => void
}

export const useGraphBlockDrop = ({
  graphContainerRef,
  bot,
  graphPosition,
  draggedBlock,
  draggedBlockType,
  draggedItem,
  setDraggedBlock,
  setDraggedBlockType,
  setDraggedItem,
  setOpenedBlockId,
  updateGroupCoordinates,
  createGroup,
  checkTemplate,
  showTemplateConfirmation,
}: UseBlockDropParams) => {
  const handleMouseUp = (e: MouseEvent) => {
    if (!bot) return
    if (draggedItem) setDraggedItem(undefined)
    if (!draggedBlock && !draggedBlockType) return

    const coordinates = projectMouse({ x: e.clientX, y: e.clientY }, graphPosition)
    const blockType = draggedBlock ? draggedBlock.type : (draggedBlockType as BlockV6['type'])

    // Check if this block type should show template confirmation
    // Skip template confirmation if block is being dragged from within a group
    if (!draggedBlock && checkTemplate(blockType)) {
      const id = createId()
      const indices = { groupIndex: bot.groups.length, blockIndex: 0 }

      // Show confirmation modal
      showTemplateConfirmation(
        blockType,
        0, // groupIndex (will be updated)
        0, // blockIndex (will be updated)
        // onConfirm - use template with optional templateId
        (templateId?: string) => {
          updateGroupCoordinates(id, coordinates)
          const newBlockId = createGroup({
            id,
            ...coordinates,
            block: draggedBlock ?? blockType,
            indices,
            useTemplate: true,
            templateId, // Pass templateId
          })
          setDraggedBlock(undefined)
          setDraggedBlockType(undefined)
          if (newBlockId) setOpenedBlockId(newBlockId)
        },
        // onCreateBasic - create basic block without template
        () => {
          updateGroupCoordinates(id, coordinates)
          const newBlockId = createGroup({
            id,
            ...coordinates,
            block: draggedBlock ?? blockType,
            indices,
            useTemplate: false,
          })
          setDraggedBlock(undefined)
          setDraggedBlockType(undefined)
          if (newBlockId) setOpenedBlockId(newBlockId)
        },
        // onCancel - cancel creation
        () => {
          setDraggedBlock(undefined)
          setDraggedBlockType(undefined)
        },
      )
      return
    } else {
      // Standard block creation (no template available)
      const id = createId()
      updateGroupCoordinates(id, coordinates)
      const newBlockId = createGroup({
        id,
        ...coordinates,
        block: draggedBlock ?? blockType,
        indices: { groupIndex: bot.groups.length, blockIndex: 0 },
        useTemplate: false,
      })
      setDraggedBlock(undefined)
      setDraggedBlockType(undefined)
      if (newBlockId) setOpenedBlockId(newBlockId)
    }
  }

  useEventListener(graphContainerRef.current, 'mouseup', handleMouseUp)
}
