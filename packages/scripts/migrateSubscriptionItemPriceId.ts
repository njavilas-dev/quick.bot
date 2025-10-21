import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import { writeFileSync } from 'fs'
import Stripe from 'stripe'

const prismaWithLogging = withQueryLogging()

const migrateSubscriptionItemPriceId = async () => {
  await promptAndSetEnvironment()

  if (
    !process.env.STRIPE_PERSONAL_CHATS_PRICE_ID_OLD ||
    !process.env.STRIPE_PERSONAL_CHATS_PRICE_ID ||
    !process.env.STRIPE_BUSINESS_CHATS_PRICE_ID_OLD ||
    !process.env.STRIPE_BUSINESS_CHATS_PRICE_ID ||
    !process.env.STRIPE_SECRET_KEY
  )
    throw new Error('Missing some env variables')

  const workspacesWithPaidPlan = await prismaWithLogging.workspace.findMany({
    where: {
      billingPlan: {
        key: {
          in: ['BUSINESS', 'PERSONAL'],
        },
      },
      isSuspended: false,
    },
    select: {
      billingPlan: true,
      name: true,
      id: true,
      stripeId: true,
      isQuarantined: true,
      members: {
        select: {
          user: {
            select: { email: true },
          },
        },
      },
    },
  })

  writeFileSync('./workspacesWithPaidPlan.json', JSON.stringify(workspacesWithPaidPlan, null, 2))

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })

  let i = 0
  for (const workspace of workspacesWithPaidPlan) {
    i += 1
    console.log(
      `(${i} / ${workspacesWithPaidPlan.length})`,
      'Migrating workspace:',
      workspace.id,
      workspace.name,
      workspace.stripeId,
      JSON.stringify(workspace.members.map((member) => member.user.email)),
    )
    if (!workspace.stripeId) {
      console.log('No stripe ID, skipping...')
      continue
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: workspace.stripeId,
    })

    const subscription = subscriptions.data
      .filter((sub) => ['past_due', 'active'].includes(sub.status))
      .sort((a, b) => a.created - b.created)
      .shift()

    if (!subscription) {
      console.log('No current subscription in workspace:', workspace.id)
      continue
    }

    const subscriptionItem = subscription.items.data.find(
      (item) =>
        item.price.id === process.env.STRIPE_PERSONAL_CHATS_PRICE_ID_OLD ||
        item.price.id === process.env.STRIPE_BUSINESS_CHATS_PRICE_ID_OLD,
    )

    if (!subscriptionItem) {
      console.log('Could not find subscriptio item. Skipping...')
      continue
    }

    await stripe.subscriptionItems.update(subscriptionItem.id, {
      price:
        workspace.billingPlan.key === 'PERSONAL'
          ? process.env.STRIPE_PERSONAL_CHATS_PRICE_ID
          : process.env.STRIPE_BUSINESS_CHATS_PRICE_ID,
    })
  }
}

migrateSubscriptionItemPriceId()
