import { useEffect, useRef } from 'react'
import { BlockV6, BotV6, PublicBotV6 } from '@quickbot.io/schemas'
import { ConnectingIds } from '../types'

export const useGraphCenterOnPreview = ({
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
}: {
  previewingBlock?: { id: string; groupId: string }
  graphContainerRef: React.RefObject<HTMLDivElement>
  bot: BotV6 | PublicBotV6
  graphPosition: { x: number; y: number; scale: number }
  setGraphPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>
  draggedBlock: BlockV6 | undefined
  draggedBlockType: string | undefined
  draggedItem: unknown
  isDraggingGraph: boolean
  isDragging: boolean
  connectingIds: ConnectingIds | null
  setPreviewingBlock: (block: { id: string; groupId: string } | undefined) => void
}) => {
  const animationFrameRef = useRef<number>()
  const previewingBlockRef = useRef(previewingBlock)
  const setPreviewingBlockRef = useRef(setPreviewingBlock)

  // Keep refs in sync with latest values
  useEffect(() => {
    previewingBlockRef.current = previewingBlock
    setPreviewingBlockRef.current = setPreviewingBlock
  }, [previewingBlock, setPreviewingBlock])

  useEffect(() => {
    // Cancel any ongoing animation before starting a new one
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }

    if (!previewingBlock?.groupId || !graphContainerRef.current) return

    // Prevent auto-centering during user interactions (drag and drop, graph dragging, etc.)
    if (draggedBlock || draggedBlockType || draggedItem || isDraggingGraph || isDragging || connectingIds) return

    const targetGroup = bot.groups.find(group => group.id === previewingBlock.groupId)
    if (!targetGroup) return

    const groupElement = document.getElementById(`group-${targetGroup.id}`)
    if (!groupElement) return

    // Get the dimensions of the graph container
    const graphRect = graphContainerRef.current.getBoundingClientRect()
    const groupRect = groupElement.getBoundingClientRect()

    // Check if the group is already visible in the viewport
    const isGroupVisible = (
      groupRect.left >= graphRect.left &&
      groupRect.right <= graphRect.right &&
      groupRect.top >= graphRect.top &&
      groupRect.bottom <= graphRect.bottom
    )

    // If the group is already visible, do nothing
    if (isGroupVisible) return

    // Calculate the target position to center the group
    const graphCenterX = graphRect.width / 2
    const graphCenterY = graphRect.height / 2

    // Coordinates of the group in the canvas
    const groupX = targetGroup.graphCoordinates.x
    const groupY = targetGroup.graphCoordinates.y

    // Get current scale and position at the time of execution
    const currentScale = graphPosition.scale
    const currentX = graphPosition.x
    const currentY = graphPosition.y

    // Calculate the new graph position to center the group
    const targetGraphX = graphCenterX - (groupX * currentScale)
    const targetGraphY = graphCenterY - (groupY * currentScale)

    // Smooth animation using requestAnimationFrame
    const startPosition = { x: currentX, y: currentY }
    const targetPosition = { x: targetGraphX, y: targetGraphY }
    const duration = 800 // 800ms for the animation
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Function for smooth easing (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const animatedX = startPosition.x + (targetPosition.x - startPosition.x) * easeOut
      const animatedY = startPosition.y + (targetPosition.y - startPosition.y) * easeOut

      setGraphPosition(prev => ({
        ...prev,
        x: animatedX,
        y: animatedY
      }))

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = undefined
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup function to cancel animation on unmount or re-run
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previewingBlock?.id, // Use id to detect re-clicks
    previewingBlock?.groupId,
    draggedBlock,
    draggedBlockType,
    draggedItem,
    isDraggingGraph,
    isDragging,
    connectingIds,
    // Note: graphPosition and setGraphPosition intentionally not in deps
    // We capture their values at animation start time, not track changes
  ])

  // Clear previewingBlock when user starts dragging (user intent detection)
  const prevIsDraggingRef = useRef(false)
  const prevIsDraggingGraphRef = useRef(false)

  useEffect(() => {
    const startedDragging = !prevIsDraggingRef.current && isDragging
    const startedDraggingGraph = !prevIsDraggingGraphRef.current && isDraggingGraph

    // If user starts dragging, cancel animation and clear preview to give them control
    if (startedDragging || startedDraggingGraph) {
      // Cancel ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }

      // Clear preview if it exists
      if (previewingBlockRef.current) {
        setPreviewingBlockRef.current(undefined)
      }
    }

    prevIsDraggingRef.current = isDragging
    prevIsDraggingGraphRef.current = isDraggingGraph
  }, [isDragging, isDraggingGraph])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
}
