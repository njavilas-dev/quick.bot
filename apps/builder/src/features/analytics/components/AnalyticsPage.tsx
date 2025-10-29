import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Stack, HStack, Flex } from '@chakra-ui/react'
import { H3, BoxCard } from '@urbiport/ui'
import { FilterIcon } from '@urbiport/icons'
import { useBot } from '@/features/editor/providers/BotProvider'
import { StatsCharts } from './StatsCharts'
import { useAnalyticsStats } from '../hooks/useAnalyticsStats'
import { useAnalyticsByVariable } from '../hooks/useAnalyticsByVariable'
import { ConversionFilterType, StatFilterType } from '../constants'
import { VariableConversionTable } from './VariableConversionTable'
import { VariableFilterSelect } from './VariableFilterSelect'
import { TimeFilterSelect } from './TimeFilterSelect'

export const AnalyticsPage = () => {
  const router = useRouter()
  const { botId } = router.query
  const selectedBotId = typeof botId === 'string' ? botId : ''
  const { publishedBot } = useBot()
  const [statFilter, setStatFilter] = useState<StatFilterType | string>('view')
  const [conversionFilter, setConversionFilter] = useState<ConversionFilterType | string>('completionRate')
  const [selectedVariableId, setSelectedVariableId] = useState<string>()

  // Auto-select variable metrics when a variable is chosen
  const handleVariableChange = (variableId: string) => {
    setSelectedVariableId(variableId)
    if (variableId) {
      // Auto-select the variable in both filters
      setStatFilter(`variable:${variableId}`)
      setConversionFilter(`variable:${variableId}`)
    }
  }

  const { stats, timeFilter, setTimeFilter, isLoading } = useAnalyticsStats({
    botId: selectedBotId,
    enabled: !!selectedBotId
  })

  // Check if variable is actually being used in filters
  const isVariableUsedInFilters =
    (typeof statFilter === 'string' && statFilter.startsWith('variable:')) ||
    (typeof conversionFilter === 'string' && conversionFilter.startsWith('variable:'))

  const { analytics: variableAnalytics, isLoading: isVariableLoading } = useAnalyticsByVariable({
    botId: selectedBotId,
    variableId: selectedVariableId,
    timeFilter: timeFilter,
    enabled: !!selectedBotId && !!selectedVariableId && isVariableUsedInFilters
  })

  const botVariables = publishedBot?.variables || []

  // If no botId is present, show nothing and wait for redirect
  if (!selectedBotId) {
    return null
  }

  return (
    <Stack spacing={6}>
      <BoxCard>
        <Flex justifyContent="space-between" alignItems="center">
          <FilterIcon size="24" color="text.light" />
          <HStack spacing={3}>
            <VariableFilterSelect
              variables={botVariables}
              value={selectedVariableId}
              onChange={handleVariableChange}
            />
            <TimeFilterSelect
              value={timeFilter}
              onChange={setTimeFilter}
            />
          </HStack>
        </Flex>
      </BoxCard>

      <StatsCharts
        stats={stats}
        isLoading={isLoading}
        timeFilter={timeFilter}
        statFilter={statFilter}
        conversionFilter={conversionFilter}
        onStatFilterChange={setStatFilter}
        onConversionFilterChange={setConversionFilter}
        variables={botVariables}
        selectedVariableId={selectedVariableId}
        variableAnalytics={variableAnalytics}
        isVariableLoading={isVariableLoading}
      />

      {selectedVariableId && (
        <Stack spacing={3}>
          <H3>
            {`Conversion metrics: ${variableAnalytics?.variableName}`}
          </H3>
          <VariableConversionTable
            analytics={variableAnalytics}
            isLoading={isVariableLoading}
            timeFilter={timeFilter}
          />
        </Stack>
      )}
    </Stack>
  )
}
