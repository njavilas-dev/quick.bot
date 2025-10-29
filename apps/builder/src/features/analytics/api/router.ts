import { router } from '@/helpers/server/trpc'
import { getAnalytics } from './getAnalytics'
import { getAnalyticsFlow } from './getAnalyticsFlow'
import { getAnalyticsByVariable } from './getAnalyticsByVariable'

export const analyticsRouter = router({
  getAnalyticsFlow,
  getAnalytics,
  getAnalyticsByVariable,
})
