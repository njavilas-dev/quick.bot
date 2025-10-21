import { Stripe } from 'stripe'
import prisma from '@quickbot.io/lib/prisma'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { WorkspaceRole, BillingPlanType } from '@quickbot.io/prisma'
import { getValidWorkspace } from '../../../helpers/getValidWorkspace'

export async function handleCheckoutSubscription(
  event: Stripe.Event,
): Promise<{ status: string; message: string }> {
  const session = event.data.object as Stripe.Checkout.Session

  const metadata = session.metadata as {
    billingPlan: BillingPlanType
    plan?: BillingPlanType // For backward compatibility
    planId?: string
    workspaceId?: string
    userId?: string
  }

  if (!metadata.workspaceId) {
    throw new Error('Missing workspaceId in metadata')
  }

  // Use billingPlan if available, fall back to plan for backward compatibility
  const planKey = metadata.billingPlan || metadata.plan

  if (!planKey) {
    throw new Error('Missing billingPlan in metadata')
  }

  if (planKey === BillingPlanType.CUSTOM) {
    throw new Error('Cannot upgrade to custom plan')
  }

  const newPlan = await prisma.workspaceBillingPlan.findFirst({ where: { key: planKey } })

  if (!newPlan) {
    throw new Error('Plan not found in DB')
  }

  const workspace = await getValidWorkspace(metadata.workspaceId)

  const currentPlan = workspace.billingPlan

  if (!currentPlan) {
    throw new Error('Current plan not found in DB')
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      billingPlanId: newPlan.id,
      stripeId: session.customer as string,
      isQuarantined: false,
    },
    include: {
      members: {
        select: { userId: true },
        where: { role: WorkspaceRole.ADMIN },
      },
    },
  })

  await trackEvents(
    updatedWorkspace.members.map((m) => ({
      name: 'Workspace subscription updated',
      workspaceId: metadata.workspaceId!,
      userId: m.userId,
      data: {
        previousPlan: currentPlan.key,
        plan: newPlan.key,
      },
    })),
  )

  return {
    status: 'success',
    message: 'Workspace upgraded in DB',
  }
}
