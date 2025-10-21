import { Flex, Stack } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BlockWithItems, Item, ItemIndices } from '@quickbot.io/schemas'
import React, { useRef } from 'react'
import { BlockSourceEndpoint } from '../../endpoints/BlockSourceEndpoint'
import { ItemNodeContent } from './ItemNodeContent'
import { ItemNodeContextMenu } from './ItemNodeContextMenu'
import { ContextMenu } from '@/components/ContextMenu'
import { isDefined } from '@quickbot.io/lib'
import { Coordinates } from '@/features/graph/types'
import {
  DraggableItem,
  NodePosition,
  useDragDistance,
} from '@/features/graph/providers/GraphDragAndDropProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { ConditionContent } from '@/features/blocks/logic/condition/components/ConditionContent'
import { useRouter } from 'next/router'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { getNodeOutline } from '@/features/graph/helpers/nodeStates'
import { useNodeState } from '@/features/graph/hooks/useNodeState'
import { useConditionValidation } from '@/features/blocks/logic/condition/hooks/useConditionValidation'
import { ConditionItem } from '@quickbot.io/schemas'

type Props = {
  item: Item
  block: BlockWithItems
  indices: ItemIndices
  onMouseDown?: (
    blockNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: DraggableItem,
  ) => void
  connectionDisabled?: boolean
}

export const ItemNode = ({ item, block, indices, onMouseDown, connectionDisabled }: Props) => {
  const { bot } = useBot()
  const { pathname } = useRouter()
  const itemRef = useRef<HTMLDivElement | null>(null)
  const groupId = bot?.groups.at(indices.groupIndex)?.id

  // Validate condition items
  const isConditionItem = block.type === LogicBlockType.CONDITION && 'content' in item
  const conditionValidation = useConditionValidation(
    isConditionItem ? (item as ConditionItem).content : undefined,
    bot?.variables ?? [],
  )

  const nodeState = useNodeState({
    nodeId: item.id,
    nodeType: 'item',
    groupId,
    hasError: isConditionItem ? conditionValidation.hasError : false,
  })
  const isConnectable =
    isDefined(bot) &&
    !connectionDisabled &&
    !(block.options && 'isMultipleChoice' in block.options && block.options.isMultipleChoice)
  const onDrag = (position: NodePosition) => {
    if (!onMouseDown || block.type === LogicBlockType.AB_TEST) return
    onMouseDown(position, { ...item, type: block.type, blockId: block.id })
  }
  useDragDistance({
    ref: itemRef,
    onDrag,
    isDisabled: !onMouseDown,
  })

  // const groupId = bot?.groups.at(indices.groupIndex)?.id
  const isContextMenuDisabled = block.type === InputBlockType.CHOICE

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <ItemNodeContextMenu indices={indices} />}
      isDisabled={isContextMenuDisabled}
    >
      {(ref) => {
        return (
          <Stack
            data-testid="item"
            pos="relative"
            ref={setMultipleRefs([ref, itemRef])}
            w="full"
            pr="1"
          >
            {'displayCondition' in item &&
              item.displayCondition?.isEnabled &&
              item.displayCondition.condition && (
                <ConditionContent
                  condition={item.displayCondition.condition}
                  variables={bot?.variables ?? []}
                  displaySemicolon
                />
              )}
            <Flex
              align="center"
              _hover={{ shadow: 'md' }}
              transition="box-shadow 200ms, border-color 200ms"
              w="full"
              p={block.type === InputBlockType.CHOICE ? '0' : '3'}
              shadow="sm"
              bg={isConditionItem && conditionValidation.hasError ? 'red.100' : 'bg.normal'}
              borderRadius="md"
              outline={getNodeOutline(nodeState)}
            >
              <ItemNodeContent blockType={block.type} item={item} indices={indices} />
              {bot && (isConnectable || pathname.endsWith('analytics')) && groupId && (
                <BlockSourceEndpoint
                  source={{
                    blockId: block.id,
                    itemId: item.id,
                  }}
                  groupId={groupId}
                  bottom="9px"
                  pointerEvents="all"
                  isHidden={!isConnectable}
                />
              )}
            </Flex>
          </Stack>
        )
      }}
    </ContextMenu>
  )
}
