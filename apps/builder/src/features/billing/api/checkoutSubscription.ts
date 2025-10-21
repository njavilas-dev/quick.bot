import { authenticatedProcedure } from '@/helpers/server/trpc'
import { BillingPlanType } from '@quickbot.io/prisma'
import { z } from 'zod'
import { checkoutSubscription as checkoutSubscriptionHandler } from '@quickbot.io/billing/api/checkoutSubscription'

export const checkoutSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/billing/subscription/checkout',
      protect: true,
      summary: 'Create checkout session to create a new subscription',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      plan: z.enum(Object.values(BillingPlanType) as [string, ...string[]]),
      currency: z.enum(['usd', 'eur']),
      returnUrl: z.string(),
    }),
  )
  .output(
    z.object({
      checkoutUrl: z.string(),
    }),
  )
  .mutation(async ({ input, ctx: { user } }) =>
    checkoutSubscriptionHandler({
      ...input,
      billingPlan: input.plan as BillingPlanType,
      user,
    }),
  )
