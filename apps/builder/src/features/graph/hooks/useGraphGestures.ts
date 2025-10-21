import { useGesture } from '@use-gesture/react'
import { Vector2 } from '@use-gesture/react'
import { RefObject, useState } from 'react'
import { Edge } from '@quickbot.io/schemas'
import { zoomPinchConfig } from '../providers/GraphZoomProvider'
import { useEventListener } from '@chakra-ui/react'

interface UseGraphGesturesParams {
  graphContainerRef: RefObject<HTMLDivElement>
  graphPosition: {
    x: number
    y: number
    scale: number
  }
  setGraphPosition: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
      scale: number
    }>
  >
  zoom: (params: { scale: number; mousePosition: { x: number; y: number } }) => void
  isDraggingGraph: boolean
  isReadOnly: boolean
  openedBlockId: string | undefined
  openedItemId: string | undefined
  setOpenedBlockId: (id: string | undefined) => void
  setOpenedItemId: (id: string | undefined) => void
  setPreviewingEdge: React.Dispatch<React.SetStateAction<Edge | undefined>>
  setSelectedEdge: React.Dispatch<React.SetStateAction<Edge | undefined>>
  blurGroups: () => void
  onSelectionDragStart?: () => void
  onSelectionDragMove?: (props: { initial: Vector2; movement: Vector2 }) => void
  onSelectionDragEnd?: () => void
  shouldEnableSelection: () => boolean
}

export const useGraphGestures = ({
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
  onSelectionDragStart,
  onSelectionDragMove,
  onSelectionDragEnd,
  shouldEnableSelection,
}: UseGraphGesturesParams) => {
  const [isDragging, setIsDragging] = useState(false)

  useGesture(
    {
      onDragStart: () => {
        if (openedBlockId) {
          setOpenedBlockId(undefined)
        }
        if (openedItemId) {
          setOpenedItemId(undefined)
        }
      },
      onDrag: (props) => {
        const isSelecting = !isReadOnly && shouldEnableSelection()

        if (isSelecting) {
          // Selection mode
          if (props.first) onSelectionDragStart?.()
          onSelectionDragMove?.({ initial: props.initial, movement: props.movement })
          if (props.last) {
            onSelectionDragEnd?.()

            // Check if it was a simple click (minimal movement) and deselect
            const movementDistance = Math.sqrt(
              props.movement[0] ** 2 + props.movement[1] ** 2
            )

            // If movement is less than 5px, consider it a click
            if (movementDistance < 5) {
              blurGroups()
              setSelectedEdge(undefined)
            }
          }
        } else {
          // Pan mode
          if (props.first) setIsDragging(true)
          if (props.last) setIsDragging(false)
          setGraphPosition({
            ...graphPosition,
            x: graphPosition.x + props.delta[0],
            y: graphPosition.y + props.delta[1],
          })
        }
      },
      onWheel: ({ shiftKey, delta: [dx, dy], pinching, ctrlKey }) => {
        if (pinching) return

        // If Ctrl is pressed, do not scroll (only zoom)
        if (ctrlKey) return

        if (openedBlockId) {
          setOpenedBlockId(undefined)
        }
        if (openedItemId) {
          setOpenedItemId(undefined)
        }

        setGraphPosition({
          ...graphPosition,
          x: shiftKey ? graphPosition.x - dy : graphPosition.x - dx,
          y: shiftKey ? graphPosition.y : graphPosition.y - dy,
        })
      },
      onPinch: ({ origin: [x, y], offset: [scale] }) => {
        zoom({ scale, mousePosition: { x, y } })
      },
    },
    {
      target: graphContainerRef,
      pinch: zoomPinchConfig,
      drag: { pointer: { keys: false } },
    },
  )

  // Handle pointer up - clean up states
  const handlePointerUp = () => {
    if (isDraggingGraph && isDragging) return

    setOpenedBlockId(undefined)
    setOpenedItemId(undefined)
    setPreviewingEdge(undefined)
    setSelectedEdge(undefined)
  }

  useEventListener(graphContainerRef.current, 'pointerup', handlePointerUp)

  // Prevent Safari native zoom during pinch gestures
  useEventListener(document, 'gesturestart', (e) => e.preventDefault())
  useEventListener(document, 'gesturechange', (e) => e.preventDefault())

  // Prevent back/forward navigation in Firefox and macOS trackpad gestures
  useEventListener(
    graphContainerRef.current,
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault()
    },
    {
      passive: false,
    },
  )

  return {
    isDragging,
    setIsDragging,
  }
}
