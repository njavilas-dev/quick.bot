import React, { useState } from 'react'
import { defaultStatFilter, statFilterValues } from '@/features/analytics/constants'
import { StatsCharts } from './StatsCharts'
import { useAnalyticsStats } from '../hooks/useAnalyticsStats'
import { ConversionFilterType } from '../constants'
import { useRouter } from 'next/router'

export const AnalyticsPage = () => {
  const router = useRouter()
  const { botId } = router.query
  const selectedBotId = typeof botId === 'string' ? botId : ''
  const [statFilter, setStatFilter] = useState<(typeof statFilterValues)[number]>(defaultStatFilter)
  const [conversionFilter, setConversionFilter] = useState<ConversionFilterType>('conversionRate')

  const { stats, timeFilter, setTimeFilter, isLoading } = useAnalyticsStats({
    botId: selectedBotId,
    enabled: !!selectedBotId
  })

  return (
    <StatsCharts
      stats={stats}
      isLoading={isLoading}
      timeFilter={timeFilter}
      statFilter={statFilter}
      conversionFilter={conversionFilter}
      onTimeFilterChange={setTimeFilter}
      onStatFilterChange={setStatFilter}
      onConversionFilterChange={setConversionFilter}
    />
  )
}
