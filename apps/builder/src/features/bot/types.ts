import { Bot } from '@quickbot.io/schemas'

export type BotInDashboard = Pick<Bot, 'id' | 'name' | 'icon'> & {
  publishedBotId?: string
  totalViews?: number
  totalStarts?: number
  totalCompleted?: number
}
