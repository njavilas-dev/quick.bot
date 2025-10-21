import { authenticatedProcedure } from '@/helpers/server/trpc'
import { BillingPlanType } from '@quickbot.io/prisma'
import { workspaceSchema } from '@quickbot.io/schemas'
import { z } from 'zod'
import { updateSubscription as updateSubscriptionHandler } from '@quickbot.io/billing/api/updateSubscription'

export const updateSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/billing/subscription',
      protect: true,
      summary: 'Update subscription',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      returnUrl: z.string(),
      workspaceId: z.string(),
      plan: z.enum(Object.values(BillingPlanType) as [string, ...string[]]),
      currency: z.enum(['usd', 'eur']),
    }),
  )
  .output(
    z.object({
      workspace: workspaceSchema.nullish(),
      checkoutUrl: z.string().nullish(),
    }),
  )
  .mutation(async ({ input, ctx: { user } }) =>
    updateSubscriptionHandler({
      ...input,
      billingPlan: input.plan as BillingPlanType,
      user,
    }),
  )
