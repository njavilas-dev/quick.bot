import { router } from '@/helpers/server/trpc'
import { getPhoneNumber } from './getPhoneNumber'
import { getSystemTokenInfo } from './getSystemTokenInfo'
import { verifyIfPhoneNumberAvailable } from './verifyIfPhoneNumberAvailable'
import { generateVerificationToken } from './generateVerificationToken'
import { checkWhatsAppCredentialId } from './checkWhatsAppCredentialId'
import { startWhatsAppPreview } from './startWhatsAppPreview'
import { subscribePreviewWebhook } from './subscribePreviewWebhook'
import { receiveMessagePreview } from './receiveMessagePreview'
import { getVerificationToken } from './getVerificationToken'
import { deleteVerificationTokensByBotId } from './deleteVerificationToken'
import { getFlowTemplates } from './getFlowTemplates'
import { getPhoneNumbers } from './getPhoneNumbers'
import { getWhatsAppBusinessAccountsQuery } from './getWhatsAppBusinessAccounts'
import { getWhatsAppCredentials } from './getWhatsAppCredentials'

export const internalWhatsAppRouter = router({
  getPhoneNumber,
  getSystemTokenInfo,
  verifyIfPhoneNumberAvailable,
  generateVerificationToken,
  checkWhatsAppCredentialId,
  getVerificationToken,
  deleteVerificationTokensByBotId,
  getFlowTemplates,
  getPhoneNumbers,
  getWhatsAppBusinessAccounts: getWhatsAppBusinessAccountsQuery,
  getWhatsAppCredentials,
})

export const publicWhatsAppRouter = router({
  startWhatsAppPreview,
  subscribePreviewWebhook,
  receiveMessagePreview,
})
