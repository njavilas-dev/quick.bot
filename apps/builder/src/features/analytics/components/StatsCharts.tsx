import Highcharts from 'highcharts'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import {
  Divider,
  Flex,
  HStack,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import {
  UserChatInfoCard,
  BoxCard,
  StackCard,
  MoreInfoTooltip,
  H3,
} from '@urbiport/ui'
import {
  statFilterValues,
  statFilterLabels,
  statFilterDescriptions,
  timeFilterValues,
  conversionFilterLabels,
  type Stats,
  ConversionFilterType,
  timeFilterLabels,
  type VariableAnalytics,
} from '@/features/analytics/constants'
import { BarChart } from '@/components/highchart/bar-chart'
import { FunnelChart } from '@/components/highchart/funnel-chart'
import { StatFilterSelect } from './StatFilterSelect'
import { ConversionFilterSelect } from './ConversionFilterSelect'
import { Variable } from '@quickbot.io/schemas'

interface StatsChartsProps {
  stats?: Stats
  isLoading: boolean
  timeFilter: (typeof timeFilterValues)[number]
  statFilter: (typeof statFilterValues)[number] | string
  conversionFilter: ConversionFilterType | string
  onStatFilterChange: (statFilter: (typeof statFilterValues)[number] | string) => void
  onConversionFilterChange: (filter: ConversionFilterType | string) => void
  variables: Variable[]
  selectedVariableId?: string
  variableAnalytics?: VariableAnalytics
  isVariableLoading: boolean
}

export const StatsCharts: React.FC<StatsChartsProps> = ({
  stats,
  isLoading,
  timeFilter,
  statFilter,
  conversionFilter,
  onStatFilterChange,
  onConversionFilterChange,
  variables,
  selectedVariableId,
  variableAnalytics,
  isVariableLoading,
}) => {
  const { t } = useTranslate()

  const isVariableStatSelected = typeof statFilter === 'string' && statFilter.startsWith('variable:')
  const isVariableConversionSelected = typeof conversionFilter === 'string' && conversionFilter.startsWith('variable:')
  const currentStatMetricLabel = isVariableStatSelected && variableAnalytics
    ? variableAnalytics.variableName
    : statFilterLabels[statFilter as (typeof statFilterValues)[number]]
  const currentStatMetricDescription = isVariableStatSelected
    ? 'Users who set a value for this variable'
    : statFilterDescriptions[statFilter as (typeof statFilterValues)[number]]
  const currentConversionMetricLabel = isVariableConversionSelected
    ? `Collection Rate: ${variableAnalytics?.variableName}`
    : conversionFilterLabels[conversionFilter as ConversionFilterType]

  // Find the variable from the variables array to get the name even during loading
  const selectedVariableFromList = selectedVariableId
    ? variables.find(v => v.id === selectedVariableId)
    : undefined

  const selectedVariable = selectedVariableId && selectedVariableFromList
    ? {
      id: selectedVariableId,
      name: variableAnalytics?.variableName || selectedVariableFromList.name
    }
    : undefined

  const getChartColor = (filter: string, isConversion: boolean = false) => {

    if (filter.startsWith('variable:')) {
      if (isConversion) {
        return 'var(--chakra-colors-purple-600)'
      } else {
        return 'var(--chakra-colors-purple-300)'
      }
    }
    switch (filter) {
      case 'view':
        return 'var(--chakra-colors-gray-300)'
      case 'started':
        return 'var(--chakra-colors-green-400)'
      case 'completed':
        return 'var(--chakra-colors-green-600)'
      case 'viewToStartRate':
        return 'var(--chakra-colors-green-500)'
      case 'completionRate':
        return 'var(--chakra-colors-green-600)'
      case 'dropOffRate':
        return 'var(--chakra-colors-red-500)'
      default:
        return 'var(--chakra-colors-green-500)'
    }
  }

  // Check if we need to show average axis (for numeric variables)
  const showAverageAxis = isVariableStatSelected && variableAnalytics?.isNumeric && variableAnalytics?.averageValue !== undefined

  const combinedChartOptions: Highcharts.Options = {
    colors: [
      getChartColor(statFilter, false),
      getChartColor(conversionFilter, true),
      showAverageAxis ? '#FF6B6B' : undefined, // Red for average line
    ].filter(Boolean) as string[],
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
      ...(showAverageAxis ? [{
        // Third Y-axis for average value
        min: 0,
        title: {
          text: 'Average Value',
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
        opposite: true,
        top: '66%',
        height: '33%',
        offset: 0,
      }] : []),
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
          isVariableStatSelected && !isVariableLoading && variableAnalytics
            ? variableAnalytics.collectionRatePerDay.map((item: { date: string; usersWithValue: number }) => [item.date, item.usersWithValue])
            : !isLoading && stats
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
        name: typeof conversionFilter === 'string' && conversionFilter.startsWith('variable:') && variableAnalytics
          ? `Collection Rate: ${variableAnalytics.variableName}`
          : currentConversionMetricLabel,
        yAxis: 1,
        data:
          typeof conversionFilter === 'string' && conversionFilter.startsWith('variable:') && !isVariableLoading && variableAnalytics
            ? variableAnalytics.collectionRatePerDay.map((item: { date: string; collectionRate: number }) => [item.date, item.collectionRate])
            : !isLoading && stats
              ? (() => {
                switch (conversionFilter) {
                  case 'completionRate':
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
      ...(showAverageAxis && !isVariableLoading && variableAnalytics ? [{
        type: 'line' as const,
        name: `Average: ${variableAnalytics.variableName}`,
        yAxis: 2,
        data: variableAnalytics.collectionRatePerDay
          .filter((item: { averageValue?: number }) => item.averageValue !== undefined)
          .map((item: { date: string; averageValue?: number }) => [item.date, item.averageValue]),
        dataLabels: {
          enabled: false,
        },
        marker: {
          enabled: true,
          radius: 4,
          symbol: 'diamond',
        },
        lineWidth: 2,
        dashStyle: 'ShortDash' as const,
      }] : []),
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

  const timeFilterLabel = timeFilterLabels[timeFilter]

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <StackCard bg="white">
          <UserChatInfoCard
            title={t('dashboard.label.userChat.totalViews')}
            content={!isLoading && stats ? stats.totalViews : 0}
            loading={isLoading}
            conversionPercentage={!isLoading && stats ? `During ${timeFilterLabel.toLowerCase()}` : 'Total sessions'}
            tooltip={`Total number of views during ${timeFilterLabel.toLowerCase()}`}
          />
          <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
          <UserChatInfoCard
            title={t('dashboard.label.userChat.totalStarted')}
            content={!isLoading && stats ? stats.totalStarts : 0}
            loading={isLoading}
            conversionPercentage={!isLoading && stats ? `${stats.viewToStartRate}% started rate` : '0%'}
            tooltip={`Total number of started sessions during ${timeFilterLabel.toLowerCase()}`}
          />
          <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
          <UserChatInfoCard
            title={t('dashboard.label.userChat.totalCompleted')}
            content={!isLoading && stats ? stats.totalCompleted : 0}
            loading={isLoading}
            conversionPercentage={!isLoading && stats ? `${stats.completionRate}% completion rate` : '0%'}
            tooltip={`Percentage of completed sessions during ${timeFilterLabel.toLowerCase()}`}
          />
          {selectedVariableId && variableAnalytics && (
            <>
              <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
              <UserChatInfoCard
                title="Collection Rate"
                content={`${variableAnalytics.collectionRate.toFixed(1)}%`}
                loading={isVariableLoading}
                conversionPercentage={`${variableAnalytics.usersWithValue} of ${variableAnalytics.totalStarts} sessions`}
                tooltip="Percentage of started sessions that set a value for this variable during the selected period"
              />
            </>
          )}
          {selectedVariableId && variableAnalytics?.isNumeric && variableAnalytics?.averageValue !== undefined && (
            <>
              <Divider orientation="vertical" borderColor="divider.lighter" height="auto" />
              <UserChatInfoCard
                title="Average Value"
                content={variableAnalytics.averageValue.toFixed(2)}
                loading={isVariableLoading}
                conversionPercentage={`Across ${variableAnalytics.usersWithValue} sessions`}
                tooltip="Average numeric value for this variable across all sessions that set a value during the selected period"
              />
            </>
          )}
        </StackCard>
      </Stack>

      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <H3 as={Flex} alignItems="center" gap={2}>
            {currentStatMetricLabel}
            <MoreInfoTooltip>{currentStatMetricDescription}</MoreInfoTooltip>
          </H3>
          <HStack spacing={4}>
            <StatFilterSelect
              value={statFilter}
              onChange={onStatFilterChange}
              variableOption={selectedVariable}
              isLoading={isVariableLoading}
            />
            <ConversionFilterSelect
              value={conversionFilter}
              onChange={onConversionFilterChange}
              variableOption={selectedVariable}
              isLoading={isVariableLoading}
            />
          </HStack>
        </Stack>
        <BoxCard>
          {stats ? <BarChart options={combinedChartOptions} /> : <Skeleton height="300px" />}
        </BoxCard>
      </Stack>

      <Stack spacing={3}>
        <H3>Conversion funnel</H3>
        <BoxCard>
          {stats ? <FunnelChart data={funnelData} /> : <Skeleton height="300px" />}
        </BoxCard>
      </Stack>
    </Stack>
  )
}
