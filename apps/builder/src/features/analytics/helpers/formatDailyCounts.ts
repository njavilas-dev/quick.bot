import { FormattedPerDay } from '@/features/analytics/constants'

export function formatDailyCounts(
  data: { createdAt: Date; _count: { _all: number } }[],
): FormattedPerDay {
  return Object.values(
    data.reduce((acc, result) => {
      const dateKey = result.createdAt.toISOString().split('T')[0]
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, count: 0 }
      acc[dateKey].count += result._count._all
      return acc
    }, {} as Record<string, { date: string; count: number }>),
  )
}
