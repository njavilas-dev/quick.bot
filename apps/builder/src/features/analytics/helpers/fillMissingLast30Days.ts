import { FormattedPerDay } from '@/features/analytics/constants'
import { format, subDays, startOfDay } from 'date-fns'

export function fillMissingLast30Days(data: FormattedPerDay) {
  const now = new Date()

  const allDates = Array.from({ length: 30 }, (_, i) => {
    const date = startOfDay(subDays(now, 29 - i))
    return {
      date: format(date, 'yyyy-MM-dd'),
      count: 0,
    }
  })

  const dateMap = new Map(data.map((entry) => [entry.date, entry.count]))

  return allDates.map((entry) => ({
    date: entry.date,
    count: dateMap.get(entry.date) ?? 0,
  }))
}