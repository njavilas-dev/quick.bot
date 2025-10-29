import {
  EditablePreview,
  Editable,
  Fade,
  IconButton,
  Flex,
  Image,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  EditableTextarea,
} from '@chakra-ui/react'
import { ActionsBar } from '@/components/ActionsBar'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useItemActions } from '@/hooks/useItemActions'
import { ButtonItem, Item, ItemIndices } from '@quickbot.io/schemas'
import React, { useRef, useState } from 'react'
import { isEmpty } from '@quickbot.io/lib'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ButtonsBubbleItemForm } from './ButtonsBubbleItemForm'
import { useTranslate } from '@tolgee/react'
import { convertStrToList } from '@quickbot.io/lib/convertStrToList'
import { PlusIcon } from '@urbiport/icons'
import { isSvgSrc } from '@quickbot.io/lib'
import { createId } from '@quickbot.io/lib/createId'

type Props = {
  item: ButtonItem
  indices: ItemIndices
}

export const ButtonsBubbleItemNode = ({ item, indices }: Props) => {
  const { t } = useTranslate()
  const { deleteItem, updateItem, createItem, bot } = useBot()
  const { openedItemId, setOpenedItemId } = useGraph()
  const getNextItemName = React.useCallback(() => {
    const group = bot?.groups.at(indices.groupIndex)
    const block = group?.blocks.at(indices.blockIndex) as { items?: Array<{ content?: string }> } | undefined
    const base = t('blocks.inputs.button.defaultItemName.base')
    const existingNames = new Set(
      (block?.items ?? [])
        .map((i) => (i.content ?? '').trim())
        .filter((name) => name.length > 0),
    )
    let nextName = `${base} 1`
    let counter = 2
    while (existingNames.has(nextName)) {
      nextName = `${base} ${counter}`
      counter += 1
    }
    return nextName
  }, [bot, indices.groupIndex, indices.blockIndex, t])
  const defaultItemName = React.useMemo(() => {
    if (item.content && item.content.trim().length > 0) return item.content
    return getNextItemName()
  }, [item.content, getNextItemName])
  const [itemValue, setItemValue] = useState(defaultItemName)
  const editableRef = useRef<HTMLDivElement | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()
  
  const handleInputSubmit = () => {
    const nextName = getNextItemName()

    if (
      itemValue === '' ||
      itemValue === t('blocks.inputs.button.clickToEdit.label')
    ) {
      updateItem(indices, {
        content: nextName,
      } as Item)
    } else {
      updateItem(indices, {
        content: itemValue,
      } as Item)
    }
  }

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === 'Escape' &&
      (itemValue === t('blocks.inputs.button.clickToEdit.label') || itemValue === '')
    )
      deleteItem(indices)
    if (
      e.key === 'Enter' &&
      itemValue !== '' &&
      itemValue !== t('blocks.inputs.button.clickToEdit.label')
    )
      handlePlusClick()
  }

  const handleEditableChange = (val: string) => {
    if (itemValue !== '') return setItemValue(val)
    const values = convertStrToList(val)
    if (values.length === 1) {
      setItemValue(values[0])
    } else {
      values.forEach((v, i) => {
        createItem({ content: v }, { ...indices, itemIndex: indices.itemIndex + i })
      })
    }
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    const newItemId = createId()
    createItem({ id: newItemId }, { ...indices, itemIndex })
    setOpenedItemId(newItemId)
  }

  const updateItemSettings = (settings: Omit<ButtonItem, 'content'>) => {
    updateItem(indices, { ...item, ...settings })
  }

  const [isMouseOver, setIsMouseOver] = useState(false)
  const itemActions = useItemActions(item, indices, isMouseOver)

  const handleMouseEnter = () => setIsMouseOver(true)
  const handleMouseLeave = () => setIsMouseOver(false)

  const blockId = bot
    ? bot.groups.at(indices.groupIndex)?.blocks?.at(indices.blockIndex)?.id
    : undefined

  return (
    <Popover isLazy placement="right" isOpen={openedItemId === item.id} closeOnBlur={false}>
      <PopoverAnchor>
        <Flex
          justify="center"
          w="100%"
          pos="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {item.pictureSrc ? (
            <Image
              src={item.pictureSrc}
              alt="Picture choice image"
              borderRadius="md"
              maxH={isSvgSrc(item.pictureSrc) ? '64px' : '128px'}
              w="full"
              objectFit={isSvgSrc(item.pictureSrc) ? 'contain' : 'cover'}
              p={isSvgSrc(item.pictureSrc) ? '2' : undefined}
              userSelect="none"
              draggable={false}
              onClick={() => setOpenedItemId(item.id)}
            />
          ) : (
            <Editable
              onClick={handleMouseLeave}
              ref={editableRef}
              flex="1"
              startWithEditView={
                isEmpty(item.content) ||
                item.content === t('blocks.inputs.button.clickToEdit.label')
              }
              value={itemValue}
              onChange={handleEditableChange}
              onSubmit={handleInputSubmit}
              onKeyDownCapture={handleKeyPress}
              maxW="100%"
            >
              <EditablePreview
                w="full"
                color={
                  item.content !== t('blocks.inputs.button.clickToEdit.label')
                    ? 'text.normal'
                    : 'text.light'
                }
                p={0}
                cursor="pointer"
              />
              <EditableTextarea
                onMouseDownCapture={(e) => e.stopPropagation()}
                resize="none"
                onWheelCapture={(e) => e.stopPropagation()}
              />
            </Editable>
          )}
          <HitboxExtension />
          <ActionsBar {...itemActions} position={{ left: '130px', top: '-38px' }} />
          <Fade
            in={isMouseOver}
            style={{
              position: 'absolute',
              bottom: '-15px',
              zIndex: 3,
              left: '103px',
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
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody py={5} overflowY="auto" maxH="35vh" ref={ref}>
            {bot && blockId && (
              <ButtonsBubbleItemForm
                workspaceId={bot.workspaceId}
                botId={bot.id}
                item={item}
                blockId={blockId}
                onSettingsChange={updateItemSettings}
              />
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

const HitboxExtension = () => <Flex h="full" w="10px" pos="absolute" top="0" left="-10px" />
