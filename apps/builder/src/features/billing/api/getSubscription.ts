import { z } from 'zod'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { subscriptionSchema } from '@quickbot.io/schemas/features/billing/subscription'
import { getSubscription as getSubscriptionHandler } from '@quickbot.io/billing/api/getSubscription'

export const getSubscription = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/subscription',
      protect: true,
      summary: 'Get subscription',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
    }),
  )
  .output(subscriptionSchema.or(z.null().openapi({ type: 'string' })))
  .query(async ({ input: { workspaceId }, ctx: { user } }) =>
    getSubscriptionHandler({ workspaceId, user }),
  )
