import { Edge, GroupV6 } from '@quickbot.io/schemas'

export interface LoopDetectionResult {
  hasLoops: boolean
  loops: Loop[]
  warnings: LoopWarning[]
}

export interface Loop {
  id: string
  path: string[]
  severity: 'critical' | 'warning' | 'info'
  type: 'infinite' | 'conditional' | 'recursive'
  iterations?: number
}

export interface LoopWarning {
  loopId: string
  message: string
  groupIds: string[]
  groupNames: string
  recommendation: string
}
/**
 * Immutable state for Tarjan's algorithm
 */
interface TarjanState {
  readonly index: number
  readonly stack: readonly string[]
  readonly indices: ReadonlyMap<string, number>
  readonly lowLinks: ReadonlyMap<string, number>
  readonly onStack: ReadonlySet<string>
  readonly sccs: readonly string[][]
}

const createInitialState = (): TarjanState => ({
  index: 0,
  stack: [],
  indices: new Map(),
  lowLinks: new Map(),
  onStack: new Set(),
  sccs: [],
})

/**
 * Pure function to update state immutably
 */
const updateState = (
  state: TarjanState,
  updates: Partial<TarjanState>
): TarjanState => ({
  ...state,
  ...updates,
})

const strongConnect = (
  nodeId: string,
  state: TarjanState,
  adjacencyList: Map<string, string[]>
): TarjanState => {
  // Set the depth index for this node
  const indices = new Map(state.indices)
  indices.set(nodeId, state.index)

  const lowLinks = new Map(state.lowLinks)
  lowLinks.set(nodeId, state.index)

  const stack = [...state.stack, nodeId]
  const onStack = new Set([...state.onStack, nodeId])

  let currentState = updateState(state, {
    index: state.index + 1,
    indices,
    lowLinks,
    stack,
    onStack,
  })

  // Consider successors of nodeId
  const neighbors = adjacencyList.get(nodeId) || []
  for (const neighbor of neighbors) {
    if (!currentState.indices.has(neighbor)) {
      // Neighbor has not yet been visited; recurse on it
      currentState = strongConnect(neighbor, currentState, adjacencyList)

      const newLowLinks = new Map(currentState.lowLinks)
      const nodeLowLink = newLowLinks.get(nodeId)!
      const neighborLowLink = newLowLinks.get(neighbor)!
      newLowLinks.set(nodeId, Math.min(nodeLowLink, neighborLowLink))

      currentState = updateState(currentState, { lowLinks: newLowLinks })
    } else if (currentState.onStack.has(neighbor)) {
      // Neighbor is in stack and hence in the current SCC
      const newLowLinks = new Map(currentState.lowLinks)
      const nodeLowLink = newLowLinks.get(nodeId)!
      const neighborIndex = currentState.indices.get(neighbor)!
      newLowLinks.set(nodeId, Math.min(nodeLowLink, neighborIndex))

      currentState = updateState(currentState, { lowLinks: newLowLinks })
    }
  }

  // If nodeId is a root node, pop the stack and generate an SCC
  if (currentState.lowLinks.get(nodeId) === currentState.indices.get(nodeId)) {
    const scc: string[] = []
    const newStack = [...currentState.stack]
    const newOnStack = new Set(currentState.onStack)
    let w: string

    do {
      w = newStack.pop()!
      newOnStack.delete(w)
      scc.push(w)
    } while (w !== nodeId)

    // Only save components with more than one node or self-loops
    if (scc.length > 1 || hasSelfLoop(nodeId, adjacencyList)) {
      currentState = updateState(currentState, {
        stack: newStack,
        onStack: newOnStack,
        sccs: [...currentState.sccs, scc],
      })
    } else {
      currentState = updateState(currentState, {
        stack: newStack,
        onStack: newOnStack,
      })
    }
  }

  return currentState
}

const hasSelfLoop = (nodeId: string, adjacencyList: Map<string, string[]>): boolean => {
  return adjacencyList.get(nodeId)?.includes(nodeId) || false
}

const findSCCs = (adjacencyList: Map<string, string[]>): string[][] => {
  let state = createInitialState()

  for (const nodeId of adjacencyList.keys()) {
    if (!state.indices.has(nodeId)) {
      state = strongConnect(nodeId, state, adjacencyList)
    }
  }

  return [...state.sccs]
}

const buildAdjacencyList = (groups: GroupV6[], edges: Edge[]): Map<string, string[]> => {
  const adjacencyList = new Map<string, string[]>()

  // Initialize all nodes
  groups.forEach((group) => {
    adjacencyList.set(group.id, [])
  })

  edges.forEach((edge) => {
    const fromGroupId = getGroupIdFromEdgeSource(groups, edge.from)
    const toGroupId = edge.to.groupId

    if (fromGroupId && toGroupId) {
      const neighbors = adjacencyList.get(fromGroupId) || []
      if (!neighbors.includes(toGroupId)) {
        neighbors.push(toGroupId)
      }
      adjacencyList.set(fromGroupId, neighbors)
    }
  })

  return adjacencyList
}

const getGroupIdFromEdgeSource = (
  groups: GroupV6[],
  source: Edge['from']
): string | undefined => {
  if ('eventId' in source) {
    return undefined
  }
  const blockId = source.blockId
  return groups.find((g) => g.blocks.some((b) => b.id === blockId))?.id
}

const classifyLoops = (sccs: string[][], groups: GroupV6[], edges: Edge[]): Loop[] => {
  return sccs.map((scc, index) => {
    const hasConditions = checkForConditions(scc, groups)
    const hasEscapeRoutes = checkForEscapeRoutes(scc, edges, groups)

    let severity: Loop['severity'] = 'critical'
    let type: Loop['type'] = 'infinite'

    if (hasConditions && hasEscapeRoutes) {
      severity = 'info'
      type = 'conditional'
    } else if (hasConditions || hasEscapeRoutes) {
      severity = 'warning'
      type = 'recursive'
    }

    return {
      id: `loop-${index}`,
      path: scc,
      severity,
      type,
    }
  })
}

const checkForConditions = (scc: string[], groups: GroupV6[]): boolean => {
  return scc.some((groupId) => {
    const group = groups.find((g) => g.id === groupId)
    return group?.blocks.some((block) => block.type === 'Condition')
  })
}

const checkForEscapeRoutes = (scc: string[], edges: Edge[], groups: GroupV6[]): boolean => {
  const sccSet = new Set(scc)
  return edges.some((edge) => {
    const fromGroupId = getGroupIdFromEdgeSource(groups, edge.from)
    const toGroupId = edge.to.groupId
    return fromGroupId && sccSet.has(fromGroupId) && toGroupId && !sccSet.has(toGroupId)
  })
}

const generateWarnings = (loops: Loop[], groups: GroupV6[]): LoopWarning[] => {
  return loops.map((loop) => {
    const groupNames = loop.path
      .map((id) => groups.find((g) => g.id === id)?.title || id)
      .join(' → ')

    let message = ''
    let recommendation = ''

    switch (loop.severity) {
      case 'critical':
        message = 'Infinite loop detected'
        recommendation = 'Add an exit condition or iteration limit.'
        break
      case 'warning':
        message = 'Potentially dangerous loop'
        recommendation = 'Verify that all paths have clear exit conditions.'
        break
      case 'info':
        message = 'Conditional loop detected'
        recommendation = 'This loop appears safe, but verify the condition logic.'
        break
    }

    return {
      loopId: loop.id,
      message,
      groupIds: loop.path,
      groupNames,
      recommendation,
    }
  })
}

/**
 * Main pure function for loop detection
 */
export const detectLoops = (groups: GroupV6[], edges: Edge[]): LoopDetectionResult => {
  const adjacencyList = buildAdjacencyList(groups, edges)
  const sccs = findSCCs(adjacencyList)
  const loops = classifyLoops(sccs, groups, edges)
  const warnings = generateWarnings(loops, groups)

  return {
    hasLoops: loops.length > 0,
    loops,
    warnings,
  }
}

export const wouldCreateLoop = (
  groups: GroupV6[],
  edges: Edge[],
  newEdge: { fromGroupId: string; toGroupId: string }
): boolean => {
  // Find the source group and get the first block's ID for simulation
  const sourceGroup = groups.find((g) => g.id === newEdge.fromGroupId)
  if (!sourceGroup || sourceGroup.blocks.length === 0) {
    return false
  }

  const simulatedEdges = [
    ...edges,
    {
      id: 'temp',
      from: { blockId: sourceGroup.blocks[0].id },
      to: { groupId: newEdge.toGroupId },
    } as Edge,
  ]

  const result = detectLoops(groups, simulatedEdges)
  return result.hasLoops
}

/**
 * Backward compatibility class
 * @deprecated Use detectLoops() function instead
 */
export class GraphLoopDetector {
  detectLoops(groups: GroupV6[], edges: Edge[]): LoopDetectionResult {
    return detectLoops(groups, edges)
  }

  wouldCreateLoop(
    groups: GroupV6[],
    edges: Edge[],
    newEdge: { fromGroupId: string; toGroupId: string }
  ): boolean {
    return wouldCreateLoop(groups, edges, newEdge)
  }
}