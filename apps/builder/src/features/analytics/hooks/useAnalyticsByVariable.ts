import { useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { useToast } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { defaultTimeFilter, timeFilterValues } from '../constants'

interface UseAnalyticsByVariableOptions {
  botId?: string | string[]
  variableId?: string
  timeFilter?: (typeof timeFilterValues)[number]
  enabled?: boolean
}

export const useAnalyticsByVariable = ({
  botId,
  variableId,
  timeFilter = defaultTimeFilter,
  enabled = true,
}: UseAnalyticsByVariableOptions) => {
  const { t } = useTranslate()
  const { showToast } = useToast()

  const botIds = useMemo(() => {
    if (!botId) return []
    if (Array.isArray(botId)) return botId
    return [botId]
  }, [botId])

  const botIdsString = useMemo(() => botIds.join(','), [botIds])

  const timeZone = useMemo(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  )

  const { data, refetch, isLoading } = trpc.analytics.getAnalyticsByVariable.useQuery(
    {
      botIds: botIdsString,
      variableId: variableId ?? '',
      timeFilter,
      timeZone,
    },
    {
      enabled: enabled && botIds.length > 0 && botIdsString.length > 0 && !!variableId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
          status: 'error',
        })
      },
    }
  )

  return {
    analytics: data?.analytics,
    timeZone,
    refetch,
    isLoading,
  }
}
