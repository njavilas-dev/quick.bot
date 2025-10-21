import { router } from '@/helpers/server/trpc'
import { getAnalytics } from './getAnalytics'
import { getAnalyticsFlow } from './getAnalyticsFlow'

export const analyticsRouter = router({
  getAnalyticsFlow,
  getAnalytics,
})
