import {
  Text,
  Flex,
  Fade,
  IconButton,
  Popover,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  PopoverAnchor,
  VStack,
} from '@chakra-ui/react'
import { ActionsBar } from '@/components/ActionsBar'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useItemActions } from '@/hooks/useItemActions'
import { Comparison, ConditionItem, ItemIndices, Condition, BlockV6 } from '@quickbot.io/schemas'
import React, { useRef, useState } from 'react'
import { isNotDefined } from '@quickbot.io/lib'
import { PlusIcon } from '@urbiport/icons'
import { ConditionForm } from './ConditionForm'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { createId } from '@quickbot.io/lib/createId'
import { ConditionContent } from './ConditionContent'
import { useTranslate } from '@tolgee/react'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = {
  item: ConditionItem
  indices: ItemIndices
}

export const ConditionItemNode = ({ item, indices }: Props) => {
  const { t } = useTranslate()
  const { bot, createItem, updateItem } = useBot()
  const { openedItemId, setOpenedItemId } = useGraph()
  const ref = useRef<HTMLDivElement | null>(null)
  const [isMouseOver, setIsMouseOver] = useState(false)
  const itemActions = useItemActions(item, indices, isMouseOver)

  // Create a block-like object to validate variables
  const blockForValidation = {
    type: LogicBlockType.CONDITION,
    options: item.content,
  } as unknown as BlockV6
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const openPopover = () => {
    setOpenedItemId(item.id)
  }

  const updateCondition = (condition: Condition) => {
    updateItem(indices, { ...item, content: condition } as ConditionItem)
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    const newItemId = createId()
    createItem(
      {
        id: newItemId,
      },
      { ...indices, itemIndex },
    )
    setOpenedItemId(newItemId)
  }

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener(ref.current, 'wheel', handleMouseWheel)

  return (
    <Popover isLazy placement="left" isOpen={openedItemId === item.id} closeOnBlur={false}>
      <PopoverAnchor>
        <VStack w="100%" align="start" spacing={1}>
          <Flex
            justify="start"
            w="100%"
            pos="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={openPopover}
          >
            {item.content?.comparisons?.length === 0 ||
              comparisonIsEmpty(item.content?.comparisons?.at(0)) ? (
              <Text color="text.light" cursor="pointer">
                Configure...
              </Text>
            ) : (
              <ConditionContent condition={item.content} variables={bot?.variables ?? []} />
            )}
            <HitboxExtension />
            <ActionsBar {...itemActions} position={{ left: '118px', top: '-50px' }} />
            <Fade
              in={isMouseOver}
              style={{
                position: 'absolute',
                bottom: '-25px',
                zIndex: 3,
                left: '90px',
              }}
              unmountOnExit
            >
              <IconButton
                aria-label={t('blocks.inputs.button.addItem.ariaLabel')}
                icon={<PlusIcon />}
                size="xs"
                shadow="md"
                colorScheme="gray"
                onClick={handlePlusClick}
              />
            </Fade>
          </Flex>
          {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
        </VStack>
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody py={5} overflowY="auto" maxH="35vh" ref={ref}>
            <ConditionForm condition={item.content} onConditionChange={updateCondition} />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

const HitboxExtension = () => <Flex h="full" w="10px" pos="absolute" top="0" left="-10px" />

const comparisonIsEmpty = (comparison?: Comparison) =>
  isNotDefined(comparison?.comparisonOperator) &&
  isNotDefined(comparison?.value) &&
  isNotDefined(comparison?.variableId)
