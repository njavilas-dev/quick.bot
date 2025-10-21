import { PublicBot, PublicBotV6, Bot, BotV6 } from '@quickbot.io/schemas'
import { migrateBotFromV3ToV4 } from './migrateBotFromV3ToV4'
import { migrateBotFromV5ToV6 } from './migrateBotFromV5ToV6'

export const migrateBot = async (bot: Bot): Promise<BotV6> => {
  if (bot.version === '6') return bot
  let migratedBot: any = bot
  if (migratedBot.version === '3') migratedBot = await migrateBotFromV3ToV4(bot)
  if (migratedBot.version === '4' || migratedBot.version === '5')
    migratedBot = migrateBotFromV5ToV6(migratedBot)
  return migratedBot
}

export const migratePublicBot = async (bot: PublicBot): Promise<PublicBotV6> => {
  if (bot.version === '6') return bot
  let migratedBot: any = bot
  if (migratedBot.version === '3') migratedBot = await migrateBotFromV3ToV4(bot)
  if (migratedBot.version === '4' || migratedBot.version === '5')
    migratedBot = migrateBotFromV5ToV6(migratedBot)
  return migratedBot
}
