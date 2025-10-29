import { Flex, Portal, Stack, useEventListener } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BlockIndices, BlockWithItems } from '@quickbot.io/schemas'
import React, { useEffect, useRef, useState } from 'react'
import { ItemNode } from './ItemNode'
import { PlaceholderNode } from '../PlaceholderNode'
import { isDefined } from '@quickbot.io/lib'
import {
  useBlockDnd,
  computeNearestPlaceholderIndex,
  DraggableItem,
} from '@/features/graph/providers/GraphDragAndDropProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { Coordinates } from '@dnd-kit/utilities'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { ItemNodeOtherwise } from './ItemNodeOtherwise'
import { useTranslate } from '@tolgee/react'

type Props = {
  block: BlockWithItems
  indices: BlockIndices
}

export const ItemNodesList = ({ block, indices: { groupIndex, blockIndex } }: Props) => {
  const { t } = useTranslate()
  const { bot, createItem, detachItemFromBlock } = useBot()
  const { draggedItem, setDraggedItem, mouseOverBlock } = useBlockDnd()
  const placeholderRefs = useRef<HTMLDivElement[]>([])
  const { graphPosition } = useGraph()
  const isDraggingOnCurrentBlock = (draggedItem && mouseOverBlock?.id === block.id) ?? false
  const showPlaceholders = draggedItem !== undefined && block.type === draggedItem.type

  const isLastBlock =
    isDefined(bot) && bot.groups.at(groupIndex)?.blocks?.at(blockIndex + 1) === undefined

  const useOtherOption =
    block.type === InputBlockType.CHOICE
      ? block.options?.otherOption
      : block.type === LogicBlockType.CONDITION
        ? true
        : false

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<number | undefined>()

  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (!draggedItem) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener(document, 'mousemove', handleGlobalMouseMove)

  useEffect(() => {
    if (!showPlaceholders) return
    if (mouseOverBlock?.id !== block.id) {
      setExpandedPlaceholderIndex(undefined)
    }
  }, [block.id, mouseOverBlock?.id, showPlaceholders])

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock || !showPlaceholders) return
    const index = computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    setExpandedPlaceholderIndex(index)
  }

  useEventListener(
    mouseOverBlock ? mouseOverBlock.element : null,
    'mousemove',
    mouseOverBlock ? handleMouseMoveOnBlock : () => { },
  )

  const handleMouseUpOnGroup = (e: MouseEvent) => {
    if (
      !showPlaceholders ||
      !isDraggingOnCurrentBlock ||
      !draggedItem ||
      mouseOverBlock?.id !== block.id
    )
      return
    setExpandedPlaceholderIndex(undefined)
    const itemIndex = computeNearestPlaceholderIndex(e.pageY, placeholderRefs)
    e.stopPropagation()
    setDraggedItem(undefined)
    createItem(draggedItem, {
      groupIndex,
      blockIndex,
      itemIndex,
    })
  }

  useEventListener(
    mouseOverBlock ? mouseOverBlock.element : null,
    'mouseup',
    mouseOverBlock ? handleMouseUpOnGroup : () => { },
    {
      capture: true,
    },
  )

  const handleBlockMouseDown =
    (itemIndex: number) =>
      (
        { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
        item: DraggableItem,
      ) => {
        if (!bot || block.items.length <= 1) return
        placeholderRefs.current.splice(itemIndex + 1, 1)
        detachItemFromBlock({ groupIndex, blockIndex, itemIndex })
        setPosition(absolute)
        setRelativeCoordinates(relative)
        setDraggedItem({
          ...item,
        })
      }

  const stopPropagating = (e: React.MouseEvent) => e.stopPropagation()

  const handlePushElementRef = (idx: number) => (elem: HTMLDivElement | null) => {
    if (elem) {
      placeholderRefs.current[idx] = elem
    }
  }

  const groupId = bot?.groups.at(groupIndex)?.id

  const defaultLabel = block.type === InputBlockType.CHOICE
    ? t('blocks.inputs.button.else.label')
    : t('blocks.logic.condition.otherwise.label')

  return (
    <Stack flex={1} spacing={1} maxW="full" onClick={stopPropagating}>
      <PlaceholderNode
        isVisible={showPlaceholders}
        isExpanded={expandedPlaceholderIndex === 0}
        onRef={handlePushElementRef(0)}
      />
      {block.items.map((item, idx) => (
        <Stack key={item.id} spacing={1}>
          <ItemNode
            item={item}
            block={block}
            indices={{ groupIndex, blockIndex, itemIndex: idx }}
            onMouseDown={handleBlockMouseDown(idx)}
          />
          <PlaceholderNode
            isVisible={showPlaceholders}
            isExpanded={expandedPlaceholderIndex === idx + 1}
            onRef={handlePushElementRef(idx + 1)}
          />
        </Stack>
      ))}
      {isLastBlock && useOtherOption && groupId && (
        <ItemNodeOtherwise
          block={block}
          groupId={groupId}
          label={defaultLabel}
        />
      )}
      {draggedItem && draggedItem.blockId === block.id && (
        <Portal>
          <Flex
            pointerEvents="none"
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg) scale(${graphPosition.scale})`,
            }}
            w="220px"
            transformOrigin="0 0 0"
          >
            <ItemNode
              item={draggedItem}
              block={block}
              indices={{ groupIndex, blockIndex, itemIndex: 0 }}
              connectionDisabled
            />
          </Flex>
        </Portal>
      )}
    </Stack>
  )
}