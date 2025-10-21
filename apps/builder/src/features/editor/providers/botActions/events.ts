import { produce } from 'immer'
import { TEvent } from '@quickbot.io/schemas'
import { SetBot } from '../BotProvider'

export type EventsActions = {
  updateEvent: (eventIndex: number, updates: Partial<Omit<TEvent, 'id'>>) => void
}

const eventsActions = (setBot: SetBot): EventsActions => ({
  updateEvent: (eventIndex: number, updates: Partial<Omit<TEvent, 'id'>>) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const event = bot.events[eventIndex]
        bot.events[eventIndex] = { ...event, ...updates }
      }),
    ),
})

export { eventsActions }
