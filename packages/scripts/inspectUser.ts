import { isCancel, text, confirm } from '@clack/prompts'
import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'

const prismaWithLogging = withQueryLogging()

const inspectUser = async () => {
  await promptAndSetEnvironment('production')
  const email = await text({
    message: 'User email',
  })

  if (!email || isCancel(email)) process.exit()

  const user = await prismaWithLogging.user.findFirst({
    where: {
      email,
    },
    select: {
      name: true,
      createdAt: true,
      lastActivityAt: true,
      company: true,
      onboardingCategories: true,
      workspaces: {
        where: {
          role: 'ADMIN',
        },
        select: {
          workspace: {
            select: {
              id: true,
              name: true,
              billingPlan: true,
              isVerified: true,
              stripeId: true,
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  role: true,
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
                where: {
                  user: { email: { not: email } },
                },
              },
              additionalStorageIndex: true,
              bots: {
                orderBy: {
                  updatedAt: 'desc',
                },
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                  riskLevel: true,
                  publishedBot: {
                    select: {
                      bot: {
                        select: { publicId: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  console.log(JSON.stringify(user, null, 2))

  const computeResults = await confirm({
    message: 'Compute collected results?',
  })

  if (!computeResults || isCancel(computeResults)) process.exit()

  console.log('Computing collected results...')

  for (const workspace of user?.workspaces ?? []) {
    for (const bot of workspace.workspace.bots) {
      const resultsCount = await prismaWithLogging.botResult.count({
        where: {
          botId: bot.id,
          isArchived: false,
          hasStarted: true,
        },
      })

      if (resultsCount === 0) continue

      console.log(`Bot "${bot.name}" (${bot.id}) has ${resultsCount} collected results`)
    }
  }
}

inspectUser()
