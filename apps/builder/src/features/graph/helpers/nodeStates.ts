import { Edge } from '@quickbot.io/schemas'
import { isNotDefined } from '@quickbot.io/lib'

export type NodeType = 'block' | 'group' | 'item' | 'event'

export type NodeState = 'normal' | 'selected' | 'current' | 'focused' | 'error'

export type EdgeState = 'normal' | 'selected' | 'current' | 'hovered' | 'loop'

export const getNodeOutline = (state: NodeState): string => {
  switch (state) {
    case 'selected':
      return '2px solid var(--chakra-colors-green-500)'
    case 'current':
      return '2px solid var(--chakra-colors-green-300)'
    case 'focused':
      return '2px solid var(--chakra-colors-gray-300)'
    case 'error':
      return '2px solid var(--chakra-colors-red-400)'
    default:
      return '1px solid var(--chakra-colors-gray-200)'
  }
}

export const getEdgeStroke = (state: EdgeState): string => {
  switch (state) {
    case 'selected':
      return 'var(--chakra-colors-green-500)'
    case 'current':
      return 'var(--chakra-colors-green-300)'
    case 'hovered':
      return 'var(--chakra-colors-gray-300)'
    case 'loop':
      return 'var(--chakra-colors-red-400)'
    default:
      return 'var(--chakra-colors-gray-200)'
  }
}


export const getNodeState = ({
  isConnecting = false,
  isFocused = false,
  isContextMenuOpened = false,
  isPreviewing = false,
  isConnectedToSelectedEdge = false,
  hasError = false,
}: {
  isConnecting?: boolean
  isFocused?: boolean
  isContextMenuOpened?: boolean
  isPreviewing?: boolean
  isConnectedToSelectedEdge?: boolean
  hasError?: boolean
}): NodeState => {
  if (hasError) return 'error'
  if (isPreviewing) return 'current'
  if (isConnecting || isContextMenuOpened || isConnectedToSelectedEdge) return 'selected'
  if (isFocused) return 'focused'
  return 'normal'
}

// Helper function to check if a node is connected to an edge
export const isNodeConnectedToEdge = (
  edge: Edge | undefined,
  nodeId: string,
  nodeType: NodeType,
  groupId?: string
): boolean => {
  if (!edge) return false

  switch (nodeType) {
    case 'block':
      // Block can be source or target
      return (
        edge.to.blockId === nodeId ||
        ('blockId' in edge.from && edge.from.blockId === nodeId)
      )

    case 'group':
      // Group can be source or target (only when no blockId in target)
      return (
        ('groupId' in edge.from && edge.from.groupId === groupId) ||
        (edge.to.groupId === groupId && isNotDefined(edge.to.blockId))
      )

    case 'item':
      // Item can only be source
      return 'itemId' in edge.from && edge.from.itemId === nodeId

    case 'event':
      // Event can only be source
      return 'eventId' in edge.from && edge.from.eventId === nodeId

    default:
      return false
  }
}

export const getEdgeState = ({
  isMouseOver = false,
  previewingEdge,
  selectedEdge,
  edgeId,
  isInLoop = false
}: {
  isMouseOver?: boolean
  previewingEdge?: { id: string }
  selectedEdge?: { id: string }
  edgeId: string
  isInLoop?: boolean
}): EdgeState => {
  if (isInLoop) return 'loop'
  if (previewingEdge?.id === edgeId) return 'current'
  if (selectedEdge?.id === edgeId) return 'selected'
  if (isMouseOver) return 'hovered'
  return 'normal'
}