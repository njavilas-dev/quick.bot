/**
 * LoopWarningButton - Detects and displays loop warnings
 *
 * This component encapsulates loop detection logic and UI presentation
 */

import { useLoopDetection } from '../hooks/useLoopDetection'
import { LoopWarningContainer } from './LoopWarningContainer'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'

/**
 * Main component with built-in loop detection
 */
export const LoopWarningButton = () => {
  const { bot } = useBot()
  const { isReadOnly } = useGraph()
  const result = useLoopDetection(bot, !isReadOnly)

  if (!result.hasLoops) return null
  return <LoopWarningContainer result={result} />
}