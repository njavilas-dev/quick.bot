import { useMemo } from 'react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas/features/analytics'
import { computeTotalUsersAtBlock } from '@/features/analytics/helpers/computeTotalUsersAtBlock'
import { getTotalAnswersAtBlock } from '@/features/analytics/helpers/getTotalAnswersAtBlock'
import { getBlockId } from '@/features/analytics/helpers/blockHelpers'
import type { PublicBotV6 } from '@quickbot.io/schemas'

interface AnalyticsActionsConfig {
  isVisible: boolean
  dropOffRate: number
  totalDroppedUsers: number
  totalUsers: number
  tooltipLabel: string
}

/**
 * Custom hook that provides analytics actions configuration
 * Calculates drop-off metrics and provides visibility control
 */
export const useAnalyticsActions = (
  blockId: string,
  totalVisitedEdges: TotalVisitedEdges[],
  totalAnswers: TotalAnswers[],
  isMouseOver: boolean,
): AnalyticsActionsConfig => {
  const { publishedBot } = useBot()

  const currentBlockId = useMemo(() => getBlockId(publishedBot, blockId), [blockId, publishedBot])

  const dropOffMetrics = useMemo(() => {
    return calculateDropOffMetrics({
      publishedBot,
      currentBlockId,
      totalVisitedEdges,
      totalAnswers,
    })
  }, [currentBlockId, publishedBot, totalAnswers, totalVisitedEdges])

  const tooltipLabel = useMemo(() => {
    if (!dropOffMetrics) return ''

    const { totalDroppedUsers, dropOffRate, totalUsers } = dropOffMetrics
    return `${totalUsers} users reached this block. ${totalDroppedUsers} user${
      totalDroppedUsers > 1 ? 's' : ''
    } left (${dropOffRate}% drop-off rate).`
  }, [dropOffMetrics])

  return {
    isVisible: isMouseOver && !!dropOffMetrics,
    dropOffRate: dropOffMetrics?.dropOffRate ?? 0,
    totalDroppedUsers: dropOffMetrics?.totalDroppedUsers ?? 0,
    totalUsers: dropOffMetrics?.totalUsers ?? 0,
    tooltipLabel,
  }
}

/**
 * Calculates drop-off metrics (total dropped users and drop-off rate)
 * Returns null if calculation cannot be performed
 * Includes validation for edge cases and negative values
 */
function calculateDropOffMetrics({
  publishedBot,
  currentBlockId,
  totalVisitedEdges,
  totalAnswers,
}: {
  publishedBot: PublicBotV6 | undefined
  currentBlockId: string | undefined
  totalVisitedEdges: TotalVisitedEdges[]
  totalAnswers: TotalAnswers[]
}): { totalDroppedUsers: number; dropOffRate: number; totalUsers: number } | null {
  if (!publishedBot || !currentBlockId) return null

  const totalUsersAtBlock = computeTotalUsersAtBlock(currentBlockId, {
    publishedBot,
    totalVisitedEdges,
    totalAnswers,
  })

  const totalBlockReplies = getTotalAnswersAtBlock(currentBlockId, {
    publishedBot,
    totalAnswers,
  })

  if (totalUsersAtBlock === 0) {
    return {
      totalDroppedUsers: 0,
      dropOffRate: 0,
      totalUsers: 0,
    }
  }

  // Calculate users who dropped off
  let totalDroppedUsers = totalUsersAtBlock - totalBlockReplies

  // Validate: Prevent negative values (can occur due to data inconsistencies)
  if (totalDroppedUsers < 0) {
    console.warn(
      `Negative drop-off detected for block ${currentBlockId}: users=${totalUsersAtBlock}, replies=${totalBlockReplies}`,
    )
    totalDroppedUsers = 0
  }

  // Calculate drop-off rate as a percentage
  const dropOffRate =
    totalUsersAtBlock > 0 ? Math.round((totalDroppedUsers / totalUsersAtBlock) * 100) : 0

  const normalizedDropOffRate = Math.max(0, Math.min(100, dropOffRate))

  return {
    totalDroppedUsers,
    dropOffRate: normalizedDropOffRate,
    totalUsers: totalUsersAtBlock,
  }
}
