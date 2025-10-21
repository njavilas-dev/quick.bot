import { Flex, Spinner } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { Edge, GroupV6, TotalAnswers, TotalVisitedEdges } from '@quickbot.io/schemas'
import React, { useMemo } from 'react'
import { Graph } from '@/features/graph/components/Graph'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { trpc } from '@/lib/trpc'
import { isDefined } from '@quickbot.io/lib'
import { FlowEventsCoordinatesProvider } from '@/features/graph/providers/FlowEventsCoordinatesProvider'
import { blockHasItems, isInputBlock } from '@quickbot.io/schemas/helpers'
import { GraphZoomProvider } from '@/features/graph/providers/GraphZoomProvider'
import { useRouter } from 'next/router'
import { useAnalyticsStats } from '../hooks/useAnalyticsStats'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const AnalyticsFlowPage = () => {
  const router = useRouter()
  const { botId } = router.query
  const selectedBotId = typeof botId === 'string' ? botId : ''

  const { stats, timeFilter } = useAnalyticsStats({
    botId: selectedBotId,
    enabled: !!selectedBotId
  })

  const { publishedBot } = useBot()
  const { data } = trpc.analytics.getAnalyticsFlow.useQuery(
    {
      botId: selectedBotId,
      timeFilter,
      timeZone,
    },
    {
      enabled: isDefined(publishedBot),
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const totalVisitedEdges = useMemo(() => {
    if (
      !publishedBot?.edges ||
      !publishedBot.groups ||
      !publishedBot.events ||
      !data?.totalAnswers ||
      !stats?.totalViews
    )
      return
    const firstEdgeId = publishedBot.events[0].outgoingEdgeId
    if (!firstEdgeId) return
    return populateEdgesWithVisitData({
      edgeId: firstEdgeId,
      edges: publishedBot.edges,
      groups: publishedBot.groups,
      currentTotalUsers: stats.totalViews,
      totalVisitedEdges: data.offDefaultPathVisitedEdges
        ? [...data.offDefaultPathVisitedEdges]
        : [],
      totalAnswers: data.totalAnswers,
      edgeVisitHistory: [],
    })
  }, [
    data?.offDefaultPathVisitedEdges,
    data?.totalAnswers,
    publishedBot?.edges,
    publishedBot?.groups,
    publishedBot?.events,
    stats?.totalViews,
  ])

  if (!publishedBot || !stats) {
    return (
      <Flex justify="center" align="center" boxSize="full" bgColor="rgba(255, 255, 255, 0.5)">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Flex
      flex="1"
      h="full"
      minH="0"
      border="1px solid"
      borderColor="divider.light"
      borderRadius="md"
      overflow="hidden"
      position="relative"
    >
      <GraphProvider isReadOnly isAnalytics>
        <FlowEventsCoordinatesProvider events={publishedBot?.events}>
          <GraphZoomProvider>
            <Graph
              flex="1"
              bot={publishedBot}
              totalAnswers={data?.totalAnswers}
              totalVisitedEdges={totalVisitedEdges}
            />
          </GraphZoomProvider>
        </FlowEventsCoordinatesProvider>
      </GraphProvider>
    </Flex>
  )
}

const populateEdgesWithVisitData = ({
  edgeId,
  edges,
  groups,
  currentTotalUsers,
  totalVisitedEdges,
  totalAnswers,
  edgeVisitHistory,
}: {
  edgeId: string
  edges: Edge[]
  groups: GroupV6[]
  currentTotalUsers: number
  totalVisitedEdges: TotalVisitedEdges[]
  totalAnswers: TotalAnswers[]
  edgeVisitHistory: string[]
}): TotalVisitedEdges[] => {
  if (edgeVisitHistory.find((e) => e === edgeId)) return totalVisitedEdges
  totalVisitedEdges.push({
    edgeId,
    total: currentTotalUsers,
  })
  edgeVisitHistory.push(edgeId)
  const edge = edges.find((edge) => edge.id === edgeId)
  if (!edge) return totalVisitedEdges
  const group = groups.find((group) => edge?.to.groupId === group.id)
  if (!group) return totalVisitedEdges
  for (const block of edge.to.blockId
    ? group.blocks.slice(group.blocks.findIndex((b) => b.id === edge.to.blockId))
    : group.blocks) {
    if (blockHasItems(block)) {
      for (const item of block.items) {
        if (item.outgoingEdgeId) {
          totalVisitedEdges = populateEdgesWithVisitData({
            edgeId: item.outgoingEdgeId,
            edges,
            groups,
            currentTotalUsers:
              totalVisitedEdges.find((tve) => tve.edgeId === item.outgoingEdgeId)?.total ?? 0,
            totalVisitedEdges,
            totalAnswers,
            edgeVisitHistory,
          })
        }
      }
    }
    if (block.outgoingEdgeId) {
      const totalUsers = isInputBlock(block)
        ? totalAnswers.find((a) => a.blockId === block.id)?.total
        : currentTotalUsers
      totalVisitedEdges = populateEdgesWithVisitData({
        edgeId: block.outgoingEdgeId,
        edges,
        groups,
        currentTotalUsers: totalUsers ?? 0,
        totalVisitedEdges,
        totalAnswers,
        edgeVisitHistory,
      })
    }
  }

  return totalVisitedEdges
}
