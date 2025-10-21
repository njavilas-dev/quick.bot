import { useMemo } from 'react'
import { useGraph } from '../providers/GraphProvider'
import { getNodeState, isNodeConnectedToEdge, NodeType, NodeState } from '../helpers/nodeStates'

export interface UseNodeStateOptions {
  nodeId: string
  nodeType: NodeType
  groupId?: string
  isConnecting?: boolean
  isFocused?: boolean
  isContextMenuOpened?: boolean
  hasError?: boolean
}

export const useNodeState = ({
  nodeId,
  nodeType,
  groupId,
  isConnecting = false,
  isFocused = false,
  isContextMenuOpened = false,
  hasError = false
}: UseNodeStateOptions): NodeState => {
  const { 
    selectedEdge, 
    previewingEdge, 
    previewingBlock 
  } = useGraph()

  return useMemo(() => {
    // Check if connected to selected edge
    const isConnectedToSelectedEdge = isNodeConnectedToEdge(
      selectedEdge, 
      nodeId, 
      nodeType, 
      groupId
    )

    // Check if previewing based on different conditions
    let isPreviewing = false
    
    switch (nodeType) {
      case 'block':
        isPreviewing = (
          isNodeConnectedToEdge(previewingEdge, nodeId, nodeType, groupId) ||
          previewingBlock?.id === nodeId
        )
        break
      
      case 'group':
        isPreviewing = (
          isNodeConnectedToEdge(previewingEdge, nodeId, nodeType, groupId) ||
          previewingBlock?.groupId === groupId
        )
        break
      
      case 'item':
      case 'event':
        isPreviewing = isNodeConnectedToEdge(previewingEdge, nodeId, nodeType, groupId)
        break
    }

    return getNodeState({
      isConnecting,
      isFocused,
      isContextMenuOpened,
      isPreviewing,
      isConnectedToSelectedEdge,
      hasError
    })
  }, [
    selectedEdge,
    previewingEdge,
    previewingBlock,
    nodeId,
    nodeType,
    groupId,
    isConnecting,
    isFocused,
    isContextMenuOpened,
    hasError,
  ])
}