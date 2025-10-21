import { FormattedPerDay } from '@/features/analytics/constants'
import { format, startOfYear, differenceInDays, addDays } from 'date-fns'

export function fillMissingYearToDate(data: FormattedPerDay) {
  const now = new Date()
  const startOfCurrentYear = startOfYear(now)
  const totalDays = differenceInDays(now, startOfCurrentYear) + 1

  const allDates = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(startOfCurrentYear, i)
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