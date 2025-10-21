import { router } from '@/helpers/server/trpc'
import { listBots } from './listBots'
import { createBot } from './createBot'
import { updateBot } from './updateBot'
import { getBot } from './getBot'
import { getPublishedBot } from './getPublishedBot'
import { publishBot } from './publishBot'
import { unpublishBot } from './unpublishBot'
import { deleteBot } from './deleteBot'
import { importBot } from './importBot'

export const botRouter = router({
  createBot,
  updateBot,
  getBot,
  getPublishedBot,
  publishBot,
  unpublishBot,
  listBots,
  deleteBot,
  importBot,
})
