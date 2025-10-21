import { TRPCError } from '@trpc/server'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { BillingPlanType, User } from '@quickbot.io/prisma'
import { getValidWorkspace } from '../helpers/getValidWorkspace'
import { isReadWorkspaceFobidden } from '@quickbot.io/db-rules/isReadWorkspaceFobidden'
import { StripeService } from '../services/StripeService'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
}

export const getSubscription = async ({ workspaceId, user }: Props) => {
  const stripe = new StripeService()
  const workspace = await getValidWorkspace(workspaceId)

  if (isReadWorkspaceFobidden(workspace, user)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not allowed to update this workspace',
    })
  }
  const isFreePlan = workspace.billingPlan.key === BillingPlanType.FREE

  const now = new Date()
  let startSubscriptionDate: Date | undefined = new Date(now.getFullYear(), now.getMonth(), 1)
  let endSubscriptionDate: Date | undefined = new Date(
    startSubscriptionDate.getFullYear(),
    startSubscriptionDate.getMonth() + 1,
    1,
  )
  let cancelSubscriptionDate: Date | undefined
  let status:
    | 'active'
    | 'canceled'
    | 'past_due'
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'unpaid'
    | 'paused'
    | 'disabled' = 'active'
  let currency: 'usd' | 'eur' = 'usd'
  let portalUrl: string | undefined

  const totalChatsUsed = await prisma.botResult.count({
    where: {
      botId: { in: workspace.bots.map((bot) => bot.id) },
      hasStarted: true,
      createdAt: {
        gte: startSubscriptionDate,
      },
    },
  })

  if (!isFreePlan && workspace?.stripeId) {
    status = 'disabled'

    const subscription = await stripe.getSubscription(workspace.stripeId, 'all')

    if (!subscription) {
      return {
        status,
        currency,
        totalChatsUsed,
        resetsAt: endSubscriptionDate,
        startsAt: startSubscriptionDate,
        cancelAt: cancelSubscriptionDate,
        portalUrl,
      }
    }

    const session = await stripe.createBillingPortalSession(
      workspace.stripeId,
      `${env.NEXTAUTH_URL}/bots`,
    )

    startSubscriptionDate = new Date(subscription.current_period_start * 1000)
    endSubscriptionDate = new Date(subscription.current_period_end * 1000)
    status = subscription.status
    currency = subscription.currency as 'usd' | 'eur'
    const end = subscription.cancel_at ?? subscription.ended_at
    cancelSubscriptionDate = end ? new Date(end * 1000) : undefined
    portalUrl = session.url
  }

  return {
    status,
    currency,
    totalChatsUsed,
    resetsAt: endSubscriptionDate,
    startsAt: startSubscriptionDate,
    cancelAt: cancelSubscriptionDate,
    portalUrl,
  }
}
