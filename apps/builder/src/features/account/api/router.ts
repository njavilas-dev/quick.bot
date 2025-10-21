import { router } from '@/helpers/server/trpc'
import { updateAccountNotificationSetting } from './updateAccountNotificationSetting'
import { getAccountNotificationSetting } from './getAccountNotificationSetting'
import { getAccountApiTokens } from './getAccountApiTokens'

export const accountRouter = router({
  getAccountApiTokens,
  updateAccountNotificationSetting,
  getAccountNotificationSetting,
})
