import { formatDailyCounts } from '@/features/analytics/helpers/formatDailyCounts'
import { fillMissingMonthDays } from '@/features/analytics/helpers/fullMissingMonthDay'
import { fillMissingLast30Days } from '@/features/analytics/helpers/fillMissingLast30Days'
import { fillMissingYearToDate } from '@/features/analytics/helpers/fillMissingYearToDate'

export function formatStatsData(
  data: { createdAt: Date; _count: { _all: number } }[],
  fillMissingType: 'none' | 'lastMonth' | 'last30Days' | 'yearToDate',
) {
  const formattedData = formatDailyCounts(data)

  switch (fillMissingType) {
    case 'lastMonth':
      return fillMissingMonthDays(formattedData)
    case 'last30Days':
      return fillMissingLast30Days(formattedData)
    case 'yearToDate':
      return fillMissingYearToDate(formattedData)
    case 'none':
    default:
      return formattedData
  }
}
