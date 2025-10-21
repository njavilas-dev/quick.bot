import { env } from '@quickbot.io/env'
import { BillingPlanType } from '@quickbot.io/prisma'

export const parseWorkspaceDefaultPlan = (userEmail: string) => {
  if (env.ADMIN_EMAIL?.some((email) => email === userEmail)) return BillingPlanType.UNLIMITED
  const defaultPlan = env.DEFAULT_WORKSPACE_PLAN as BillingPlanType
  if (defaultPlan && Object.values(BillingPlanType).includes(defaultPlan)) return defaultPlan
  return BillingPlanType.FREE
}
