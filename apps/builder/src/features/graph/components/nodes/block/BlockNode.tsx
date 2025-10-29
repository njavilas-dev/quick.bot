import { Flex, HStack, IconButton, Popover, PopoverTrigger, useDisclosure } from '@chakra-ui/react'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  BubbleBlock,
  BubbleBlockContent,
  Block,
  BlockWithOptions,
  TextBubbleBlock,
  BlockV6,
  Variable,
} from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'
import { Texteditor, PlateEditor, TElement, focusEditor, insertText, useToast } from '@urbiport/ui'
import { isInputBlock, isBubbleBlock, isTextBubbleBlock } from '@quickbot.io/schemas/helpers'
import { BlockNodeContent } from './BlockNodeContent'
import { BlockSettings, SettingsPopoverContent } from './SettingsPopoverContent'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { BlockSourceEndpoint } from '../../endpoints/BlockSourceEndpoint'
import { useRouter } from 'next/router'
import { MediaBubblePopoverContent } from './MediaBubblePopoverContent'
import { ContextMenu } from '@/components/ContextMenu'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { useBot } from '@/features/editor/providers/BotProvider'
import {
  NodePosition,
  useBlockDnd,
  useDragDistance,
} from '@/features/graph/providers/GraphDragAndDropProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { hasDefaultConnector } from '@/features/bot/helpers/hasDefaultConnector'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { TargetEndpoint } from '../../endpoints/TargetEndpoint'
import { SettingsModal } from './SettingsModal'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { useGraphGroups } from '@/features/graph/hooks/useGraphGroups'
import { TurnableIntoParam } from '@quickbot.io/forge'
import { ZodError, ZodObject } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { VariableIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { useIntegrationValidation } from '../../../hooks/useIntegrationValidation'
import { getNodeOutline } from '@/features/graph/helpers/nodeStates'
import { useNodeState } from '@/features/graph/hooks/useNodeState'

export const BlockNode = ({
  block,
  isConnectable,
  indices,
  onMouseDown,
}: {
  block: BlockV6
  isConnectable: boolean
  indices: { blockIndex: number; groupIndex: number }
  onMouseDown?: (blockNodePosition: NodePosition, block: BlockV6) => void
}) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const { pathname, query } = useRouter()
  const integrationValidation = useIntegrationValidation(block)

  const {
    setConnectingIds,
    connectingIds,
    openedBlockId,
    setOpenedBlockId,
    setFocusedGroupId,
    isReadOnly,
    isAnalytics,
  } = useGraph()
  const { mouseOverBlock, setMouseOverBlock } = useBlockDnd()
  const { bot, updateBlock } = useBot()
  const [isConnecting, setIsConnecting] = useState(false)
  const blockRef = useRef<HTMLDivElement | null>(null)

  const groupId = bot?.groups.at(indices.groupIndex)?.id

  const nodeState = useNodeState({
    nodeId: block.id,
    nodeType: 'block',
    groupId,
    isConnecting,
    hasError:
      integrationValidation.hasCredentialsError ||
      integrationValidation.hasRequiredFieldsError ||
      integrationValidation.hasMissingVariablesError,
  })

  const { isDraggingGraph } = useGraphGroups()

  const onDrag = (position: NodePosition) => {
    if (!onMouseDown) return
    onMouseDown(position, block)
  }

  useDragDistance({
    ref: blockRef,
    onDrag,
    isDisabled: !onMouseDown,
    deps: [openedBlockId],
  })

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()

  useEffect(() => {
    if (query.blockId?.toString() === block.id) setOpenedBlockId(block.id)
  }, [block.id, query, setOpenedBlockId])

  useEffect(() => {
    const isTarget =
      connectingIds?.target?.groupId === groupId && connectingIds?.target?.blockId === block.id
    const isSource =
      connectingIds &&
      'blockId' in connectingIds.source &&
      connectingIds.source.blockId === block.id &&
      connectingIds.source.groupId === groupId

    setIsConnecting(Boolean(isTarget || isSource))
  }, [connectingIds, block.id, groupId])

  const handleModalClose = () => {
    updateBlock(indices, { ...block })
    onModalClose()
  }

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverBlock?.id !== block.id && blockRef.current)
      setMouseOverBlock({ id: block.id, element: blockRef.current })
    if (connectingIds && groupId)
      setConnectingIds({
        ...connectingIds,
        target: { groupId, blockId: block.id },
      })
  }

  const handleMouseLeave = () => {
    if (mouseOverBlock) setMouseOverBlock(undefined)
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, blockId: undefined },
      })
  }

  const handleCloseEditor = () => {
    setOpenedBlockId(undefined)
  }

  const handleTexteditorChange = useCallback((content: TElement[]) => {
    const updatedBlock = { ...block, content: { richText: content } }
    updateBlock(indices, updatedBlock)
  }, [block, indices, updateBlock])

  const handleClick = (e: React.MouseEvent) => {
    setFocusedGroupId(groupId)
    e.stopPropagation()
    setOpenedBlockId(block.id)
  }

  const handleExpandClick = () => {
    setOpenedBlockId(undefined)
    onModalOpen()
  }

  const handleBlockUpdate = (updates: Partial<Block>) =>
    updateBlock(indices, { ...block, ...updates })

  const handleContentChange = (content: BubbleBlockContent) =>
    updateBlock(indices, { ...block, content } as Block)

  useEffect(() => {
    if (!blockRef.current) return
    const blockElement = blockRef.current
    blockElement.addEventListener('pointerdown', (e) => e.stopPropagation())

    return () => {
      blockElement.removeEventListener('pointerdown', (e) => e.stopPropagation())
    }
  }, [])

  const convertBlock = (
    turnIntoParams: TurnableIntoParam,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    targetBlockSchema: ZodObject<any>,
  ) => {
    if (!('options' in block) || !block.options) return

    const convertedBlockOptions = turnIntoParams.transform
      ? turnIntoParams.transform(block.options)
      : block.options
    try {
      updateBlock(
        indices,
        targetBlockSchema.parse({
          ...block,
          type: turnIntoParams.blockId,
          options: {
            ...convertedBlockOptions,
            credentialsId: undefined,
          },
        } as Block),
      )
      setOpenedBlockId(block.id)
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error)
        console.error(validationError)
        showToast({
          detailsTitle: 'Could not convert block',
          description: validationError.toString(),
          status: 'error',
        })
      } else {
        showToast({
          detailsTitle: 'An error occured while converting the block',
          status: 'error',
        })
      }
    }
  }

  const hasIcomingEdge = bot?.edges.some((edge) => {
    return edge.to.blockId === block.id
  })

  const handleVariableSelected = (editor: PlateEditor) => (variable?: Variable) => {
    if (!variable) return
    focusEditor(editor)
    insertText(editor, `{{${variable.name}}}`)
  }

  const toolbarItems = [
    {
      id: 'variables-button',
      render: (editor: PlateEditor) => (
        <VariablesDropdown
          placement="top-start"
          matchWidth={false}
          onSelect={handleVariableSelected(editor)}
          menuButtonProps={{
            as: IconButton,
            variant: 'outline',
            justifyContent: 'center',
            icon: <VariableIcon color="text.light" />,
            'aria-label': t('variables.button.tooltip'),
            px: 2,
            size: 'sm',
            w: '16px',
          }}
        />
      ),
    },
  ]

  const isOpen = openedBlockId === block.id

  if (isOpen && isTextBubbleBlock(block)) {
    const defaultValue = block.content?.richText ?? []
    return (
      <Texteditor
        id={block.id}
        defaultValue={defaultValue}
        toolbarItems={toolbarItems}
        onChange={handleTexteditorChange}
        onClose={handleCloseEditor}
        debounceTimeout={800}
      />
    )
  }

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={({ onClose }) => (
        <BlockNodeContextMenu
          indices={indices}
          block={block}
          onTurnIntoClick={(params, schema) => {
            convertBlock(params, schema)
            onClose()
          }}
        />
      )}
    >
      {(ref) => {
        return (
          <Popover isLazy placement="left" isOpen={isOpen} closeOnBlur={false}>
            <PopoverTrigger>
              <Flex
                pos="relative"
                ref={setMultipleRefs([ref, blockRef])}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                data-testid={`block ${block.id}`}
                w="full"
                className="prevent-group-drag"
                pointerEvents={isAnalytics || isDraggingGraph ? 'none' : 'auto'}
              >
                <HStack
                  flex="1"
                  align="flex-start"
                  alignItems="center"
                  userSelect="none"
                  cursor="pointer"
                  w="full"
                  transition="border-color 0.2s"
                  p="3"
                  bg={
                    integrationValidation.hasCredentialsError ||
                      integrationValidation.hasRequiredFieldsError ||
                      integrationValidation.hasMissingVariablesError
                      ? 'red.100'
                      : 'bg.normal'
                  }
                  borderRadius="md"
                  outline={getNodeOutline(nodeState)}
                  overflowWrap="break-word"
                  wordBreak="break-word"
                >
                  <BlockIcon type={block.type} />
                  {bot?.groups.at(indices.groupIndex)?.id && (
                    <BlockNodeContent
                      block={block}
                      indices={indices}
                      groupId={bot.groups.at(indices.groupIndex)?.id as string}
                    />
                  )}
                  {(hasIcomingEdge || isDefined(connectingIds)) && (
                    <TargetEndpoint
                      pos="absolute"
                      left="-34px"
                      top="16px"
                      blockId={block.id}
                      groupId={groupId}
                    />
                  )}
                  {(isConnectable || (pathname.endsWith('analytics') && isInputBlock(block))) &&
                    hasDefaultConnector(block) &&
                    groupId &&
                    block.type !== LogicBlockType.JUMP && (
                      <BlockSourceEndpoint
                        source={{
                          blockId: block.id,
                        }}
                        groupId={groupId}
                        bottom="10px"
                        isHidden={!isConnectable}
                      />
                    )}
                </HStack>
              </Flex>
            </PopoverTrigger>
            {hasSettingsPopover(block) && (
              <>
                <SettingsPopoverContent
                  block={block}
                  groupId={groupId}
                  onExpandClick={handleExpandClick}
                  onBlockChange={handleBlockUpdate}
                  indices={indices}
                />
                <SettingsModal isOpen={isModalOpen} onClose={handleModalClose}>
                  <BlockSettings
                    block={block}
                    groupId={groupId}
                    onBlockChange={handleBlockUpdate}
                  />
                </SettingsModal>
              </>
            )}
            {bot && isMediaBubbleBlock(block) && (
              <MediaBubblePopoverContent
                uploadFileProps={{
                  workspaceId: bot.workspaceId,
                  botId: bot.id,
                  blockId: block.id,
                }}
                block={block}
                onContentChange={handleContentChange}
              />
            )}
          </Popover>
        )
      }}
    </ContextMenu>
  )
}

const hasSettingsPopover = (block: BlockV6): block is BlockWithOptions =>
  !isBubbleBlock(block) && block.type !== LogicBlockType.CONDITION

const isMediaBubbleBlock = (block: BlockV6): block is Exclude<BubbleBlock, TextBubbleBlock> =>
  isBubbleBlock(block) && !isTextBubbleBlock(block)
