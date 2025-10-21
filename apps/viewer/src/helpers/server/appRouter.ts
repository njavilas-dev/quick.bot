import { whatsAppRouter } from '@/features/whatsapp/api/router'
import { router } from './trpc'
import { updateBotInSession } from '@/features/chat/api/updateBotInSession'
import { getUploadUrl } from '@/features/fileUpload/api/deprecated/getUploadUrl'
import { generateUploadUrl as generateUploadUrlV1 } from '@/features/fileUpload/api/deprecated/generateUploadUrl'
import { generateUploadUrl } from '@/features/fileUpload/api/generateUploadUrl'
import { continueChat } from '@/features/chat/api/continueChat'
import { saveClientLogs } from '@/features/chat/api/saveClientLogs'
import { startChat } from '@/features/chat/api/startChat'
import { startChatPreview } from '@/features/chat/api/startChatPreview'

export const appRouter = router({
  startChat,
  continueChat,
  startChatPreview: startChatPreview,
  getUploadUrl,
  generateUploadUrlV1,
  generateUploadUrl,
  updateBotInSession,
  whatsAppRouter,
  saveClientLogs,
})
