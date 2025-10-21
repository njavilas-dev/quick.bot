import React, { useMemo, useState } from 'react'
import { Edge as EdgeProps } from '@quickbot.io/schemas'
import { Portal, useDisclosure } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useEndpoints } from '../../providers/EndpointsProvider'
import { computeEdgePath } from '../../helpers/computeEdgePath'
import { getAnchorsPosition } from '../../helpers/getAnchorsPosition'
import { useGraph } from '../../providers/GraphProvider'
import { EdgeMenu } from './EdgeMenu'
import { useFlowEventsCoordinates } from '../../providers/FlowEventsCoordinatesProvider'
import { eventWidth, groupWidth } from '../../constants'
import { useGroupCoordinates } from '../../hooks/useGraphGroups'
import { getEdgeState, getEdgeStroke } from '../../helpers/nodeStates'

type Props = {
  edge: EdgeProps
  fromGroupId: string | undefined
}

export const Edge = ({ edge, fromGroupId }: Props) => {
  const { bot, deleteEdge } = useBot()
  const { previewingEdge, selectedEdge, graphPosition, isReadOnly, setSelectedEdge, loopHighlight } = useGraph()
  const { sourceEndpointYOffsets, targetEndpointYOffsets } = useEndpoints()
  const fromGroupCoordinates = useGroupCoordinates(fromGroupId)
  const toGroupCoordinates = useGroupCoordinates(edge.to.groupId)

  const { eventsCoordinates } = useFlowEventsCoordinates()
  const [isMouseOver, setIsMouseOver] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 })

  // Check if this edge connects two groups that are both in the loop
  const isInLoop = loopHighlight?.groupIds.includes(fromGroupId || '') &&
    loopHighlight?.groupIds.includes(edge.to.groupId)

  const edgeState = getEdgeState({
    isMouseOver,
    previewingEdge,
    selectedEdge,
    edgeId: edge.id,
    isInLoop
  })

  const sourceElementCoordinates =
    'eventId' in edge.from ? eventsCoordinates[edge.from.eventId] : fromGroupCoordinates

  const sourceTop = useMemo(() => {
    const endpointId =
      'eventId' in edge.from ? edge.from.eventId : edge?.from.itemId ?? edge?.from.blockId
    if (!endpointId) return
    return sourceEndpointYOffsets.get(endpointId)?.y
  }, [edge.from, sourceEndpointYOffsets])

  // Memoize block existence check separately to avoid re-computing on every bot change
  const targetBlockExists = useMemo(() => {
    if (!edge.to.blockId) return true // If no specific block target, assume it exists
    const targetGroup = bot?.groups.find((g) => g.id === edge.to.groupId)
    return targetGroup?.blocks.some((b) => b.id === edge.to.blockId) ?? false
  }, [bot?.groups, edge.to.blockId, edge.to.groupId])

  const targetTop = useMemo(() => {
    if (targetEndpointYOffsets.size === 0) return
    if (edge.to.blockId) {
      const targetOffset = targetEndpointYOffsets.get(edge.to.blockId)
      if (!targetOffset) {
        // Only delete edge if block truly doesn't exist (not just a race condition)
        if (!targetBlockExists) {
          if (selectedEdge?.id === edge.id) {
            setSelectedEdge(undefined)
          }
          deleteEdge(edge.id)
        }
        // If block exists but offset is not available yet (race condition), just return
        // The edge will render once the offset is available
        return
      }
      return targetOffset.y
    }
    return
  }, [targetBlockExists, deleteEdge, edge.id, edge.to.blockId, targetEndpointYOffsets, selectedEdge, setSelectedEdge])

  const path = useMemo(() => {
    if (!sourceElementCoordinates || !toGroupCoordinates || !sourceTop) return ``
    const anchorsPosition = getAnchorsPosition({
      sourceGroupCoordinates: sourceElementCoordinates,
      targetGroupCoordinates: toGroupCoordinates,
      elementWidth: 'eventId' in edge.from ? eventWidth : groupWidth,
      sourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    })
    return computeEdgePath(anchorsPosition)
  }, [
    sourceElementCoordinates,
    toGroupCoordinates,
    sourceTop,
    edge.from,
    targetTop,
    graphPosition.scale,
  ])

  const handleMouseEnter = () => setIsMouseOver(true)

  const handleMouseLeave = () => setIsMouseOver(false)

  const handleEdgeClick = () => {
    setSelectedEdge(edge)
  }

  const handleContextMenuTrigger = (e: React.MouseEvent) => {
    if (isReadOnly) return
    e.preventDefault()
    setEdgeMenuPosition({ x: e.clientX, y: e.clientY })
    onOpen()
  }

  const handleDeleteEdge = () => {
    // Clear selectedEdge if the deleted edge is currently selected
    if (selectedEdge?.id === edge.id) {
      setSelectedEdge(undefined)
    }
    deleteEdge(edge.id)
  }

  return (
    <>
      <path
        data-testid="clickable-edge"
        d={path}
        strokeWidth="18px"
        stroke="white"
        fill="none"
        pointerEvents="stroke"
        style={{ cursor: 'pointer', visibility: 'hidden' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
        onContextMenu={handleContextMenuTrigger}
      />
      <path
        data-testid="edge"
        d={path}
        stroke={getEdgeStroke(edgeState)}
        strokeWidth="2px"
        markerEnd="url(#arrow)"
        fill="none"
        pointerEvents="none"
      />
      <path
        d={path}
        stroke={getEdgeStroke(edgeState)}
        strokeWidth="2px"
        fill="none"
        pointerEvents="none"
        className="flow-light-dots-animation"
      />
      <Portal>
        <EdgeMenu
          isOpen={isOpen}
          position={edgeMenuPosition}
          onDeleteEdge={handleDeleteEdge}
          onClose={onClose}
        />
      </Portal>
    </>
  )
}
