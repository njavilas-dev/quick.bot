import { BillingPlanType } from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { encrypt } from '@quickbot.io/lib/api/encryption/encrypt'
import { env } from '@quickbot.io/env'
import { StripeCredentials } from '@quickbot.io/schemas'
import {
  apiToken,
  freeWorkspaceId,
  personalWorkspaceId,
  businessWorkspaceId,
  enterpriseWorkspaceId,
  lifetimeWorkspaceId,
  unlimitedWorkspaceId,
  customPlanId,
  getUserByEmail,
  createOrUpdateTestUser,
  PRIMARY_TEST_USER,
  SECONDARY_TEST_USER,
  createWorkspaces,
} from './helpers'

const teardownDatabase = async () => {
  const primaryUser = await getUserByEmail(PRIMARY_TEST_USER.email)
  const secondaryUser = await getUserByEmail(SECONDARY_TEST_USER.email)

  if (!primaryUser?.id && !secondaryUser?.id) return

  const userIds = [primaryUser?.id, secondaryUser?.id].filter(Boolean) as string[]

  // Clean up test bots before deleting other resources
  // Delete public versions of test bots first (due to foreign key constraints)
  await prisma.botPublic.deleteMany({
    where: {
      botId: {
        in: ['chat-sub-bot', 'starting-with-input'],
      },
    },
  })

  // Delete test bots
  await prisma.bot.deleteMany({
    where: {
      id: {
        in: ['chat-sub-bot', 'starting-with-input'],
      },
    },
  })

  await prisma.webhook.deleteMany({
    where: {
      bot: {
        workspace: {
          members: {
            some: { userId: { in: userIds } },
          },
        },
      },
    },
  })

  await prisma.workspaceMember.deleteMany({
    where: {
      userId: { in: userIds },
    },
  })

  await prisma.workspace.deleteMany({
    where: {
      OR: [
        {
          members: {
            some: { userId: { in: userIds } },
          },
        },
        {
          id: {
            in: [
              businessWorkspaceId,
              freeWorkspaceId,
              personalWorkspaceId,
              lifetimeWorkspaceId,
              unlimitedWorkspaceId,
              enterpriseWorkspaceId,
            ],
          },
        },
      ],
    },
  })

  await prisma.userAuth.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.userApiToken.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.userNotification.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  await prisma.workspaceBillingPlan.deleteMany({ where: { id: customPlanId } })
}

const setupCustomPlan = async () => {
  await prisma.workspaceBillingPlan.upsert({
    where: { id: customPlanId },
    update: {},
    create: {
      id: customPlanId,
      name: 'Custom Plan',
      key: BillingPlanType.CUSTOM,
      chatsLimit: 100000,
      storageLimit: 50,
      membersLimit: 20,
      price: 0,
      isSystem: false,
      allowResults: true,
    },
  })
}

const setupWorkspaces = async () => {
  const systemPlans = await prisma.workspaceBillingPlan.findMany({ where: { isSystem: true } })
  const planIds = systemPlans.reduce((acc, plan) => {
    acc[plan.key] = plan.id
    return acc
  }, {} as Record<BillingPlanType, string>)

  const workspaces = [
    {
      id: freeWorkspaceId,
      name: 'Free workspace',
      billingPlanId: planIds[BillingPlanType.FREE],
    },
    {
      id: personalWorkspaceId,
      name: 'Personal workspace',
      stripeId: env.PLAYWRIGHT_STRIPE_PERSONAL_CUSTOMER_ID,
      billingPlanId: planIds[BillingPlanType.PERSONAL],
    },
    {
      id: businessWorkspaceId,
      name: 'Business workspace',
      stripeId: env.PLAYWRIGHT_STRIPE_BUSINESS_CUSTOMER_ID,
      billingPlanId: planIds[BillingPlanType.BUSINESS],
    },
    {
      id: enterpriseWorkspaceId,
      name: 'Enterprise workspace',
      stripeId: env.PLAYWRIGHT_STRIPE_ENTERPRISE_CUSTOMER_ID,
      billingPlanId: planIds[BillingPlanType.ENTERPRISE],
    },
    {
      id: unlimitedWorkspaceId,
      name: 'Unlimited workspace',
      billingPlanId: planIds[BillingPlanType.UNLIMITED],
    },
  ]

  const existingIds = new Set(
    (
      await prisma.workspace.findMany({
        where: { id: { in: workspaces.map((w) => w.id) } },
        select: { id: true },
      })
    ).map((w) => w.id),
  )

  const workspacesToCreate = workspaces.filter((w) => !existingIds.has(w.id))
  if (workspacesToCreate.length === 0) {
    return
  }

  await createWorkspaces(workspacesToCreate)
}

const setupUsers = async () => {
  const primaryUser = await createOrUpdateTestUser(PRIMARY_TEST_USER)
  await createOrUpdateTestUser(SECONDARY_TEST_USER)

  const existingTokens = await prisma.userApiToken.findMany({
    where: { userId: primaryUser.id },
    select: { name: true },
  })

  const existingTokenNames = new Set(existingTokens.map((t) => t.name))

  const now = Date.now()
  const tokensToCreate = [
    {
      userId: primaryUser.id,
      name: 'Token 1',
      token: apiToken,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7), // 1 semana atrás
    },
    {
      userId: primaryUser.id,
      name: 'Github',
      token: 'jirowjgrwGREHEgdrgithub',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 6),
    },
    {
      userId: primaryUser.id,
      name: 'N8n',
      token: 'jirowjgrwGREHrgwhrwn8n',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5),
    },
  ].filter((token) => !existingTokenNames.has(token.name))

  if (tokensToCreate.length > 0) {
    await prisma.userApiToken.createMany({ data: tokensToCreate, skipDuplicates: true })
  }
}

const setupCredentials = async () => {
  const existingCredentials = await prisma.workspaceCredential.findMany({
    where: { workspaceId: businessWorkspaceId },
    select: { name: true, type: true },
  })

  const existingKeys = new Set(existingCredentials.map((c) => `${c.name}:${c.type}`))

  const credentialsToCreate = []

  if (!existingKeys.has('services@urbiport.com:google sheets')) {
    const { encryptedData, iv } = await encrypt({
      expiry_date: Date.now() + 1000 * 60 * 60 * 24 * 30,
      access_token: env.PLAYWRIGHT_GOOGLE_ACCESS_TOKEN,
      refresh_token: env.PLAYWRIGHT_GOOGLE_REFRESH_TOKEN,
    })

    credentialsToCreate.push({
      name: 'services@urbiport.com',
      type: 'google sheets',
      data: encryptedData,
      workspaceId: businessWorkspaceId,
      iv,
    })
  }

  if (!existingKeys.has('Test:stripe')) {
    const { encryptedData, iv } = await encrypt({
      test: {
        publicKey: env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
        secretKey: env.STRIPE_SECRET_KEY,
      },
      live: {
        publicKey: env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '',
        secretKey: env.STRIPE_SECRET_KEY ?? '',
      },
    } satisfies StripeCredentials['data'])

    credentialsToCreate.push({
      id: 'stripe',
      name: 'Test',
      type: 'stripe',
      data: encryptedData,
      workspaceId: businessWorkspaceId,
      iv,
    })
  }

  if (credentialsToCreate.length > 0) {
    await prisma.workspaceCredential.createMany({
      data: credentialsToCreate,
      skipDuplicates: true,
    })
  }
}

export const setupDatabase = async () => {
  try {
    await teardownDatabase()
    await setupCustomPlan()
    await setupUsers()
    await setupWorkspaces()
    await setupCredentials()
    console.log('✅ Database setup complete.')
  } catch (err) {
    console.error('❌ Error during database setup:', err)
    throw err
  } finally {
    await prisma.$disconnect()
  }
}
