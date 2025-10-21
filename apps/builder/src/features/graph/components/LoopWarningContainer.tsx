import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDisclosure } from '@chakra-ui/react'
import { useGraph } from '../providers/GraphProvider'
import { LoopDetectionResult } from '../utils/loopDetector'
import {
  LoopWarningPresenter,
  LoopWarningViewModel,
  toWarningViewModel,
} from './LoopWarningPresenter'

interface LoopWarningContainerProps {
  result: LoopDetectionResult
}

/**
 * Determines the highest severity from loops
 */
const getHighestSeverity = (result: LoopDetectionResult): 'critical' | 'warning' | 'info' => {
  const hasCritical = result.loops.some((l) => l.severity === 'critical')
  const hasWarning = result.loops.some((l) => l.severity === 'warning')

  if (hasCritical) return 'critical'
  if (hasWarning) return 'warning'
  return 'info'
}

const getSeverityColor = (severity: 'critical' | 'warning' | 'info'): string => {
  switch (severity) {
    case 'critical':
      return 'red'
    case 'warning':
      return 'orange'
    case 'info':
      return 'blue'
  }
}

/**
 * Container component - handles all business logic and side effects
 */
export const LoopWarningContainer = ({ result }: LoopWarningContainerProps) => {
  const { setLoopHighlight, setPreviewingBlock } = useGraph()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const previousLoopCountRef = useRef(0)

  // Auto-open popover when new loops are detected
  useEffect(() => {
    const currentLoopCount = result.loops.length

    if (currentLoopCount > previousLoopCountRef.current && currentLoopCount > 0) {
      onOpen()
    }

    // Close popover when all loops are fixed
    if (currentLoopCount === 0) {
      onClose()
    }

    previousLoopCountRef.current = currentLoopCount
  }, [result.loops.length, onOpen, onClose])

  // Transform domain data to view models
  const warnings: LoopWarningViewModel[] = useMemo(() => {
    return result.warnings.map((warning, index) => {
      const loop = result.loops[index]
      return toWarningViewModel(warning, loop)
    })
  }, [result.warnings, result.loops])

  // Calculate highest severity color
  const highestSeverityColor = useMemo(() => {
    const severity = getHighestSeverity(result)
    return getSeverityColor(severity)
  }, [result])

  // Handle warning click - highlight loop in graph
  const handleWarningClick = useCallback(
    (warning: LoopWarningViewModel) => {
      setLoopHighlight({
        groupIds: warning.groupIds,
        severity: warning.severity,
      })

      // Center the first group in the loop (where it originates)
      // Use unique ID to force re-center even if same group is clicked again
      if (warning.groupIds.length > 0) {
        const firstGroupId = warning.groupIds[0]
        setPreviewingBlock({ id: `loop-preview-${Date.now()}`, groupId: firstGroupId })
      }
    },
    [setLoopHighlight, setPreviewingBlock]
  )

  // Handle close - clear highlight
  const handleClose = useCallback(() => {
    setLoopHighlight(undefined)
    onClose()
  }, [setLoopHighlight, onClose])

  return (
    <LoopWarningPresenter
      warnings={warnings}
      totalCount={result.loops.length}
      highestSeverityColor={highestSeverityColor}
      isOpen={isOpen}
      onWarningClick={handleWarningClick}
      onClose={handleClose}
      onOpen={onOpen}
    />
  )
}
