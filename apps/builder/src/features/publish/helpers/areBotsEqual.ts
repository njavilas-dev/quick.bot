import { omit } from '@quickbot.io/lib'
import { Bot } from '@quickbot.io/schemas'
import { dequal } from 'dequal'

export const areBotsEqual = (botA: Bot, botB: Bot) =>
  dequal(
    JSON.parse(JSON.stringify(omit(botA, 'updatedAt'))),
    JSON.parse(JSON.stringify(omit(botB, 'updatedAt'))),
  )
