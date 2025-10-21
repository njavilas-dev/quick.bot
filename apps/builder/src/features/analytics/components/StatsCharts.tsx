import Highcharts from 'highcharts'
import React, { useRef } from 'react'
import { useTranslate } from '@tolgee/react'
import {
  Box,
  Divider,
  Flex,
  HStack,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  UserChatInfoCard,
  BoxCard,
  StackCard,
  H2,
  MoreInfoTooltip,
} from '@urbiport/ui'
import {
  statFilterValues,
  statFilterLabels,
  statFilterDescriptions,
  timeFilterValues,
  conversionFilterLabels,
  type Stats,
  ConversionFilterType,
} from '@/features/analytics/constants'
import { BarChart } from '@/components/highchart/bar-chart'
import { FunnelChart } from '@/components/highchart/funnel-chart'
import { TimeFilterSelect } from './TimeFilterSelect'
import { StatFilterSelect } from './StatFilterSelect'
import { ConversionFilterSelect } from './ConversionFilterSelect'

interface StatsChartsProps {
  stats?: Stats
  isLoading: boolean
  timeFilter: (typeof timeFilterValues)[number]
  statFilter: (typeof statFilterValues)[number]
  conversionFilter: ConversionFilterType
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void
  onStatFilterChange: (statFilter: (typeof statFilterValues)[number]) => void
  onConversionFilterChange: (filter: ConversionFilterType) => void
}

export const StatsCharts: React.FC<StatsChartsProps> = ({
  stats,
  isLoading,
  timeFilter,
  statFilter,
  conversionFilter,
  onTimeFilterChange,
  onStatFilterChange,
  onConversionFilterChange,
}) => {
  const { t } = useTranslate()
  const ref = useRef<HTMLDivElement | null>(null)

  const currentStatMetricLabel = statFilterLabels[statFilter]
  const currentStatMetricDescription = statFilterDescriptions[statFilter]
  const currentConversionMetricLabel = conversionFilterLabels[conversionFilter]

  const getChartColor = (filter: string) => {
    switch (filter) {
      case 'view':
        return '#00CD62' // Green for Views
      case 'started':
        return '#4FD1C7' // Teal for Started
      case 'completed':
        return '#FFB800' // Orange for Completed
      case 'conversionRate':
        return '#9F7AEA' // Purple for Conversion Rate
      case 'viewToStartRate':
        return '#38B2AC' // Dark Teal for View to Start
      case 'completionRate':
        return '#ED8936' // Dark Orange for Completion Rate
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
            day: 'numeric'
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
              year: 'numeric'
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
                case 'conversionRate':
                  return stats.totalViewsPerDay.map((viewItem) => {
                    const startItem = stats.totalStartsPerDay.find(s => s.date === viewItem.date)
                    const completedItem = stats.totalCompletedPerDay.find(c => c.date === viewItem.date)
                    const started = startItem?.count || 0
                    const completed = completedItem?.count || 0
                    const rate = started > 0 ? (completed / started) * 100 : 0
                    return [viewItem.date, Math.round(rate * 100) / 100]
                  })
                case 'viewToStartRate':
                  return stats.totalViewsPerDay.map((viewItem) => {
                    const startItem = stats.totalStartsPerDay.find(s => s.date === viewItem.date)
                    const views = viewItem.count
                    const started = startItem?.count || 0
                    const rate = views > 0 ? (started / views) * 100 : 0
                    return [viewItem.date, Math.round(rate * 100) / 100]
                  })
                case 'completionRate':
                  return stats.totalViewsPerDay.map((viewItem) => {
                    const completedItem = stats.totalCompletedPerDay.find(c => c.date === viewItem.date)
                    const views = viewItem.count
                    const completed = completedItem?.count || 0
                    const rate = views > 0 ? (completed / views) * 100 : 0
                    return [viewItem.date, Math.round(rate * 100) / 100]
                  })
                case 'dropOffRate':
                  return stats.totalViewsPerDay.map((viewItem) => {
                    const startItem = stats.totalStartsPerDay.find(s => s.date === viewItem.date)
                    const completedItem = stats.totalCompletedPerDay.find(c => c.date === viewItem.date)
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

  const funnelData = !isLoading && stats ? [
    { name: 'Views', value: stats.totalViews },
    { name: 'Started', value: stats.totalStarts },
    { name: 'Completed', value: stats.totalCompleted },
  ] : [
    { name: 'Views', value: 0 },
    { name: 'Started', value: 0 },
    { name: 'Completed', value: 0 },
  ]

  return (
    <Stack spacing={6}>
      <Stack spacing={4}>
        <StackCard bg="white">
          <UserChatInfoCard
            title={t('dashboard.label.userChat.totalViews')}
            content={!isLoading && stats ? stats.totalViews : 0}
            loading={isLoading}
            conversionPercentage={!isLoading && stats ? `${stats.totalBots} bot${stats.totalBots !== 1 ? 's' : ''}` : '0 bots'}
          />
          <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
          <UserChatInfoCard
            title={t('dashboard.label.userChat.totalStarted')}
            content={!isLoading && stats ? stats.totalStarts : 0}
            loading={isLoading}
            conversionPercentage={!isLoading && stats ? `${stats.viewToStartRate}% views rate` : '0%'}
          />
          <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
          <UserChatInfoCard
            title={t('dashboard.label.userChat.totalCompleted')}
            content={!isLoading && stats ? stats.totalCompleted : 0}
            loading={isLoading}
            conversionPercentage={!isLoading && stats ? `${stats.conversionRate}% conversion rate` : '0%'}
          />
        </StackCard>
      </Stack>

      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between">
          <H2 as={Flex} alignItems="center" gap={2}>
            {currentStatMetricLabel}
            <MoreInfoTooltip>{currentStatMetricDescription}</MoreInfoTooltip>
          </H2>
          <Box ref={ref}>
            <TimeFilterSelect
              value={timeFilter}
              onChange={onTimeFilterChange}
            />
          </Box>
        </Stack>

        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={2}>
              <Text fontSize="sm" color="text.light">
                Bars: {currentStatMetricLabel} | Line: {currentConversionMetricLabel}
              </Text>
            </Stack>
            <HStack spacing={4}>
              <StatFilterSelect
                value={statFilter}
                onChange={onStatFilterChange}
              />
              <ConversionFilterSelect
                value={conversionFilter}
                onChange={onConversionFilterChange}
              />
            </HStack>
          </Stack>
          <BoxCard>
            {stats ? <BarChart options={combinedChartOptions} /> : <Skeleton height="300px" />}
          </BoxCard>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <H2>Conversion Funnel</H2>
        <BoxCard>
          {stats ? <FunnelChart data={funnelData} /> : <Skeleton height="300px" />}
        </BoxCard>
      </Stack>
    </Stack>
  )
}
