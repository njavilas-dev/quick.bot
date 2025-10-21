import { FormattedPerDay } from '@/features/analytics/constants'

export function fillMissingMonthDays(data: FormattedPerDay) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const allDates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      count: 0,
    }
  })

  const dateMap = new Map(data.map((entry) => [entry.date, entry.count]))

  return allDates.map((entry) => ({
    date: entry.date,
    count: dateMap.get(entry.date) ?? 0,
  }))
}
