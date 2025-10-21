import { WorkspaceRole, BillingPlanType, PrismaClient } from '@quickbot.io/prisma'
import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { isDefined, isEmpty } from '@quickbot.io/lib'
import { promptAndSetEnvironment } from './utils'
import { Workspace } from '@quickbot.io/schemas'
import { sendWorkspaceBillingPlanUsageLimitEmail } from '@quickbot.io/emails/src/emails/workspace-billing-plan-usage-limit-email'
import { TelemetryEvent } from '@quickbot.io/schemas/features/telemetry'
import { trackEvents } from '@quickbot.io/telemetry/trackEvents'
import Stripe from 'stripe'
import { createId } from '@quickbot.io/lib/createId'
const LIMIT_EMAIL_TRIGGER_PERCENT = 0.75

const prismaWithLogging = withQueryLogging()

export const checkAndReportChatsUsage = async () => {
  await promptAndSetEnvironment('production')

  console.log('Get collected results from the last hour...')

  const zeroedMinutesHour = new Date()
  zeroedMinutesHour.setUTCMinutes(0, 0, 0)
  const hourAgo = new Date(zeroedMinutesHour.getTime() - 1000 * 60 * 60)

  const results = await prismaWithLogging.botResult.groupBy({
    by: ['botId'],
    _count: {
      _all: true,
    },
    where: {
      hasStarted: true,
      createdAt: {
        lt: zeroedMinutesHour,
        gte: hourAgo,
      },
    },
  })

  console.log(
    `Found ${results.reduce(
      (total, result) => total + result._count._all,
      0,
    )} results collected for the last hour.`,
  )

  const workspaces = await prismaWithLogging.workspace.findMany({
    where: {
      bots: {
        some: {
          id: { in: results.map((result) => result.botId) },
        },
      },
    },
    select: {
      id: true,
      name: true,
      bots: { select: { id: true } },
      members: {
        select: { user: { select: { id: true, email: true } }, role: true },
      },
      additionalStorageIndex: true,
      billingPlan: true,
      isQuarantined: true,
      chatsLimitFirstEmailSentAt: true,
      chatsLimitSecondEmailSentAt: true,
      stripeId: true,
    },
  })

  if (isEmpty(process.env.STRIPE_SECRET_KEY))
    throw new Error('Missing STRIPE_SECRET_KEY env variable')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })

  const quarantineEvents: TelemetryEvent[] = []
  const autoUpgradeEvents: TelemetryEvent[] = []

  for (const workspace of workspaces) {
    if (workspace.isQuarantined) continue
    const chatsLimit = workspace?.billingPlan.chatsLimit ?? 'inf'
    const subscription = await getSubscription(workspace, { stripe })
    const { totalChatsUsed } = await getWorkspaceSubscription(prismaWithLogging)({
      workspaceId: workspace.id,
      subscription,
    })
    if (chatsLimit === 'inf') continue
    if (
      chatsLimit > 0 &&
      totalChatsUsed >= chatsLimit * LIMIT_EMAIL_TRIGGER_PERCENT &&
      totalChatsUsed < chatsLimit &&
      !workspace.chatsLimitFirstEmailSentAt
    ) {
      const adminUsers = workspace.members
        .filter((member) => member.role === WorkspaceRole.ADMIN)
        .map((member) => member.user)

      try {
        const notificationsSetting = await prismaWithLogging.userNotification.findMany({
          where: {
            userId: {
              in: adminUsers.map((user) => user.id),
            },
          },
        })

        const to = adminUsers
          .filter((user) => {
            const notificationSetting = notificationsSetting.find(
              (notification) => notification.userId === user.id,
            )
            return notificationSetting && notificationSetting.almostReachedChatsLimit
          })
          .map((user) => user.email)
          .filter(isDefined)

        if (to.length > 0) {
          console.log(`Send almost reached conversations limit email to ${to.join(', ')}...`)
          await sendWorkspaceBillingPlanUsageLimitEmail({
            to,
            usagePercent: Math.round((totalChatsUsed / chatsLimit) * 100),
            chatsLimit,
            workspaceName: workspace.name,
          })
        }

        await prismaWithLogging.workspace.updateMany({
          where: { id: workspace.id },
          data: { chatsLimitFirstEmailSentAt: new Date() },
        })
      } catch (err) {
        console.error(err)
      }
    }

    const isUsageBasedSubscription = isDefined(
      subscription?.items.data.find(
        (item) =>
          item.price.id === process.env.STRIPE_PERSONAL_PRICE_ID ||
          item.price.id === process.env.STRIPE_BUSINESS_PRICE_ID,
      ),
    )

    if (
      isUsageBasedSubscription &&
      subscription &&
      (workspace.billingPlan.key === 'PERSONAL' || workspace.billingPlan.key === 'BUSINESS')
    ) {
      if (workspace.billingPlan.key === 'PERSONAL' && totalChatsUsed >= 4000) {
        console.log('Workspace has more than 4000 conversations, automatically upgrading to BUSINESS plan')
        const newSubscription = await autoUpgradeToPro(subscription, {
          stripe,
          workspaceId: workspace.id,
        })
        autoUpgradeEvents.push(
          ...workspace.members
            .filter((member) => member.role === WorkspaceRole.ADMIN)
            .map(
              (member) =>
              ({
                name: 'Workspace subscription automatically updated',
                userId: member.user.id,
                workspaceId: workspace.id,
                data: {
                  previousPlan: 'PERSONAL',
                  plan: 'BUSINESS',
                },
              } satisfies TelemetryEvent),
            ),
        )
        await reportUsageToStripe(totalChatsUsed, {
          stripe,
          subscription: newSubscription,
        })
      } else {
        await reportUsageToStripe(totalChatsUsed, { stripe, subscription })
      }
    }

    if (totalChatsUsed > chatsLimit * 1.5 && workspace.billingPlan.key === BillingPlanType.FREE) {
      console.log(`Automatically quarantine workspace ${workspace.id}...`)
      await prismaWithLogging.workspace.updateMany({
        where: { id: workspace.id },
        data: { isQuarantined: true },
      })
      quarantineEvents.push(
        ...workspace.members
          .filter((member) => member.role === WorkspaceRole.ADMIN)
          .map(
            (member) =>
            ({
              name: 'Workspace automatically quarantined',
              userId: member.user.id,
              workspaceId: workspace.id,
              data: {
                totalChatsUsed,
                chatsLimit,
              },
            } satisfies TelemetryEvent),
          ),
      )
    }
  }

  const resultsWithWorkspaces = results
    .flatMap((result) => {
      const workspace = workspaces.find((workspace) =>
        workspace.bots.some((bot) => bot.id === result.botId),
      )
      if (!workspace) return
      return workspace.members
        .filter((member) => member.role !== WorkspaceRole.GUEST)
        .map((member, memberIndex) => ({
          userId: member.user.id,
          workspace: workspace,
          botId: result.botId,
          totalResultsLastHour: result._count._all,
          isFirstOfKind: memberIndex === 0 ? (true as const) : undefined,
        }))
    })
    .filter(isDefined)

  const newResultsCollectedEvents = resultsWithWorkspaces.map(
    (result) =>
    ({
      name: 'New results collected',
      userId: result.userId,
      workspaceId: result.workspace.id,
      botId: result.botId,
      data: {
        total: result.totalResultsLastHour,
        isFirstOfKind: result.isFirstOfKind,
      },
    } satisfies TelemetryEvent),
  )

  console.log(
    `Send ${newResultsCollectedEvents.length} new results events and ${quarantineEvents.length} auto quarantine events...`,
  )

  await trackEvents(quarantineEvents.concat(newResultsCollectedEvents))
}

const getSubscription = async (
  workspace: Pick<Workspace, 'stripeId' | 'billingPlan'>,
  { stripe }: { stripe: Stripe },
) => {
  if (
    !workspace.stripeId ||
    (workspace.billingPlan.key !== 'PERSONAL' && workspace.billingPlan.key !== 'BUSINESS')
  )
    return
  const subscriptions = await stripe.subscriptions.list({
    customer: workspace.stripeId,
  })

  const subscription = subscriptions.data
    .filter((sub) => ['past_due', 'active'].includes(sub.status))
    .sort((a, b) => a.created - b.created)
    .shift()

  return subscription
}

const reportUsageToStripe = async (
  totalResultsLastHour: number,
  { stripe, subscription }: { stripe: Stripe; subscription: Stripe.Subscription },
) => {
  if (!process.env.STRIPE_PERSONAL_CHATS_PRICE_ID || !process.env.STRIPE_BUSINESS_CHATS_PRICE_ID)
    throw new Error(
      'Missing STRIPE_PERSONAL_CHATS_PRICE_ID or STRIPE_BUSINESS_CHATS_PRICE_ID env variable',
    )
  const subscriptionItem = subscription.items.data.find(
    (item) =>
      item.price.id === process.env.STRIPE_PERSONAL_CHATS_PRICE_ID ||
      item.price.id === process.env.STRIPE_BUSINESS_CHATS_PRICE_ID,
  )

  if (!subscriptionItem) throw new Error(`Could not find subscription item for workspace`)

  const idempotencyKey = createId()

  return stripe.subscriptionItems.createUsageRecord(
    subscriptionItem.id,
    {
      quantity: totalResultsLastHour,
      timestamp: 'now',
    },
    {
      idempotencyKey,
    },
  )
}

const getWorkspaceSubscription =
  (prismaWithLogging: PrismaClient) =>
    async ({
      workspaceId,
      subscription,
    }: {
      workspaceId: string
      subscription: Stripe.Subscription | undefined
    }) => {

      const bots = await prismaWithLogging.bot.findMany({
        where: {
          workspaceId,
        },
        select: {
          id: true,
        },
      })

      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalChatsUsed = await prismaWithLogging.botResult.count({
        where: {
          botId: { in: bots.map((bot) => bot.id) },
          hasStarted: true,
          createdAt: {
            gte: subscription ? new Date(subscription.current_period_start * 1000) : firstDayOfMonth,
          },
        },
      })

      return {
        totalChatsUsed,
      }
    }

const autoUpgradeToPro = async (
  subscription: Stripe.Subscription,
  { stripe, workspaceId }: { stripe: Stripe; workspaceId: string },
) => {
  if (
    !process.env.STRIPE_PERSONAL_CHATS_PRICE_ID ||
    !process.env.STRIPE_BUSINESS_CHATS_PRICE_ID ||
    !process.env.STRIPE_BUSINESS_PRICE_ID ||
    !process.env.STRIPE_PERSONAL_PRICE_ID
  )
    throw new Error(
      'Missing STRIPE_PERSONAL_CHATS_PRICE_ID or STRIPE_BUSINESS_CHATS_PRICE_ID env variable',
    )
  const currentPlanItemId = subscription?.items.data.find((item) =>
    [process.env.STRIPE_BUSINESS_PRICE_ID, process.env.STRIPE_PERSONAL_PRICE_ID].includes(
      item.price.id,
    ),
  )?.id

  if (!currentPlanItemId) throw new Error(`Could not find current plan item ID for workspace`)

  const newSubscription = stripe.subscriptions.update(subscription.id, {
    items: [
      {
        id: currentPlanItemId,
        price: process.env.STRIPE_BUSINESS_PRICE_ID,
        quantity: 1,
      },
      {
        id: subscription.items.data.find(
          (item) =>
            item.price.id === process.env.STRIPE_PERSONAL_CHATS_PRICE_ID ||
            item.price.id === process.env.STRIPE_BUSINESS_CHATS_PRICE_ID,
        )?.id,
        price: process.env.STRIPE_BUSINESS_CHATS_PRICE_ID,
      },
    ],
    proration_behavior: 'always_invoice',
  })

  const businessPlan = await prismaWithLogging.workspaceBillingPlan.findFirst({
    where: {
      key: BillingPlanType.BUSINESS,
    },
  })

  await prismaWithLogging.workspace.update({
    where: { id: workspaceId },
    data: {
      billingPlanId: businessPlan!.id,
    },
  })

  return newSubscription
}

checkAndReportChatsUsage().then()
