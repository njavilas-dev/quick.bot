import React, { useRef, useEffect, useState } from 'react'
import { Fade, Flex, FlexProps } from '@chakra-ui/react'
import { PublicBotV6, BotV6 } from '@quickbot.io/schemas'
import { TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas/features/analytics'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BlockTemplateConfirmationModal } from '@/features/editor/components/BlockTemplateConfirmationModal'
import { useBlockTemplateConfirmation } from '@/hooks/useBlockTemplateConfirmation'
import GraphElements from './GraphElements'
import { graphPositionDefaultValue } from '../constants'
import { useBlockDnd } from '../providers/GraphDragAndDropProvider'
import { useGraph } from '../providers/GraphProvider'
import { GroupSelectionMenu } from './GroupSelectionMenu'
import { useGraphGroups } from '../hooks/useGraphGroups'
import { useGraphEdgeAutoPan } from '../hooks/useGraphEdgeAutoPan'
import { useGraphCenterOnPreview } from '../hooks/useGraphCenterOnPreview'
import { useGraphBackgroundGrid } from '../hooks/useGraphBackgroundGrid'
import { useGraphZoom } from '../providers/GraphZoomProvider'
import { useGraphGestures } from '../hooks/useGraphGestures'
import { useGraphSelection } from '../hooks/useGraphSelection'
import { useGraphKeyboardEvents } from '../hooks/useGraphKeyboardEvents'
import { useGraphBlockDrop } from '../hooks/useGraphBlockDrop'
import { useGraphTransformSync } from '../hooks/useGraphTransformSync'
import { SelectBox } from './SelectBox'

export const Graph = ({
  bot,
  totalAnswers,
  totalVisitedEdges,
  ...props
}: {
  bot: BotV6 | PublicBotV6
  totalVisitedEdges?: TotalVisitedEdges[]
  totalAnswers?: TotalAnswers[]
} & FlexProps) => {

  const graphContainerRef = useRef<HTMLDivElement | null>(null)

  const { createGroup, shouldShowTemplateConfirmation: checkTemplate } = useBot()

  const {
    draggedBlockType,
    setDraggedBlockType,
    draggedBlock,
    setDraggedBlock,
    draggedItem,
    setDraggedItem,
  } = useBlockDnd()

  const {
    confirmationState,
    showTemplateConfirmation,
    handleConfirm,
    handleCancel,
    handleCreateBasic,
  } = useBlockTemplateConfirmation()

  const {
    isReadOnly,
    setGraphPosition: setGlobalGraphPosition,
    openedBlockId,
    openedItemId,
    setOpenedBlockId,
    setOpenedItemId,
    setPreviewingEdge,
    setSelectedEdge,
    connectingIds,
    previewingBlock,
    setPreviewingBlock,
  } = useGraph()

  const {
    isDraggingGraph,
    setIsDraggingGraph,
    focusedGroups,
    setGroupsCoordinates,
    blurGroups,
    setFocusedGroups,
    updateGroupCoordinates,
  } = useGraphGroups()

  const [graphPosition, setGraphPosition] = useState(
    graphPositionDefaultValue(bot.events[0].graphCoordinates ?? { x: 0, y: 0 }),
  )

  useGraphEdgeAutoPan(connectingIds, setGraphPosition)

  const { zoom } = useGraphZoom({
    graphContainerRef,
    graphPosition,
    setGraphPosition,
  })

  const selection = useGraphSelection({
    enabled: !isDraggingGraph && !isReadOnly,
    onSelectionChange: setFocusedGroups,
  })

  const { isDragging, setIsDragging } = useGraphGestures({
    graphContainerRef,
    graphPosition,
    setGraphPosition,
    zoom,
    isDraggingGraph,
    isReadOnly,
    openedBlockId,
    openedItemId,
    setOpenedBlockId,
    setOpenedItemId,
    setPreviewingEdge,
    setSelectedEdge,
    blurGroups,
    onSelectionDragStart: selection.startSelection,
    onSelectionDragMove: selection.updateSelection,
    onSelectionDragEnd: selection.clearSelection,
    shouldEnableSelection: () =>
      isDraggingGraph ? false : true,
  })

  useGraphKeyboardEvents({
    setIsDraggingGraph,
    setIsDragging,
  })

  useGraphBlockDrop({
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
  })

  const { transform } = useGraphTransformSync({
    graphContainerRef,
    graphPosition,
    setGlobalGraphPosition,
  })

  useEffect(() => {
    setGroupsCoordinates(bot.groups)
  }, [bot.groups, setGroupsCoordinates])

  useGraphBackgroundGrid(graphContainerRef, graphPosition)

  useGraphCenterOnPreview({
    previewingBlock,
    graphContainerRef,
    bot,
    graphPosition,
    setGraphPosition,
    draggedBlock,
    draggedBlockType,
    draggedItem,
    isDraggingGraph,
    isDragging,
    connectingIds,
    setPreviewingBlock,
  })

  const cursor = isDraggingGraph ? (isDragging ? 'grabbing' : 'grab') : 'auto'

  return (
    <Flex
      ref={graphContainerRef}
      position="relative"
      bg="bg.editor"
      style={{
        touchAction: 'none',
        cursor,
      }}
      {...props}
    >
      {!isReadOnly && (
        <>
          {selection.selectBoxCoordinates && <SelectBox {...selection.selectBoxCoordinates} />}
          <Fade in={!isReadOnly && focusedGroups.length > 1}>
            <GroupSelectionMenu
              graphPosition={graphPosition}
              focusedGroups={focusedGroups}
              blurGroups={blurGroups}
              isReadOnly={isReadOnly}
            />
          </Fade>
        </>
      )}

      <Flex
        flex="1"
        w="full"
        h="full"
        position="absolute"
        data-testid="graph"
        style={{
          transform,
          perspective: 1000,
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        }}
        willChange="transform"
        transformOrigin="0px 0px 0px"
      >
        <GraphElements
          edges={bot.edges}
          groups={bot.groups}
          events={bot.events}
          totalAnswers={totalAnswers}
          totalVisitedEdges={totalVisitedEdges}
        />
      </Flex>

      <BlockTemplateConfirmationModal
        isOpen={confirmationState.isOpen}
        blockType={confirmationState.blockType}
        onConfirm={handleConfirm}
        onCreateBasic={handleCreateBasic}
        onReject={handleCancel}
      />
    </Flex>
  )
}

