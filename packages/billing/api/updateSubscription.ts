import { TRPCError } from '@trpc/server'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { BillingPlanType } from '@quickbot.io/prisma'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { User } from '@quickbot.io/schemas'
import { isAdminWriteWorkspaceForbidden } from '@quickbot.io/db-rules/isAdminWriteWorkspaceForbidden'
import { getValidWorkspace } from '../helpers/getValidWorkspace'
import { getStripePlanPriceId } from '../helpers/getStripePlanPriceId'
import { getStripePlanChatPriceId } from '../helpers/getStripePlanChatPriceId'
import { StripeService } from '../services/StripeService'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
  billingPlan: BillingPlanType
  returnUrl: string
  currency: 'usd' | 'eur'
}

export const updateSubscription = async ({
  workspaceId,
  user,
  billingPlan,
  returnUrl,
  currency,
}: Props) => {
  const stripe = new StripeService()
  const workspace = await getValidWorkspace(workspaceId)

  if (isAdminWriteWorkspaceForbidden(workspace, user)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not allowed to update this workspace',
    })
  }

  if (!workspace?.stripeId) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Workspace stripeId not found',
    })
  }

  if (workspace?.isPastDue) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'You have unpaid invoices. Please head over your billing portal to pay it.',
    })
  }

  const subscription = await stripe.getSubscription(workspace.stripeId)

  if (!subscription) {
    const session = await stripe.createCheckoutSession({
      customerId: workspace.stripeId,
      workspaceId,
      billingPlan,
      currency,
      returnUrl,
    })

    if (!session?.url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stripe checkout session creation failed',
      })
    }

    return { checkoutUrl: session.url }
  }

  const currentPlan = workspace.billingPlan

  if (!currentPlan) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Current plan not found in DB.',
    })
  }

  const totalChatsUsed = await prisma.botResult.count({
    where: {
      bot: { workspaceId },
      hasStarted: true,
      createdAt: {
        gte: new Date(subscription.current_period_start * 1000),
      },
    },
  })

  if (currentPlan.chatsLimit && currentPlan.chatsLimit < totalChatsUsed) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'You have collected more conversations than your current plan allows. Please upgrade your plan.',
    })
  }

  const currentPlanItemId = subscription?.items.data.find((item) =>
    [
      env.STRIPE_PERSONAL_PRICE_ID,
      env.STRIPE_BUSINESS_PRICE_ID,
      env.STRIPE_ENTERPRISE_PRICE_ID,
    ].includes(item.price.id),
  )?.id

  const currentPlanChatItemId = subscription?.items.data.find((item) =>
    [
      env.STRIPE_PERSONAL_CHATS_PRICE_ID,
      env.STRIPE_BUSINESS_CHATS_PRICE_ID,
      env.STRIPE_ENTERPRISE_CHATS_PRICE_ID,
    ].includes(item.price.id),
  )?.id

  const items = [
    {
      id: currentPlanItemId,
      price: getStripePlanPriceId(billingPlan),
      quantity: 1,
    },
    {
      id: currentPlanChatItemId,
      price: getStripePlanChatPriceId(billingPlan),
    },
  ]

  await stripe.updateSubscription(subscription.id, items)

  const newPlan = await prisma.workspaceBillingPlan.findFirst({ where: { key: billingPlan } })

  if (!newPlan) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Plan not found',
    })
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      billingPlanId: newPlan?.id,
      isQuarantined: false,
    },
    include: {
      billingPlan: true,
    },
  })

  const isDowngrade = (currentPlan?.price || 0) > newPlan.price

  await trackEvents([
    {
      name: isDowngrade ? 'Workspace subscription downgraded' : 'Workspace subscription upgraded',
      workspaceId,
      userId: user.id,
      data: {
        previousPlan: currentPlan.key,
        plan: newPlan.key,
      },
    },
  ])

  return { workspace: updatedWorkspace }
}
