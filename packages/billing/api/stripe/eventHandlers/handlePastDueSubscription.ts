import { Stripe } from 'stripe'
import prisma from '@quickbot.io/lib/prisma'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { WorkspaceRole, BillingPlanType } from '@quickbot.io/prisma'
import { getValidWorkspace } from '../../../helpers/getValidWorkspace'
import { StripeService } from '../../../services/StripeService'

export async function handlePastDueSubscription(
  event: Stripe.Event,
): Promise<{ status: string; message: string }> {
  const stripe = new StripeService()
  const customerId = (event.data.object as Stripe.Subscription).customer as string
  const workspaceId = (event.data.object as Stripe.Subscription).metadata.workspaceId
  const subscription = event.data.object as Stripe.Subscription

  if (!subscription) {
    return {
      status: 'ignored',
      message: 'Subscription not found, skipping.',
    }
  }

  const workspace = await getValidWorkspace(workspaceId)

  const currentPlan = workspace.billingPlan

  if (!currentPlan) {
    throw new Error('Current plan not found in DB.')
  }

  const pendingInvoices = await stripe.listInvoices(customerId, 1000, 'open')

  const pendingInvoicesWithAdditionalUsageCosts = pendingInvoices.data.filter(
    (invoice) => invoice.amount_due > (currentPlan?.price ?? 0) * 100,
  )

  const isPastDue = pendingInvoicesWithAdditionalUsageCosts.length > 0

  if (workspace.isPastDue === isPastDue) {
    return {
      status: 'ignored',
      message: 'Workspace already in the correct state, skipping.',
    }
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspace.id },
    data: { isPastDue },
    select: {
      id: true,
      members: {
        select: { userId: true },
        where: { role: WorkspaceRole.ADMIN },
      },
    },
  })

  await trackEvents(
    updatedWorkspace.members.map((m) => ({
      name: isPastDue
        ? 'Workspace subscription past due'
        : 'Workspace subscription past due status removed',
      workspaceId: updatedWorkspace.id,
      userId: m.userId,
    })),
  )

  return {
    status: 'success',
    message: `Workspace ${isPastDue ? 'set to past due' : 'regulated (past due status removed)'}.`,
  }
}
