import React, { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { SimpleGrid, Stack, Text, useEventListener, Portal, Menu, IconButton } from '@chakra-ui/react'
import { BlockCard } from './BlockCard'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { InputText, SidebarSlide, SidebarSlideTab } from '@urbiport/ui'
import { CloseIcon, SearchIcon } from '@urbiport/icons'
import { useBlockDnd } from '@/features/graph/providers/GraphDragAndDropProvider'
import { BlockV6 } from '@quickbot.io/schemas'
import { BlockCardOverlay } from './BlockCardOverlay'
import { VariablesList } from '@/features/variables/components/VariablesList'

import { useWorkspace } from '@/hooks/useWorkspace'

const blocksToMoveToIntegrations = [InputBlockType.PAYMENT]

export const FlowSideMenu: React.FC = () => {
  const { t } = useTranslate()

  const { setDraggedBlockType, draggedBlockType } = useBlockDnd()
  const { workspace } = useWorkspace()
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [searchValue, setSearchValue] = useState('')

  const handleMouseMove = (event: MouseEvent) => {
    if (!draggedBlockType) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }

  useEventListener(document, 'mousemove', handleMouseMove)

  const handleMouseDown = (e: React.MouseEvent, type: BlockV6['type']) => {
    const element = e.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.top })
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRelativeCoordinates({ x, y })
    setDraggedBlockType(type)
  }

  const handleMouseUp = () => {
    if (!draggedBlockType) return
    setDraggedBlockType(undefined)
    setPosition({
      x: 0,
      y: 0,
    })
  }

  useEventListener(document, 'mouseup', handleMouseUp)

  const handleSearchInputChange = (value: string) => {
    const trimmedValue = value.trim()
    setSearchValue(trimmedValue)
  }

  const handleOnClearSearch = () => {
    setSearchValue('')
  }
  const blocksArray = Object.values(forgedBlocks)

  const filteredForgedBlockIds = blocksArray
    .filter((block) => {
      return (
        block.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        (block.tags &&
          block.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchValue.toLowerCase()),
          )) ||
        block.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    })
    .map((block) => block.id)

  const allowedBlocks = workspace?.billingPlan?.allowedBotBlocks || []

  const shouldShowBlock = (type: string) => {
    if (allowedBlocks.length === 0) return true

    return allowedBlocks.includes(type)
  }

  return (
    <SidebarSlide
      isFitted
      title={t('editor.header.flowButton.label')}
      labels={{
        unlockTooltip: t('editor.sidebarBlocks.sidebar.unlock.label'),
        lockTooltip: t('editor.sidebarBlocks.sidebar.lock.label'),
        unlockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.unlock.label'),
        lockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.lock.label'),
      }}
    >
      <SidebarSlideTab label="Components">
        <Stack w="full" spacing={6} userSelect="none">
          <InputText
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchInputChange}
            leftIcon={<SearchIcon color="text.light" />}
            rightIcon={
              <>
                {searchValue && <IconButton
                  aria-label="Clear search"
                  icon={<CloseIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={handleOnClearSearch}
                />}
              </>
            }
          />

          <Stack>
            <Text fontSize="sm" fontWeight="semibold">
              {t('editor.sidebarBlocks.blockType.bubbles.heading')}
            </Text>
            <SimpleGrid columns={2} spacing="3">
              {Object.values(BubbleBlockType)
                .filter((type) => type.toLowerCase().includes(searchValue.toLowerCase()))
                .filter((type) => shouldShowBlock(type))
                .map((type) => (
                  <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
                ))}
            </SimpleGrid>
          </Stack>

          <Stack>
            <Text fontSize="sm" fontWeight="semibold">
              {t('editor.sidebarBlocks.blockType.inputs.heading')}
            </Text>
            <SimpleGrid columns={2} spacing="3">
              {Object.values(InputBlockType)
                .filter((type) => !blocksToMoveToIntegrations.includes(type))
                .filter((type) => type.toLowerCase().includes(searchValue.toLowerCase()))
                .filter((type) => shouldShowBlock(type))
                .map((type) => (
                  <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
                ))}
            </SimpleGrid>
          </Stack>

          <Stack>
            <Text fontSize="sm" fontWeight="semibold">
              {t('editor.sidebarBlocks.blockType.logic.heading')}
            </Text>
            <SimpleGrid columns={2} spacing="3">
              {Object.values(LogicBlockType)
                .filter((type) => type.toLowerCase().includes(searchValue.toLowerCase()))
                .filter((type) => shouldShowBlock(type))
                .map((type) => (
                  <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
                ))}
            </SimpleGrid>
          </Stack>

          <Stack>
            <Text fontSize="sm" fontWeight="semibold">
              {t('editor.sidebarBlocks.blockType.integrations.heading')}
            </Text>
            <SimpleGrid columns={2} spacing="3">
              {Object.values(IntegrationBlockType)
                .concat(filteredForgedBlockIds as unknown as IntegrationBlockType[])
                .concat(blocksToMoveToIntegrations as unknown as IntegrationBlockType[])
                .filter((type) => type.toLowerCase().includes(searchValue.toLowerCase()))
                .filter((type) => shouldShowBlock(type))
                .map((type) => (
                  <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
                ))}
            </SimpleGrid>
          </Stack>

          {draggedBlockType && (
            <Portal>
              <BlockCardOverlay
                type={draggedBlockType}
                onMouseUp={handleMouseUp}
                pos="fixed"
                top="0"
                left="0"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
                }}
              />
            </Portal>
          )}
        </Stack>
      </SidebarSlideTab>
      <SidebarSlideTab label="Variables">
        <Menu isOpen>
          <VariablesList />
        </Menu>
      </SidebarSlideTab>
    </SidebarSlide>
  )
}
