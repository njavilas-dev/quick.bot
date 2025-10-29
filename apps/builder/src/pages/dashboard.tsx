import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsFunnel from 'highcharts/modules/funnel'
import { GetServerSidePropsContext } from 'next'
import React, { type ReactNode, useState, useMemo } from 'react'
import { useTranslate } from '@tolgee/react'
import { useBots } from '@/hooks/useBots'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Box, Button, Divider, Flex, HStack, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import { RobotIcon, BookIcon, CheckCircleIcon } from '@urbiport/icons'
import {
  UserChatInfoCard,
  BoxCard,
  StackCard,
  H2,
  H3,
  useToast,
  MoreInfoTooltip,
} from '@urbiport/ui'
import {
  statFilterLabels,
  statFilterDescriptions,
  conversionFilterLabels,
  ConversionFilterType,
  StatFilterType,
} from '@/features/analytics/constants'
import { useAnalyticsStats } from '@/features/analytics/hooks/useAnalyticsStats'
import { TimeFilterSelect } from '@/features/analytics/components/TimeFilterSelect'
import { StatFilterSelect } from '@/features/analytics/components/StatFilterSelect'
import { ConversionFilterSelect } from '@/features/analytics/components/ConversionFilterSelect'
import type { NextPageWithLayout } from '@/pages/_app'
import { BarChart } from '@/components/highchart/bar-chart'
import { FunnelChart } from '@/components/highchart/funnel-chart'
import Link from 'next/link'
import { AccountLayout } from '@/components/layouts/AccountLayout'

// Initialize Highcharts modules
if (typeof Highcharts === 'object') {
  HighchartsMore(Highcharts)
  HighchartsFunnel(Highcharts)
}

const Page: NextPageWithLayout = () => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const { workspace } = useWorkspace()
  const [statFilter, setStatFilter] = useState<StatFilterType | string>('view')
  const [conversionFilter, setConversionFilter] = useState<ConversionFilterType | string>(
    'completionRate',
  )

  const { bots, isLoading: isBotsLoading } = useBots({
    workspaceId: workspace?.id ?? '',
    folderId: 'root',
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
        status: 'error',
      })
    },
  })

  const botIds = useMemo(() => bots?.map((bot) => bot.id) ?? [], [bots])

  const {
    stats,
    timeFilter,
    setTimeFilter,
    isLoading: isStatsLoading,
  } = useAnalyticsStats({
    botId: botIds,
    enabled: botIds.length > 0,
  })

  const isLoading = isBotsLoading || isStatsLoading

  const currentStatMetricLabel = statFilterLabels[statFilter as StatFilterType]
  const currentStatMetricDescription = statFilterDescriptions[statFilter as StatFilterType]
  const currentConversionMetricLabel =
    conversionFilterLabels[conversionFilter as ConversionFilterType]

  const getChartColor = (filter: string) => {
    switch (filter) {
      case 'view':
        return '#00CD62' // Green for Views
      case 'started':
        return '#4FD1C7' // Teal for Started
      case 'completed':
        return '#FFB800' // Orange for Completed
      case 'completionRate':
        return '#9F7AEA' // Purple for Completion Rate
      case 'viewToStartRate':
        return '#38B2AC' // Dark Teal for View to Start
      case 'dropOffRate':
        return '#E53E3E' // Red for Drop-off Rate
      default:
        return '#00CD62'
    }
  }

  const combinedChartOptions: Highcharts.Options = {
    colors: [getChartColor(statFilter), getChartColor(conversionFilter)],
    chart: {
      type: 'column',
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'category',
      labels: {
        step: stats ? Math.ceil(stats.totalViewsPerDay?.length / 6) : 1,
        rotation: 0,
        formatter: function () {
          return new Date(this.value).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          })
        },
        style: {
          fontSize: '12px',
          fontFamily: 'inherit',
          color: 'var(--chakra-colors-text-light)',
        },
      },
      lineColor: 'var(--chakra-colors-text-light)',
    },
    yAxis: [
      {
        // Primary Y-axis for total metrics
        min: 0,
        title: {
          text: currentStatMetricLabel,
          style: {
            color: 'var(--chakra-colors-text-light)',
          },
        },
        labels: {
          format: '{value}',
          style: {
            color: 'var(--chakra-colors-text-light)',
          },
        },
      },
      {
        // Secondary Y-axis for conversion metrics
        min: 0,
        max: 100,
        title: {
          text: `${currentConversionMetricLabel} (%)`,
          style: {
            color: 'var(--chakra-colors-text-light)',
          },
        },
        labels: {
          format: '{value}%',
          style: {
            color: 'var(--chakra-colors-text-light)',
          },
        },
        opposite: true,
      },
    ],
    legend: {
      enabled: true,
      itemStyle: {
        color: 'var(--chakra-colors-text-light)',
      },
    },
    tooltip: {
      formatter: function () {
        const dataPoint = this.point
        const dateStr = dataPoint.name || dataPoint.category

        let date
        try {
          if (dateStr && typeof dateStr === 'string') {
            date = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          } else {
            date = 'Date not available'
          }
        } catch (error) {
          console.error('Date parsing error:', error)
          date = 'Date not available'
        }

        const isPercentage = this.series.name.includes('Rate') || this.series.name.includes('%')
        const value = isPercentage ? `${this.y}%` : this.y

        return `
          <div style="text-align: center;">
            <b>${date}</b><br/>
            <span style="color: ${this.series.color}; font-size: 16px; font-weight: bold;">
              ${value} ${this.series.name}
            </span>
          </div>
        `
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      shadow: true,
    },
    series: [
      {
        type: 'column',
        name: currentStatMetricLabel,
        yAxis: 0,
        data:
          !isLoading && stats
            ? (() => {
                switch (statFilter) {
                  case 'view':
                    return stats.totalViewsPerDay.map((item) => [item.date, item.count])
                  case 'started':
                    return stats.totalStartsPerDay.map((item) => [item.date, item.count])
                  case 'completed':
                    return stats.totalCompletedPerDay.map((item) => [item.date, item.count])
                  default:
                    return stats.totalViewsPerDay.map((item) => [item.date, item.count])
                }
              })()
            : [],
        dataLabels: {
          enabled: false,
        },
      },
      {
        type: 'line',
        name: currentConversionMetricLabel,
        yAxis: 1,
        data:
          !isLoading && stats
            ? (() => {
                switch (conversionFilter) {
                  case 'completionRate':
                    return stats.totalViewsPerDay.map((viewItem) => {
                      const startItem = stats.totalStartsPerDay.find(
                        (s) => s.date === viewItem.date,
                      )
                      const completedItem = stats.totalCompletedPerDay.find(
                        (c) => c.date === viewItem.date,
                      )
                      const started = startItem?.count || 0
                      const completed = completedItem?.count || 0
                      const rate = started > 0 ? (completed / started) * 100 : 0
                      return [viewItem.date, Math.round(rate * 100) / 100]
                    })
                  case 'viewToStartRate':
                    return stats.totalViewsPerDay.map((viewItem) => {
                      const startItem = stats.totalStartsPerDay.find(
                        (s) => s.date === viewItem.date,
                      )
                      const views = viewItem.count
                      const started = startItem?.count || 0
                      const rate = views > 0 ? (started / views) * 100 : 0
                      return [viewItem.date, Math.round(rate * 100) / 100]
                    })
                  case 'dropOffRate':
                    return stats.totalViewsPerDay.map((viewItem) => {
                      const startItem = stats.totalStartsPerDay.find(
                        (s) => s.date === viewItem.date,
                      )
                      const completedItem = stats.totalCompletedPerDay.find(
                        (c) => c.date === viewItem.date,
                      )
                      const started = startItem?.count || 0
                      const completed = completedItem?.count || 0
                      const rate = started > 0 ? ((started - completed) / started) * 100 : 0
                      return [viewItem.date, Math.round(rate * 100) / 100]
                    })
                  default:
                    return stats.totalViewsPerDay.map((item) => [item.date, 0])
                }
              })()
            : [],
        dataLabels: {
          enabled: false,
        },
        marker: {
          enabled: true,
          radius: 4,
        },
        lineWidth: 2,
      },
    ],
  } as Highcharts.Options

  const funnelData =
    !isLoading && stats
      ? [
          { name: 'Views', value: stats.totalViews },
          { name: 'Started', value: stats.totalStarts },
          { name: 'Completed', value: stats.totalCompleted },
        ]
      : [
          { name: 'Views', value: 0 },
          { name: 'Started', value: 0 },
          { name: 'Completed', value: 0 },
        ]

  return (
    <BoxCard>
      <Flex gap={6}>
        <Box position="relative" width="calc(100% - 346px)">
          <Stack spacing={6}>
            <Stack spacing={4}>
              <H2>Stats</H2>

              <StackCard>
                <UserChatInfoCard
                  title={t('dashboard.label.userChat.totalViews')}
                  content={!isLoading && stats ? stats.totalViews : 0}
                  loading={isLoading}
                  conversionPercentage={!isLoading && stats ? `${stats.totalBots} bots` : 0}
                />
                <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
                <UserChatInfoCard
                  title={t('dashboard.label.userChat.totalStarted')}
                  content={!isLoading && stats ? stats.totalStarts : 0}
                  loading={isLoading}
                  conversionPercentage={
                    !isLoading && stats ? `${stats.viewToStartRate}% started rate` : '0%'
                  }
                />
                <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
                <UserChatInfoCard
                  title={t('dashboard.label.userChat.totalCompleted')}
                  content={!isLoading && stats ? stats.totalCompleted : 0}
                  loading={isLoading}
                  conversionPercentage={
                    !isLoading && stats ? `${stats.completionRate}% completion rate` : '0%'
                  }
                />
              </StackCard>
            </Stack>

            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between">
                <H2 as={Flex} alignItems="center" gap={2}>
                  {currentStatMetricLabel}
                  <MoreInfoTooltip>{currentStatMetricDescription}</MoreInfoTooltip>
                </H2>
                <TimeFilterSelect value={timeFilter} onChange={setTimeFilter} />
              </Stack>

              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={2}>
                    <Text fontSize="sm" color="text.light">
                      Bars: {currentStatMetricLabel} | Line: {currentConversionMetricLabel}
                    </Text>
                  </Stack>
                  <HStack spacing={4}>
                    <StatFilterSelect value={statFilter} onChange={setStatFilter} />
                    <ConversionFilterSelect
                      value={conversionFilter}
                      onChange={setConversionFilter}
                    />
                  </HStack>
                </Stack>
                <BoxCard>
                  {stats ? (
                    <BarChart options={combinedChartOptions} />
                  ) : (
                    <Skeleton height="300px" />
                  )}
                </BoxCard>
              </Stack>
            </Stack>

            <Stack spacing={3}>
              <H2>Conversion funnel</H2>
              <BoxCard>
                {stats ? <FunnelChart data={funnelData} /> : <Skeleton height="300px" />}
              </BoxCard>
            </Stack>
          </Stack>
        </Box>

        <Stack spacing={4} width="322px" flex="1">
          <H2>Quick Actions</H2>
          <Stack spacing={4}>
            <Stack
              spacing={2}
              p={4}
              alignItems="flex-start"
              border="1px solid"
              borderColor="divider.lighter"
              borderRadius="md"
            >
              <Box
                bg="green.400"
                borderRadius="full"
                p={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={RobotIcon} boxSize={6} color="white" />
              </Box>
              <H3>Builder</H3>
              <Text color="text.light">
                Create your bot to start increate your user conversion rate.
              </Text>
              <Button as={Link} size="sm" variant="outline:primary" href="/bots">
                CREATE BOT
              </Button>
            </Stack>
            <Stack
              spacing={2}
              p={4}
              alignItems="flex-start"
              border="1px solid"
              borderColor="divider.lighter"
              borderRadius="md"
            >
              <Box
                bg="green.400"
                borderRadius="full"
                p={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={BookIcon} boxSize={6} color="white" />
              </Box>
              <H3>Documentation</H3>
              <Text color="text.light">
                Learn how to use Quick.bot with our comprehensive guides
              </Text>
              <Button
                as={Link}
                size="sm"
                variant="outline:primary"
                href="https://docs.quick.bot/"
                target="_blank"
                rel="noopener noreferrer"
              >
                VIEW DOCS
              </Button>
            </Stack>
            <Stack
              spacing={2}
              p={4}
              alignItems="flex-start"
              border="1px solid"
              borderColor="divider.lighter"
              borderRadius="md"
            >
              <Box
                bg="green.400"
                borderRadius="full"
                p={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={CheckCircleIcon} boxSize={6} color="white" />
              </Box>
              <H3>Status</H3>
              <Text color="text.light">Check our system status and service availability.</Text>
              <Button
                as={Link}
                size="sm"
                variant="outline:primary"
                href="https://status.quick.bot/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CHECK STATUS
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Flex>
    </BoxCard>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const callbackUrl = context.query.callbackUrl?.toString()
  const redirectPath =
    context.query.redirectPath?.toString() ??
    (callbackUrl ? new URL(callbackUrl).searchParams.get('redirectPath') : undefined)
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}
