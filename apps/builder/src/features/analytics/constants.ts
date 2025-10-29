import { z } from '@quickbot.io/schemas/zod'

export const timeFilterValues = [
  'today',
  'last7Days',
  'last30Days',
  'monthToDate',
  'lastMonth',
  'yearToDate',
  'allTime',
] as const

export const statFilterValues = ['view', 'started', 'completed'] as const

export const timeFilterLabels: Record<(typeof timeFilterValues)[number], string> = {
  today: 'Today',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  monthToDate: 'Month to date',
  lastMonth: 'Last month',
  yearToDate: 'Year to date',
  allTime: 'All time',
}

export const defaultTimeFilter = 'last30Days' as const

export type StatFilterType = (typeof statFilterValues)[number]

export const statFilterLabels: Record<StatFilterType, string> = {
  view: 'Views',
  started: 'Started',
  completed: 'Completed',
}

export const statFilterDescriptions: Record<StatFilterType, string> = {
  view: 'Times the chatbot was seen.',
  started: 'Interactions started with the chatbot.',
  completed: 'Interactions completed with the chatbot.',
}

export const conversionFilterValues = [
  'viewToStartRate',
  'completionRate',
  'dropOffRate',
] as const

export type ConversionFilterType = (typeof conversionFilterValues)[number]

export const conversionFilterLabels: Record<ConversionFilterType, string> = {
  viewToStartRate: 'Started Rate',
  completionRate: 'Completion Rate',
  dropOffRate: 'Drop-off Rate',
}

export const conversionFilterDescriptions: Record<ConversionFilterType, string> = {
  viewToStartRate: 'Percentage of viewers who started (Started/Views)',
  completionRate: 'Percentage of started users who completed (Completed/Started)',
  dropOffRate: 'Percentage of users who started but did not complete',
}

export const formattedPerDay = z.array(
  z.object({
    date: z.string(),
    count: z.number(),
  }),
)

export const statsSchema = z.object({
  totalBots: z.number(),
  totalViews: z.number(),
  totalStarts: z.number(),
  totalCompleted: z.number(),
  totalViewsPerDay: formattedPerDay,
  totalStartsPerDay: formattedPerDay,
  totalCompletedPerDay: formattedPerDay,
  completionRate: z.number(),
  viewToStartRate: z.number(),
  dropOffRate: z.number(),
})

export type Stats = z.infer<typeof statsSchema>

export type FormattedPerDay = z.infer<typeof formattedPerDay>

// Variable Analytics Schemas
export const variableValueStatsSchema = z.object({
  value: z.string(),
  totalStarts: z.number(),
  totalCompleted: z.number(),
  completionRate: z.number(),
  dropOffRate: z.number(),
})

export const emptyVariableStatsSchema = z.object({
  totalStarts: z.number(),
  totalCompleted: z.number(),
  completionRate: z.number(),
})

export const variableAnalyticsSchema = z.object({
  variableId: z.string(),
  variableName: z.string(),
  isNumeric: z.boolean(),
  averageValue: z.number().optional(),
  valueStats: z.array(variableValueStatsSchema),
  emptyStats: emptyVariableStatsSchema,
  totalStarts: z.number(),
  totalCompleted: z.number(),
  collectionRate: z.number(),
  usersWithValue: z.number(),
  usersWithoutValue: z.number(),
  collectionRatePerDay: z.array(z.object({
    date: z.string(),
    collectionRate: z.number(),
    usersWithValue: z.number(),
    totalStarts: z.number(),
    averageValue: z.number().optional(),
  })),
})

export type VariableValueStats = z.infer<typeof variableValueStatsSchema>
export type EmptyVariableStats = z.infer<typeof emptyVariableStatsSchema>
export type VariableAnalytics = z.infer<typeof variableAnalyticsSchema>
