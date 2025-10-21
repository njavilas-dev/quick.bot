import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const prismaWithLogging = withQueryLogging()

const updateBot = async () => {
  await promptAndSetEnvironment('production')

  const botId = await p.text({
    message: 'Bot ID?',
  })

  if (!botId || p.isCancel(botId)) process.exit()

  const bot = await prismaWithLogging.bot.update({
    where: {
      id: botId,
    },
    data: {
      riskLevel: -1,
    },
  })

  console.log(bot)
}

updateBot()
