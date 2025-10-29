import prisma from '@quickbot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { defaultTimeFilter, timeFilterValues, variableAnalyticsSchema } from '../constants'
import {
  parseFromDateFromTimeFilter,
  parseToDateFromTimeFilter,
} from '../helpers/parseDateFromTimeFilter'
import { VariableWithValue } from '@quickbot.io/schemas'

export const getAnalyticsByVariable = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/analytics/by-variable',
      protect: true,
      summary: 'Get analytics stats grouped by variable values',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      botIds: z.string().min(1, 'At least one bot ID is required').describe('Comma-separated list of bot IDs'),
      variableId: z.string().min(1, 'Variable ID is required'),
      timeFilter: z.enum(timeFilterValues).default(defaultTimeFilter),
      timeZone: z.string().optional(),
    }).transform((input) => ({
      ...input,
      botIds: input.botIds.split(',').map((id) => id.trim()),
    })),
  )
  .output(
    z.object({
      analytics: variableAnalyticsSchema,
    }),
  )
  .query(async ({ input: { botIds, variableId, timeFilter, timeZone }, ctx: { user } }) => {
    if (botIds.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'At least one bot ID is required',
      })
    }

    // Verify user has access to all requested bots
    const accessibleBots = await prisma.bot.findMany({
      where: canReadBots(botIds, user),
      select: {
        id: true,
        variables: true,
      },
    })

    if (accessibleBots.length !== botIds.length) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access one or more of the requested bots',
      })
    }

    const accessibleBotIds = accessibleBots.map((bot) => bot.id)

    // Find the variable name from the bot's variables
    let variableName = variableId
    for (const bot of accessibleBots) {
      const botVariables = bot.variables as VariableWithValue[]
      const variable = botVariables.find((v) => v.id === variableId)
      if (variable) {
        variableName = variable.name
        break
      }
    }

    const fromDate = parseFromDateFromTimeFilter(timeFilter, timeZone)
    const toDate = parseToDateFromTimeFilter(timeFilter, timeZone)

    // Fetch all results with their variables (only started sessions)
    const results = await prisma.botResult.findMany({
      where: {
        botId: {
          in: accessibleBotIds,
        },
        isArchived: false,
        hasStarted: true, // Only count sessions that were started
        createdAt: fromDate
          ? {
            gte: fromDate,
            lte: toDate ?? undefined,
          }
          : undefined,
      },
      select: {
        id: true,
        variables: true,
        isCompleted: true,
        createdAt: true,
      },
    })

    // Group results by variable value
    const valueStatsMap = new Map<string, {
      starts: number
      completed: number
    }>()

    // Stats for users without the variable set
    const emptyStats = {
      starts: 0,
      completed: 0,
    }

    let totalStarts = 0
    let totalCompleted = 0
    const numericValues: number[] = []
    let isNumeric = false

    for (const result of results) {
      const variables = result.variables as VariableWithValue[]
      const variable = variables.find((v) => v.id === variableId)

      // Count totals (all results are started since we filtered by hasStarted)
      totalStarts++
      if (result.isCompleted) totalCompleted++

      // Handle empty/not set values separately
      if (!variable || variable.value === null || variable.value === undefined || variable.value === '') {
        emptyStats.starts++
        if (result.isCompleted) emptyStats.completed++
        continue
      }

      // Check if value is numeric and collect for average calculation
      const rawValue = Array.isArray(variable.value) ? variable.value[0] : variable.value
      const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue))
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        numericValues.push(numericValue)
        isNumeric = true
      }

      // Convert value to string for grouping
      const valueKey = Array.isArray(variable.value)
        ? variable.value.join(', ')
        : String(variable.value)

      // Initialize stats for this value if not exists
      if (!valueStatsMap.has(valueKey)) {
        valueStatsMap.set(valueKey, {
          starts: 0,
          completed: 0,
        })
      }

      const stats = valueStatsMap.get(valueKey)!

      // Count for this specific value
      stats.starts++
      if (result.isCompleted) stats.completed++
    }

    // Calculate average for numeric variables
    const averageValue = isNumeric && numericValues.length > 0
      ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
      : undefined

    // Convert map to array and calculate conversion rates
    const valueStats = Array.from(valueStatsMap.entries()).map(([value, stats]) => {
      const completionRate = stats.starts > 0 ? (stats.completed / stats.starts) * 100 : 0
      const dropOffRate = stats.starts > 0 ? ((stats.starts - stats.completed) / stats.starts) * 100 : 0

      return {
        value,
        totalStarts: stats.starts,
        totalCompleted: stats.completed,
        completionRate: Math.round(completionRate * 100) / 100,
        dropOffRate: Math.round(dropOffRate * 100) / 100,
      }
    }).sort((a, b) => b.totalStarts - a.totalStarts) // Sort by total starts descending

    // Calculate collection rate and empty stats
    const usersWithValue = totalStarts - emptyStats.starts
    const collectionRate = totalStarts > 0 ? (usersWithValue / totalStarts) * 100 : 0
    const emptyCompletionRate = emptyStats.starts > 0 ? (emptyStats.completed / emptyStats.starts) * 100 : 0

    // Calculate collection rate per day
    const dailyStatsMap = new Map<string, {
      starts: number
      usersWithValue: number
      numericValues: number[]
    }>()

    for (const result of results) {
      const variables = result.variables as VariableWithValue[]
      const variable = variables.find((v) => v.id === variableId)

      // Get date (YYYY-MM-DD format)
      const date = result.createdAt.toISOString().split('T')[0]

      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, {
          starts: 0,
          usersWithValue: 0,
          numericValues: [],
        })
      }

      const dailyStats = dailyStatsMap.get(date)!
      dailyStats.starts++

      // Check if variable has value
      if (variable && variable.value !== null && variable.value !== undefined && variable.value !== '') {
        dailyStats.usersWithValue++

        // Collect numeric values for daily average
        if (isNumeric) {
          const rawValue = Array.isArray(variable.value) ? variable.value[0] : variable.value
          const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue))
          if (!isNaN(numericValue) && isFinite(numericValue)) {
            dailyStats.numericValues.push(numericValue)
          }
        }
      }
    }

    // Convert to array and calculate daily collection rates
    const collectionRatePerDay = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => {
        const dailyCollectionRate = stats.starts > 0 ? (stats.usersWithValue / stats.starts) * 100 : 0
        const dailyAverage = stats.numericValues.length > 0
          ? stats.numericValues.reduce((sum, val) => sum + val, 0) / stats.numericValues.length
          : undefined

        return {
          date,
          collectionRate: Math.round(dailyCollectionRate * 100) / 100,
          usersWithValue: stats.usersWithValue,
          totalStarts: stats.starts,
          averageValue: dailyAverage !== undefined ? Math.round(dailyAverage * 100) / 100 : undefined,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date)) // Sort by date ascending

    return {
      analytics: {
        variableId,
        variableName,
        isNumeric,
        averageValue: averageValue !== undefined ? Math.round(averageValue * 100) / 100 : undefined,
        valueStats,
        emptyStats: {
          totalStarts: emptyStats.starts,
          totalCompleted: emptyStats.completed,
          completionRate: Math.round(emptyCompletionRate * 100) / 100,
        },
        totalStarts,
        totalCompleted,
        collectionRate: Math.round(collectionRate * 100) / 100,
        usersWithValue,
        usersWithoutValue: emptyStats.starts,
        collectionRatePerDay,
      },
    }
  })
