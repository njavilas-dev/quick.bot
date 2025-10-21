import { Stripe } from 'stripe'
import prisma from '@quickbot.io/lib/prisma'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import { WorkspaceRole, BillingPlanType } from '@quickbot.io/prisma'
import { Settings } from '@quickbot.io/schemas'
import { getValidWorkspace } from '../../../helpers/getValidWorkspace'
import { StripeService } from '../../../services/StripeService'

export async function handleDeleteSubscription(
  event: Stripe.Event,
): Promise<{ status: string; message: string }> {
  const stripe = new StripeService()

  const customerId = (event.data.object as Stripe.Subscription).customer as string
  const workspaceId = (event.data.object as Stripe.Subscription).metadata.workspaceId

  const subscription = await stripe.getSubscription(customerId)

  if (subscription) {
    return {
      status: 'ignored',
      message: 'An active subscription still exists. Skipping downgrade.',
    }
  }

  const workspace = await getValidWorkspace(workspaceId)

  if (!workspace.isPastDue) {
    return {
      status: 'ignored',
      message: 'Workspace not past_due, skipping invoice.paid.',
    }
  }

  const currentPlan = workspace.billingPlan

  if (!currentPlan) {
    throw new Error('Current plan not found in DB.')
  }

  const freePlan = await prisma.workspaceBillingPlan.findFirst({ where: { key: BillingPlanType.FREE } })

  if (!freePlan) {
    throw new Error('Free plan not found in DB.')
  }

  const pendingInvoices = await stripe.listInvoices(customerId, 1000, 'open')

  const pendingInvoicesWithAdditionalUsageCosts = pendingInvoices.data.filter(
    (invoice) => invoice.amount_due > (currentPlan?.price ?? 0) * 100,
  )

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      billingPlanId: freePlan.id,
      isPastDue: pendingInvoicesWithAdditionalUsageCosts.length > 0,
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
      name: 'Workspace subscription canceled due to pending-payment',
      workspaceId: updatedWorkspace.id,
      userId: m.userId,
      data: {
        previousPlan: currentPlan.key,
        plan: freePlan.key,
      },
    })),
  )

  const bots = await prisma.bot.findMany({
    where: {
      workspaceId: updatedWorkspace.id,
      isArchived: { not: true },
    },
    include: { publishedBot: true },
  })

  for (const t of bots) {
    const settings = t.settings as Settings

    if (!settings.general?.isBrandingEnabled) {
      await prisma.bot.updateMany({
        where: { id: t.id },
        data: {
          settings: {
            ...settings,
            general: {
              ...settings.general,
              isBrandingEnabled: true,
            },
            whatsApp: settings.whatsApp
              ? {
                ...settings.whatsApp,
                isEnabled: false,
              }
              : undefined,
          },
        },
      })
    }
    const published = t.publishedBot?.settings as Settings | null
    if (published && !published.general?.isBrandingEnabled) {
      await prisma.botPublic.updateMany({
        where: { id: t.id },
        data: {
          settings: {
            ...published,
            general: {
              ...published.general,
              isBrandingEnabled: true,
            },
          },
        },
      })
    }
  }

  return {
    status: 'success',
    message: 'Workspace successfully downgraded to Free plan.',
  }
}
