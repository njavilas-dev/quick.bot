import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { getPlan as getPlanHandler } from '@quickbot.io/billing/api/getPlan'
import { planSchema } from '@quickbot.io/schemas'
import { BillingPlanType } from '@quickbot.io/prisma'

export const getPlan = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/plan',
      protect: true,
      summary: 'Get plan',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      planId: z.string().optional(),
      key: z.nativeEnum(BillingPlanType).optional(),
    }),
  )
  .output(planSchema)
  .query(async ({ input: { planId, key } }) => getPlanHandler({ planId, key }))
