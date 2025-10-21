import { env } from '@quickbot.io/env'
import { BillingPlanType } from '@quickbot.io/prisma'

export const getStripePlanPriceId = (plan: BillingPlanType): string | undefined => {
  const priceIds: Partial<Record<BillingPlanType, string>> = {
    [BillingPlanType.PERSONAL]: env.STRIPE_PERSONAL_PRICE_ID,
    [BillingPlanType.BUSINESS]: env.STRIPE_BUSINESS_PRICE_ID,
    [BillingPlanType.ENTERPRISE]: env.STRIPE_ENTERPRISE_PRICE_ID,
  }
  return priceIds?.[plan]
}
