import { env } from '@quickbot.io/env'
import { BillingPlanType } from '@quickbot.io/prisma'

export const getStripePlanChatPriceId = (plan: BillingPlanType): string | undefined => {
  const chatPriceIds: Partial<Record<BillingPlanType, string>> = {
    [BillingPlanType.PERSONAL]: env.STRIPE_PERSONAL_CHATS_PRICE_ID,
    [BillingPlanType.BUSINESS]: env.STRIPE_BUSINESS_CHATS_PRICE_ID,
    [BillingPlanType.ENTERPRISE]: env.STRIPE_ENTERPRISE_CHATS_PRICE_ID,
  }
  return chatPriceIds?.[plan]
}
