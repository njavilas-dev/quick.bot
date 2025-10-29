import { router } from '../trpc'
import { accountRouter } from '@/features/account/api/router'
import { workspaceRouter } from '@/features/workspace/api/router'
import { botRouter } from '@/features/bot/api/router'
import { billingRouter } from '@/features/billing/api/router'
import { webhookRouter } from '@/features/blocks/integrations/webhook/api/router'
import { getLinkedBots } from '@/features/blocks/logic/botLink/api/getLinkedBots'
import { credentialsRouter } from '@/features/credentials/api/router'
import { resultsRouter } from '@/features/results/api/router'
import { themeRouter } from '@/features/theme/api/router'
import { analyticsRouter } from '@/features/analytics/api/router'
import { collaboratorsRouter } from '@/features/collaboration/api/router'
import { customDomainsRouter } from '@/features/customDomains/api/router'
import { publicWhatsAppRouter } from '@/features/whatsapp/router'
import { folderRouter } from '@/features/folders/api/router'
import { invitationsRouter } from '@/features/invitations/api/router'
import { inboxRouter } from '@/features/inbox/api/router'

export const publicRouter = router({
  getLinkedBots,
  analytics: analyticsRouter,
  workspace: workspaceRouter,
  bot: botRouter,
  webhook: webhookRouter,
  results: resultsRouter,
  billing: billingRouter,
  account: accountRouter,
  credentials: credentialsRouter,
  theme: themeRouter,
  collaborators: collaboratorsRouter,
  invitations: invitationsRouter,
  customDomains: customDomainsRouter,
  whatsApp: publicWhatsAppRouter,
  folders: folderRouter,
  inbox: inboxRouter,
})
