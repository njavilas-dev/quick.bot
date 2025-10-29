import { router } from '@/helpers/server/trpc'
import { listBotLastSessions } from './listBotLastSessions'
import { getBotLastSession } from './getBotLastSession'
import { getChatMessages } from './getChatMessages'

export const inboxRouter = router({
  listBotLastSessions,
  getBotLastSession,
  getChatMessages,
})
