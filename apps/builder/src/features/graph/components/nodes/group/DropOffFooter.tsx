import { Box, HStack, Text, Icon } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@urbiport/icons'
import { useMemo } from 'react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useWorkspace } from '@/hooks/useWorkspace'
import { TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas/features/analytics'
import { computeTotalUsersAtBlock } from '@/features/analytics/helpers/computeTotalUsersAtBlock'
import { getTotalAnswersAtBlock } from '@/features/analytics/helpers/getTotalAnswersAtBlock'
import type { GroupV6 } from '@quickbot.io/schemas'

type Props = {
  group: GroupV6
  totalVisitedEdges: TotalVisitedEdges[]
  totalAnswers: TotalAnswers[]
}

export const DropOffFooter = ({ group, totalVisitedEdges, totalAnswers }: Props) => {
  const { workspace } = useWorkspace()
  const { publishedBot } = useBot()

  const hasAnalytics = workspace?.billingPlan?.allowAnalytics

  // Calculamos drop-off para el último bloque del grupo (donde más se nota)
  const lastBlock = group.blocks.at(-1)

  const dropOffMetrics = useMemo(() => {
    if (!publishedBot || !lastBlock || !hasAnalytics) return null

    const totalUsersAtBlock = computeTotalUsersAtBlock(lastBlock.id, {
      publishedBot,
      totalVisitedEdges,
      totalAnswers,
    })

    const totalBlockReplies = getTotalAnswersAtBlock(lastBlock.id, {
      publishedBot,
      totalAnswers,
    })

    if (totalUsersAtBlock === 0) return null

    const totalDroppedUsers = Math.max(0, totalUsersAtBlock - totalBlockReplies)
    const dropOffRate = Math.round((totalDroppedUsers / totalUsersAtBlock) * 100)

    return {
      totalDroppedUsers,
      dropOffRate,
      totalUsersAtBlock,
    }
  }, [publishedBot, lastBlock, totalVisitedEdges, totalAnswers, hasAnalytics])

  // No mostrar footer si no hay analytics o no hay drop-off significativo
  if (!hasAnalytics || !dropOffMetrics || dropOffMetrics.dropOffRate === 0) {
    return null
  }

  const { totalDroppedUsers, dropOffRate, totalUsersAtBlock } = dropOffMetrics

  return (
    <Box
      bg="red.50"
      borderColor="red.200"
      borderWidth="1px"
      borderRadius="md"
      px={3}
      py={2}
      mt={2}
      fontSize="sm"
      _dark={{
        bg: "red.900",
        borderColor: "red.700",
      }}
    >
      <HStack spacing={2} justify="space-between">
        <HStack spacing={2}>
          <Icon as={ExternalLinkIcon} color="red.500" boxSize={4} />
          <Text color="red.700" _dark={{ color: "red.300" }} fontWeight="medium">
            {dropOffRate}% drop-off
          </Text>
        </HStack>

        <Text color="red.600" _dark={{ color: "red.400" }} fontSize="xs">
          {totalDroppedUsers} of {totalUsersAtBlock} users left
        </Text>
      </HStack>
    </Box>
  )
}