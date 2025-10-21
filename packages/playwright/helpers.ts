import { readFileSync } from 'fs'
import {
  Prisma,
  BillingPlanType,
  User,
  Workspace,
  WorkspaceRole,
} from '@quickbot.io/prisma'
import prisma from '@quickbot.io/lib/prisma'
import { createId } from '@quickbot.io/lib/createId'
import { crypt } from '@quickbot.io/lib/crypt-password'
import { PlanWithoutChatTiers, Bot, BotV6, BlockV5, BlockV6, PublicBot } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib/utils'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { EventType } from '@quickbot.io/schemas/features/events/constants'

export const parseBotData = (bot: Bot) => ({
  ...bot,
  resultsTablePreferences:
    bot.resultsTablePreferences === null ? Prisma.DbNull : bot.resultsTablePreferences,
  events: bot.events === null ? Prisma.DbNull : bot.events,
})

export const parseTestBot = (partialBot: Partial<Bot>): Bot => {
  const version = partialBot.version ?? ('3' as any)

  return {
    id: createId(),
    version,
    workspaceId: businessWorkspaceId,
    folderId: null,
    name: 'My Bot',
    theme: {},
    settings: {},
    publicId: null,
    updatedAt: new Date(),
    createdAt: new Date(),
    customDomain: null,
    icon: null,
    selectedThemeTemplateId: null,
    isArchived: false,
    isClosed: false,
    resultsTablePreferences: null,
    whatsAppCredentialsId: null,
    riskLevel: null,
    events:
      version === '6'
        ? [
          {
            id: 'group1',
            type: EventType.START,
            graphCoordinates: { x: 0, y: 0 },
            outgoingEdgeId: 'edge1',
          },
        ]
        : null,
    variables: [{ id: 'var1', name: 'var1' }],
    ...partialBot,
    edges: [
      {
        id: 'edge1',
        from: { blockId: 'block0' },
        to: { groupId: 'group1' },
      },
    ],
    groups: (version === '6'
      ? partialBot.groups ?? []
      : [
        {
          id: 'group0',
          title: 'Group #0',
          blocks: [
            {
              id: 'block0',
              type: 'start',
              label: 'Start',
              outgoingEdgeId: 'edge1',
            },
          ],
          graphCoordinates: { x: 0, y: 0 },
        },
        ...(partialBot.groups ?? []),
      ]) as any[],
  }
}

export const parseBotToPublicBot = (
  id: string,
  bot: Bot,
): Omit<PublicBot, 'createdAt' | 'updatedAt'> => ({
  id,
  version: bot.version,
  groups: bot.groups,
  botId: bot.id,
  theme: bot.theme,
  settings: bot.settings,
  variables: bot.variables,
  edges: bot.edges,
  events: bot.events,
})

type Options = {
  withGoButton?: boolean
}

export const parseDefaultGroupWithBlock = (
  block: Partial<BlockV6>,
  options?: Options,
): Pick<BotV6, 'groups'> => ({
  groups: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: 'group1',
      blocks: [
        options?.withGoButton
          ? {
            id: 'block1',
            groupId: 'group1',
            type: InputBlockType.CHOICE,
            items: [
              {
                id: 'item1',
                blockId: 'block1',
                content: 'Go',
              },
            ],
            options: {},
          }
          : undefined,
        {
          id: 'block2',
          ...block,
        } as BlockV5,
      ].filter(isDefined) as BlockV6[],
      title: 'Group #1',
    },
  ],
})

export const PRIMARY_TEST_USER = {
  email: 'user.primary@test.com',
  password: 'Abcdef1!', //NOSONAR
  name: 'Francisco',
  image: 'https://avatars.githubusercontent.com/u/6652831?v=4',
  displayedInAppNotifications: {
    ['graphGestureNotification']: true,
  },
}

export const SECONDARY_TEST_USER = {
  email: 'user.secondary@test.com',
  password: 'Abcdef1!', //NOSONAR
  name: 'James Doe',
  image: 'https://avatars.githubusercontent.com/u/6652831?v=4',
  displayedInAppNotifications: {
    ['graphGestureNotification']: true,
  },
}
export const wooCommerceTestUrl = 'https://wp.dev.quick.bot/'
export const wooCommerceTestConsumerKey = 'ck_586097ab46fbb018096d51b8a5de956f35ea20cb'
export const wooCommerceTestConsumerSecret = 'cs_a43319ba2d410874551903cc3d1af24bebd5f0a1'
export const wordpressConnectionName = 'WordPressTest'
export const wordpressClientId = 'gUPBxIeDZhuXAbaqYrbadRRabqUrBsKX'
export const wordpressClientSecret = 'GFyAuIHdftaxhzmtPZxpqsjVHmqWJAGZ'
export const wordpressTokenEndpoint = 'https://wp.dev.quick.bot/wp-json/moserver/token'
export const wordpressEmail = 'marcelo.godoy@urbiport.com'
export const wordpressPassword = 'Jugs5dPXW7)5Rv7wxkKlw^)w' //NOSONAR
export const apiToken = 'jirowjgrwGREHE'
export const freeWorkspaceId = 'freeWorkspace'
export const personalWorkspaceId = 'personalWorkspace'
export const businessWorkspaceId = 'businessWorkspace'
export const enterpriseWorkspaceId = 'enterpriseWorkspace'
export const lifetimeWorkspaceId = 'lifetimeWorkspaceId'
export const unlimitedWorkspaceId = 'unlimitedWorkspaceId'
export const customPlanId = 'customPlanId'

export const getPrimaryUser = async () => {
  const primaryUser = await getUserByEmail(PRIMARY_TEST_USER.email)
  if (!primaryUser) {
    throw new Error('Primary user not found')
  }
  return primaryUser
}
export const getSecondaryUser = async () => {
  return await getUserByEmail(SECONDARY_TEST_USER.email)
}

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    accounts: true
    workspaces: true
  }
}>

export const getUserByEmail = async (email: string): Promise<UserWithRelations | null> => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
      workspaces: true,
    },
  })
}

type CreateTestUserOptions = {
  email: string
  password: string
  name: string
  workspaceId?: string
  skipWorkspaceCreation?: boolean
  isEmailVerified?: boolean
}

/**
 * Creates a test user with credentials and ensures the user is properly set up for testing.
 * This includes creating a UserAuth entry with verified status.
 *
 * @param options Configuration options for the test user
 * @returns The created user
 */
export const createOrUpdateTestUser = async ({
  email,
  password,
  name,
  workspaceId,
  skipWorkspaceCreation = false,
  isEmailVerified = true,
}: CreateTestUserOptions): Promise<User> => {
  // Retrieve an existing user by email or create a new one.
  let user = await getUserByEmail(email)
  if (!user) {
    user = await createNewUser({ email, name, isEmailVerified })
  } else {
    user = await updateExistingUser({ user, name, isEmailVerified })
  }

  if (!user) {
    throw new Error('Primary user not found')
  }

  // Ensure notification settings exist for the user.
  await ensureUserNotifications(user.id)

  // Create workspace and add the user as a member if needed.
  if (!skipWorkspaceCreation) {
    const actualWorkspaceId = workspaceId || createId()
    await ensureWorkspace(actualWorkspaceId, name)
    await ensureWorkspaceMembership(user.id, actualWorkspaceId)
  }

  // Handle user authentication (credentials) entry.
  await handleUserAuth(user, email, password)

  return user
}

/**
 * Creates a new user with default properties and overrides.
 */
const createNewUser = async ({
  email,
  name,
  isEmailVerified,
}: {
  email: string
  name: string
  isEmailVerified: boolean
}): Promise<UserWithRelations> => {
  return await prisma.user.create({
    data: {
      id: createId(),
      name,
      email,
      emailVerified: isEmailVerified ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      company: null,
      image: PRIMARY_TEST_USER.image,
      preferredAppAppearance: null,
      onboardingCategories: [],
      displayedInAppNotifications: PRIMARY_TEST_USER.displayedInAppNotifications,
      referral: null,
      apiTokens: {
        create: {
          name: 'Default Test Token',
          token: createId(),
        },
      },
    },
    include: {
      accounts: true,
      workspaces: true,
    },
  })
}

/**
 * Updates an existing user with default properties.
 */
const updateExistingUser = async ({
  user,
  name,
  isEmailVerified,
}: {
  user: User
  name: string
  isEmailVerified: boolean
}): Promise<UserWithRelations> => {
  return await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      emailVerified: isEmailVerified ? new Date() : user.emailVerified,
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      image: PRIMARY_TEST_USER.image,
      displayedInAppNotifications: PRIMARY_TEST_USER.displayedInAppNotifications,
    },
    include: { accounts: true, workspaces: true },
  })
}

/**
 * Ensures the user has notification settings.
 */
const ensureUserNotifications = async (userId: string): Promise<void> => {
  const existingNotification = await prisma.userNotification.findUnique({
    where: { userId },
  })
  if (!existingNotification) {
    await prisma.userNotification.create({
      data: {
        userId,
        almostReachedChatsLimit: true,
        reachedChatsLimit: true,
        botAnswersResult: true,
      },
    })
  }
}

/**
 * Ensures a workspace exists; if not, it creates one using the default billing plan.
 */
const ensureWorkspace = async (actualWorkspaceId: string, name: string): Promise<void> => {
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { id: actualWorkspaceId },
  })
  if (!existingWorkspace) {
    const freePlan = await getBillingPlanFree()
    await prisma.workspace.create({
      data: {
        id: actualWorkspaceId,
        name: `${name}'s Workspace`,
        billingPlanId: freePlan.id,
      },
    })
  }
}

/**
 * Ensures the user is a member of the specified workspace.
 */
const ensureWorkspaceMembership = async (userId: string, workspaceId: string): Promise<void> => {
  const existingMembership = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
  })
  if (!existingMembership) {
    await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId,
        role: WorkspaceRole.ADMIN,
      },
    })
  }
}

/**
 * Handles user authentication (credentials) entry.
 */
const handleUserAuth = async (
  user: UserWithRelations,
  email: string,
  password: string,
): Promise<void> => {
  if (user.accounts.length === 0) {
    console.log(`Adding credentials to user: ${email}`)
    try {
      // Check if an auth entry for the same provider and providerAccountId exists.
      const existingAuth = await prisma.userAuth.findFirst({
        where: {
          provider: 'credentials',
          providerAccountId: email,
        },
      })

      if (existingAuth) {
        // If the existing auth belongs to another user, update it to link to the current user.
        if (existingAuth.userId !== user.id) {
          console.log(`Updating existing credentials to link to user: ${email}`)
          await prisma.userAuth.update({
            where: { id: existingAuth.id },
            data: {
              userId: user.id,
              password: crypt(password),
              is_verified: true,
            },
          })
        } else {
          console.log(`Credentials already exist for user: ${email}`)
        }
      } else {
        // Create new credentials if they do not exist.
        await prisma.userAuth.create({
          data: {
            userId: user.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: email,
            username: email,
            password: crypt(password),
            is_verified: true,
          },
        })
      }
    } catch (error) {
      console.error(`Error handling credentials for user ${email}:`, error)
    }
  } else {
    // Ensure that at least one account is verified.
    const hasVerifiedAccount = user.accounts.some((account) => account.is_verified === true)
    if (!hasVerifiedAccount) {
      console.log(`Updating user account to be verified: ${email}`)
      await prisma.userAuth.update({
        where: { id: user.accounts[0].id },
        data: { is_verified: true },
      })
    }
  }
}

type CreateFakeResultsProps = {
  botId: string
  count: number
  customResultIdPrefix?: string
  isChronological?: boolean
}

const createAnswers = ({
  count,
  resultIdPrefix,
}: { resultIdPrefix: string } & Pick<CreateFakeResultsProps, 'count'>) => {
  return prisma.answerV2.createMany({
    data: [
      ...Array.from(Array(count)).map((_, idx) => ({
        resultId: `${resultIdPrefix}-result${idx}`,
        content: `content${idx}`,
        blockId: 'block1',
      })),
    ],
  })
}

/**
 * Deletes a user by email and all related entities to ensure clean removal.
 *
 * @param email The email of the user to delete
 * @returns The deleted user record (optional)
 */
export const deleteUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
      workspaces: true,
    },
  })

  if (!user) {
    console.warn(`User with email ${email} not found`)
    return null
  }

  const userId = user.id

  // Delete associated auth accounts
  await prisma.userAuth.deleteMany({
    where: { userId },
  })

  // Delete user notification settings
  await prisma.userNotification.deleteMany({
    where: { userId },
  })

  // Delete workspace memberships
  await prisma.workspaceMember.deleteMany({
    where: { userId },
  })

  // Delete the user
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  })

  return deletedUser
}

export const injectFakeResults = async ({
  count,
  botId,
  customResultIdPrefix,
  isChronological,
}: CreateFakeResultsProps) => {
  const resultIdPrefix = customResultIdPrefix ?? createId()

  const fakeResults = Array.from(Array(count)).map((_, idx) => {
    const today = new Date()
    const rand = Math.random() //NOSONAR
    return {
      id: `${resultIdPrefix}-result${idx}`,
      botId: botId,
      createdAt: isChronological
        ? new Date(today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx))
        : new Date(),
      isCompleted: rand > 0.5,
      hasStarted: true,
      variables: [],
    } satisfies Prisma.BotResultCreateManyInput
  })

  await prisma.botResult.createMany({
    data: fakeResults,
  })

  return await createAnswers({ resultIdPrefix, count })
}

export const cleanFakeResults = async (botId: string) => {
  if (!botId) {
    throw new Error('BotId is required')
  }

  await prisma.answerV2.deleteMany({
    where: {
      result: {
        botId: botId,
      },
    },
  })

  await prisma.botResult.deleteMany({
    where: {
      botId: botId,
    },
  })

  console.log(`Deleted fake results for botId: ${botId}`)
}

export const importBotInDatabase = async (path: string, updates?: Partial<Bot>) => {
  const botFile = JSON.parse(readFileSync(path).toString())
  const bot = {
    events: null,
    ...botFile,
    workspaceId: unlimitedWorkspaceId,
    ...updates,
  }
  if (botFile.events !== undefined) {
    bot.events = botFile.events
  }
  try {
    // Use upsert instead of create to handle existing bots
    await prisma.bot.upsert({
      where: { id: bot.id },
      create: parseBotData(bot),
      update: parseBotData(bot),
    })

    const parseBotToPublic = parseBotToPublicBot(
      updates?.id ? `${updates?.id}-public` : 'publicBot',
      bot,
    )

    // Use upsert for the public bot as well
    return prisma.botPublic.upsert({
      where: { botId: bot.id },
      create: {
        id: parseBotToPublic.id,
        version: parseBotToPublic.version,
        groups: parseBotToPublic.groups,
        theme: parseBotToPublic.theme,
        settings: parseBotToPublic.settings,
        variables: parseBotToPublic.variables,
        edges: parseBotToPublic.edges,
        botId: parseBotToPublic.botId,
        events: bot.events === null ? Prisma.DbNull : bot.events,
      },
      update: {
        version: parseBotToPublic.version,
        groups: parseBotToPublic.groups,
        theme: parseBotToPublic.theme,
        settings: parseBotToPublic.settings,
        variables: parseBotToPublic.variables,
        edges: parseBotToPublic.edges,
        events: bot.events === null ? Prisma.DbNull : bot.events,
      },
    })
  } catch (e) {
    console.error(`Error creating bot id: ${bot.id}`)
    console.error(e)
  }
}

export const deleteWorkspaces = async (workspaceIds: string[]) => {
  await prisma.workspace.deleteMany({
    where: { id: { in: workspaceIds } },
  })
}

/**
 * Find the default billing plan for workspaces
 */
export const getBillingPlanByKey = async (key: BillingPlanType): Promise<PlanWithoutChatTiers> => {
  const billingPlan = await prisma.workspaceBillingPlan.findFirst({
    where: {
      key,
    },
  })
  if (!billingPlan) {
    throw new Error(`No ${key} billing plan found in database`)
  }
  return billingPlan
}
/**
 * Find the default billing plan for workspaces
 */
export const getBillingPlanFree = async (): Promise<PlanWithoutChatTiers> => {
  return await getBillingPlanByKey(BillingPlanType.FREE)
}

export const getBillingPlanPersonal = async (): Promise<PlanWithoutChatTiers> => {
  return await getBillingPlanByKey(BillingPlanType.PERSONAL)
}

export const getBillingPlanEnterprise = async (): Promise<PlanWithoutChatTiers> => {
  return await getBillingPlanByKey(BillingPlanType.ENTERPRISE)
}

export const createWorkspaces = async (workspaces: Partial<Workspace>[]) => {
  // Ensure we have a valid user
  const primaryUser = await getPrimaryUser()

  // Get default billing plan
  const freePlan = await getBillingPlanFree()

  // Create workspaces
  const workspaceIds = workspaces.map((workspace) => workspace.id ?? createId())

  await prisma.workspace.createMany({
    data: workspaces.map((workspace, index) => ({
      id: workspaceIds[index],
      name: 'Free workspace',
      billingPlanId: freePlan.id,
      ...workspace,
    })),
    skipDuplicates: true,
  })

  // Create workspace memberships one by one to avoid batch operation issues
  for (let index = 0; index < workspaces.length; index++) {
    const workspaceId = workspaceIds[index]

    // Check if membership already exists
    const existingMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: primaryUser.id,
        workspaceId: workspaceId,
      },
    })

    if (!existingMembership) {
      try {
        await prisma.workspaceMember.create({
          data: {
            userId: primaryUser.id,
            workspaceId: workspaceId,
            role: WorkspaceRole.ADMIN,
          },
        })
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.warn(
            `Membership already exists (race condition): ${primaryUser.id} → ${workspaceId}`,
          )
        } else {
          console.error(
            `Failed to create workspace membership for workspaceId ${workspaceId}:`,
            error,
          )
        }
      }
    } else {
      console.log(`Workspace membership already exists: ${primaryUser.id} → ${workspaceId}`)
    }
  }

  return workspaceIds
}

export const createBots = async (partialBots: Partial<BotV6>[]) => {
  try {
    const botsWithId = partialBots.map((bot) => {
      const botId = bot.id ?? createId()
      return {
        ...bot,
        id: botId,
        publicId: bot.publicId ?? botId + '-public',
      }
    })

    // Create the bots
    await prisma.bot.createMany({
      data: botsWithId.map(parseTestBot).map(parseBotData),
      skipDuplicates: true,
    })

    // Create or update the public bots
    for (const t of botsWithId) {
      const parsedBot = parseTestBot(t)
      const publicBot = parseBotToPublicBot(t.publicId!, parsedBot)

      await prisma.botPublic.upsert({
        where: { id: publicBot.id },
        update: {
          version: publicBot.version,
          groups: publicBot.groups,
          theme: publicBot.theme,
          settings: publicBot.settings,
          variables: publicBot.variables,
          edges: publicBot.edges,
          events: publicBot.events === null ? Prisma.DbNull : publicBot.events,
        },
        create: {
          id: publicBot.id,
          version: publicBot.version,
          groups: publicBot.groups,
          theme: publicBot.theme,
          botId: publicBot.botId,
          settings: publicBot.settings,
          variables: publicBot.variables,
          edges: publicBot.edges,
          events: publicBot.events === null ? Prisma.DbNull : publicBot.events,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error in createBots:', error)
    throw error
  }
}

export const updateBot = async (partialBot: Partial<Bot> & { id: string }) => {
  const bot = (await prisma.bot.findUnique({
    where: { id: partialBot.id },
  })) as Bot

  if (!bot) {
    throw new Error(`Bot with id ${partialBot.id} not found`)
  }

  await prisma.bot.updateMany({
    where: { id: partialBot.id },
    data: parseBotData(bot),
  })
  return prisma.botPublic.updateMany({
    where: { botId: partialBot.id },
    data: {
      ...partialBot,
      events: partialBot.events === null ? Prisma.DbNull : partialBot.events,
    },
  })
}

export const createFolder = (workspaceId: string, name: string) =>
  prisma.workspaceDashboardFolder.create({
    data: {
      workspaceId,
      name,
    },
  })
