import { useMemo, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useToast } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { defaultTimeFilter, timeFilterValues } from '../constants'

interface UseAnalyticsStatsOptions {
  botId?: string | string[]
  initialTimeFilter?: (typeof timeFilterValues)[number]
  enabled?: boolean
}

export const useAnalyticsStats = ({
  botId,
  initialTimeFilter = defaultTimeFilter,
  enabled = true,
}: UseAnalyticsStatsOptions) => {
  const { t } = useTranslate()
  const { showToast } = useToast()
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter)

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

  const { data: { stats } = {}, refetch, isLoading } = trpc.analytics.getAnalytics.useQuery(
    { botIds: botIdsString, timeFilter, timeZone },
    {
      enabled: enabled && botIds.length > 0 && botIdsString.length > 0,
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
    stats,
    timeFilter,
    setTimeFilter,
    timeZone,
    refetch,
    isLoading,
  }
}
