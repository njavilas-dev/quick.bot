import { useEffect, useState, useMemo, useRef } from 'react'
import { BotV6 } from '@quickbot.io/schemas'
import { detectLoops, LoopDetectionResult } from '../utils/loopDetector'
import { useDebounce } from 'use-debounce'
import { useGraph } from '../providers/GraphProvider'

const EMPTY_RESULT: LoopDetectionResult = {
  hasLoops: false,
  loops: [],
  warnings: [],
}

/**
 * Generates a stable hash for groups and edges
 */
const computeGraphHash = (groups: BotV6['groups'], edges: BotV6['edges']): string => {
  const groupIds = groups.map((g) => g.id).sort().join(',')
  const edgeIds = edges
    .map((e) => `${e.id}:${e.to.groupId}`)
    .sort()
    .join(',')
  return `${groupIds}|${edgeIds}`
}

/**
 * Simple cache map to store recent results
 */
const cacheMap = new Map<string, LoopDetectionResult>()
const MAX_CACHE_SIZE = 50

export const useLoopDetection = (bot: BotV6 | undefined, enabled = true) => {
  const { loopHighlight, setLoopHighlight } = useGraph()
  const [loopResult, setLoopResult] = useState<LoopDetectionResult>(EMPTY_RESULT)
  const lastHashRef = useRef<string | null>(null)

  // Debounce to avoid excessive calculations while the user edits
  const [debouncedBot] = useDebounce(bot, 500)

  // Memoize groups and edges to avoid recalculation if unchanged
  const groups = useMemo(() => debouncedBot?.groups ?? [], [debouncedBot?.groups])
  const edges = useMemo(() => debouncedBot?.edges ?? [], [debouncedBot?.edges])

  useEffect(() => {
    if (!enabled || !debouncedBot) {
      setLoopResult(EMPTY_RESULT)
      return
    }

    try {
      // Compute hash to check cache
      const hash = computeGraphHash(groups, edges)

      // Skip if same as last computation
      if (hash === lastHashRef.current) {
        return
      }

      let result: LoopDetectionResult

      // Check cache
      if (cacheMap.has(hash)) {
        result = cacheMap.get(hash)!
      } else {
        // Compute new result
        result = detectLoops(groups, edges)

        // Store in cache
        cacheMap.set(hash, result)

        // Evict oldest if cache is too large
        if (cacheMap.size > MAX_CACHE_SIZE) {
          const firstKey = cacheMap.keys().next().value
          cacheMap.delete(firstKey)
        }
      }

      lastHashRef.current = hash
      setLoopResult(result)
    } catch (error) {
      console.error('Error detecting loops:', error)
      setLoopResult(EMPTY_RESULT)
    }
  }, [groups, edges, enabled, debouncedBot])

  // Clear highlight when all loops are fixed
  useEffect(() => {
    if (loopResult.loops.length === 0 && loopHighlight) {
      setLoopHighlight(undefined)
    }
  }, [loopResult.loops.length, loopHighlight, setLoopHighlight])

  // Clear highlight when the currently highlighted loop no longer exists
  useEffect(() => {
    if (!loopHighlight || loopResult.loops.length === 0) return

    // Check if the highlighted loop still exists
    const highlightedLoopExists = loopResult.loops.some((loop) =>
      loop.path.every((groupId) => loopHighlight.groupIds.includes(groupId))
    )

    if (!highlightedLoopExists) {
      setLoopHighlight(undefined)
    }
  }, [loopResult.loops, loopHighlight, setLoopHighlight])

  return loopResult
}