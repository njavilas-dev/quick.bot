import { z } from '../../zod'

export const subscriptionSchema = z.object({
  status: z.enum(['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid', 'paused', 'disabled']),
  currency: z.enum(['usd', 'eur']),
  totalChatsUsed: z.number(),
  resetsAt: z.date().optional(),
  startsAt: z.date().optional(),
  cancelAt: z.date().optional(),
  portalUrl: z.string().optional(),
})

export type Subscription = z.infer<typeof subscriptionSchema>
