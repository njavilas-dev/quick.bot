import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import { archiveResults } from '@quickbot.io/results/archiveResults'
import { Bot } from '@quickbot.io/schemas'

const prismaWithLogging = withQueryLogging()

export const cleanDatabase = async () => {
  await promptAndSetEnvironment('production')

  console.log('Starting database cleanup...')
  await deleteOldChatSessions()
  await deleteExpiredAppSessions()
  await deleteExpiredVerificationTokens()
  const isFirstOfMonth = new Date().getDate() === 1
  if (isFirstOfMonth) {
    await deleteArchivedResults()
    await deleteArchivedBots()
    await resetBillingProps()
  }
  console.log('Database cleaned!')
}

const deleteArchivedBots = async () => {
  const lastDayTwoMonthsAgo = new Date()
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1)
  lastDayTwoMonthsAgo.setDate(0)



  console.log(`Fetching archived bots...`)
  const bots = await prismaWithLogging.bot.findMany({
    where: {
      updatedAt: {
        lte: lastDayTwoMonthsAgo,
      },
      isArchived: true,
    },
    select: { id: true },
  })

  console.log(`Deleting ${bots.length} archived bots...`)

  const chunkSize = 1000
  for (let i = 0; i < bots.length; i += chunkSize) {
    const chunk = bots.slice(i, i + chunkSize)
    await deleteResultsFromArchivedBotsIfAny(chunk)
    await prismaWithLogging.bot.deleteMany({
      where: {
        id: {
          in: chunk.map((bot) => bot.id),
        },
      },
    })
  }
  console.log('Done!')
}

const deleteArchivedResults = async () => {
  const resultsBatch = 10000
  const lastDayTwoMonthsAgo = new Date()
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1)
  lastDayTwoMonthsAgo.setDate(0)
  let totalResults
  do {
    console.log(`Fetching ${resultsBatch} archived results...`)


    const results = (await prismaWithLogging.$queryRaw`
      SELECT id
      FROM Result
      WHERE createdAt <= ${lastDayTwoMonthsAgo}
        AND isArchived = true
      LIMIT ${resultsBatch}
    `) as { id: string }[]
    totalResults = results.length
    console.log(`Deleting ${results.length} archived results...`)
    const chunkSize = 1000
    for (let i = 0; i < results.length; i += chunkSize) {
      const chunk = results.slice(i, i + chunkSize)
      await prismaWithLogging.botResult.deleteMany({
        where: {
          id: {
            in: chunk.map((result) => result.id),
          },
        },
      })
    }
  } while (totalResults === resultsBatch)

  console.log('Done!')
}

const deleteOldChatSessions = async () => {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  let totalChatSessions



  do {
    const chatSessions = await prismaWithLogging.chatSession.findMany({
      where: {
        updatedAt: {
          lte: twoDaysAgo,
        },
      },
      select: {
        id: true,
      },
      take: 80000,
    })

    totalChatSessions = chatSessions.length

    console.log(`Deleting ${chatSessions.length} old chat sessions...`)
    const chunkSize = 1000
    for (let i = 0; i < chatSessions.length; i += chunkSize) {
      const chunk = chatSessions.slice(i, i + chunkSize)
      await prismaWithLogging.chatSession.deleteMany({
        where: {
          id: {
            in: chunk.map((chatSession) => chatSession.id),
          },
        },
      })
    }
  } while (totalChatSessions === 80000)
}

const deleteExpiredAppSessions = async () => {


  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const { count } = await prismaWithLogging.userSession.deleteMany({
    where: {
      expires: {
        lte: threeDaysAgo,
      },
    },
  })
  console.log(`Deleted ${count} expired user sessions.`)
}

const deleteExpiredVerificationTokens = async () => {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  let totalVerificationTokens

  do {
    const verificationTokens = await prismaWithLogging.userVerificationToken.findMany({
      where: {
        expires: {
          lte: threeDaysAgo,
        },
      },
      select: {
        token: true,
      },
      take: 80000,
    })

    totalVerificationTokens = verificationTokens.length

    console.log(`Deleting ${verificationTokens.length} expired tokens...`)
    const chunkSize = 1000
    for (let i = 0; i < verificationTokens.length; i += chunkSize) {
      const chunk = verificationTokens.slice(i, i + chunkSize)
      await prismaWithLogging.userVerificationToken.deleteMany({
        where: {
          token: {
            in: chunk.map((verificationToken) => verificationToken.token),
          },
        },
      })
    }
  } while (totalVerificationTokens === 80000)
  console.log('Done!')
}

const resetBillingProps = async () => {
  console.log('Resetting billing props...')
  const { count } = await prismaWithLogging.workspace.updateMany({
    where: {
      OR: [
        {
          isQuarantined: true,
        },
        {
          chatsLimitFirstEmailSentAt: { not: null },
        },
      ],
    },
    data: {
      isQuarantined: false,
      chatsLimitFirstEmailSentAt: null,
      chatsLimitSecondEmailSentAt: null,
    },
  })
  console.log(`Resetted ${count} workspaces.`)
}

const deleteResultsFromArchivedBotsIfAny = async (botIds: { id: string }[]) => {
  console.log('Checking for archived bots with non-archived results...')
  const archivedBotsWithResults = (await prismaWithLogging.bot.findMany({
    where: {
      id: {
        in: botIds.map((bot) => bot.id),
      },
      isArchived: true,
      results: {
        some: {},
      },
    },
    select: {
      id: true,
      groups: true,
    },
  })) as Pick<Bot, 'groups' | 'id'>[]
  if (archivedBotsWithResults.length === 0) return
  console.log(`Found ${archivedBotsWithResults.length} archived bots with non-archived results.`)
  for (const archivedBot of archivedBotsWithResults) {
    await archiveResults(prismaWithLogging)({
      bot: archivedBot,
      resultsFilter: {
        botId: archivedBot.id,
      },
    })
  }
  console.log('Delete archived results...')
  await deleteArchivedResults()
}

cleanDatabase().then()
