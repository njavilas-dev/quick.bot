import { TRPCError } from '@trpc/server'
import { BillingPlanType, User } from '@quickbot.io/prisma'
import { getValidWorkspace } from '../helpers/getValidWorkspace'
import { isAdminWriteWorkspaceForbidden } from '@quickbot.io/db-rules/isAdminWriteWorkspaceForbidden'
import { StripeService } from '../services/StripeService'
import { formatVatData } from '../helpers/formatVatData'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
  billingPlan: BillingPlanType
  currency: 'usd' | 'eur'
  returnUrl: string
}

export const checkoutSubscription = async ({
  workspaceId,
  user,
  billingPlan,
  currency,
  returnUrl,
}: Props) => {
  const stripe = new StripeService()
  const workspace = await getValidWorkspace(workspaceId)

  if (isAdminWriteWorkspaceForbidden(workspace, user)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not allowed to update this workspace',
    })
  }

  if (workspace?.stripeId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Customer already exists, use updateSubscription endpoint.',
    })
  }

  const customer = await stripe.createCustomer({
    email: workspace.billingEmail ?? user.email ?? '',
    name: workspace.billingCompany ?? workspace.name ?? user.email ?? '',
    workspaceId: workspace.id,
    taxIdData: formatVatData({
      billingVatValue: workspace.billingVatValue ?? undefined,
      billingVatType: workspace.billingVatType ?? undefined,
    }),
  })

  if (!customer?.id) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe customer creation failed.',
    })
  }

  const session = await stripe.createCheckoutSession({
    customerId: customer.id,
    workspaceId,
    billingPlan,
    currency,
    returnUrl,
  })

  if (!session.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe checkout session creation failed.',
    })
  }

  return { checkoutUrl: session.url }
}
