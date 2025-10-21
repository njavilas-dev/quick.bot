import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { plansSchema } from '@quickbot.io/schemas'
import { listPlans as listPlansHandler } from '@quickbot.io/billing/api/listPlans'

export const listPlans = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/plans',
      protect: true,
      summary: 'List subscription plans',
      tags: ['Billing'],
    },
  })
  .input(
    z
      .object({
        chatTiers: z.boolean().optional(),
      })
      .optional(),
  )
  .output(z.array(plansSchema))
  .query(async ({ input }) => listPlansHandler({ chatTiers: input?.chatTiers }))
