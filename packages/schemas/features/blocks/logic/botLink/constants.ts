import { BotLinkBlock } from './schema'

export const defaultBotLinkOptions = {
  mergeResults: false,
} as const satisfies BotLinkBlock['options']
