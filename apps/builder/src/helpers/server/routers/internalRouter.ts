import { getAppVersionProcedure } from '@/features/dashboard/api/getAppVersionProcedure'
import { generateUploadUrl } from '@/features/upload/api/generateUploadUrl'
import { internalWhatsAppRouter } from '@/features/whatsapp/router'
import { forgeRouter } from '@/features/forge/api/router'
import { googleSheetsRouter } from '@/features/blocks/integrations/googleSheets/api/router'
import { router } from '../trpc'

export const internalRouter = router({
  getAppVersionProcedure,
  generateUploadUrl,
  whatsAppInternal: internalWhatsAppRouter,
  forge: forgeRouter,
  googleSheets: googleSheetsRouter,
})
