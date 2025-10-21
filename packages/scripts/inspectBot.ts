import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'
import { isCancel } from '@clack/prompts'

const prismaWithLogging = withQueryLogging()

const inspectBot = async () => {
  await promptAndSetEnvironment('production')

  const type = await p.select<any, 'id' | 'publicId'>({
    message: 'Select way',
    options: [
      { label: 'ID', value: 'id' },
      { label: 'Public ID', value: 'publicId' },
    ],
  })

  if (!type || isCancel(type)) process.exit()

  const val = await p.text({
    message: 'Enter value',
  })

  if (!val || isCancel(val)) process.exit()

  const bot = await prismaWithLogging.bot.findFirst({
    where: {
      [type]: val,
    },
    select: {
      id: true,
      name: true,
      riskLevel: true,
      publicId: true,
      customDomain: true,
      createdAt: true,
      isArchived: true,
      isClosed: true,
      publishedBot: {
        select: {
          id: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          billingPlan: true,
          isPastDue: true,
          isSuspended: true,
          members: {
            select: {
              role: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!bot) {
    console.log('Bot not found')
    return
  }

  console.log(`https://app.quick.bot/bots/${bot.id}/flow`)

  console.log(JSON.stringify(bot, null, 2))
}

inspectBot()
