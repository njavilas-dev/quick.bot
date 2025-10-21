import { dequal } from 'dequal'
import { Bot, PublicBot } from '@quickbot.io/schemas'

export const isPublished = (bot?: Bot, publicBot?: PublicBot) => {

  if (!bot || !publicBot) return false

  return !(
    dequal(
      JSON.parse(JSON.stringify(bot.groups)),
      JSON.parse(JSON.stringify(publicBot.groups))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(bot.settings)),
      JSON.parse(JSON.stringify(publicBot.settings)),
    ) &&
    dequal(
      JSON.parse(JSON.stringify(bot.theme)),
      JSON.parse(JSON.stringify(publicBot.theme))
    ) &&
    dequal(
      JSON.parse(JSON.stringify(bot.variables)),
      JSON.parse(JSON.stringify(publicBot.variables)),
    ) &&
    dequal(
      JSON.parse(JSON.stringify(bot.events)),
      JSON.parse(JSON.stringify(publicBot.events))
    )
  )
}
