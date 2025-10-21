import { executeSendEmailBlock } from './blocks/integrations/sendEmail/executeSendEmailBlock'
import { executeWebhookBlock } from './blocks/integrations/webhook/executeWebhookBlock'
import { executeChatwootBlock } from './blocks/integrations/chatwoot/executeChatwootBlock'
import { executeGoogleAnalyticsBlock } from './blocks/integrations/googleAnalytics/executeGoogleAnalyticsBlock'
import { executeGoogleSheetBlock } from './blocks/integrations/googleSheets/executeGoogleSheetBlock'
import { executePixelBlock } from './blocks/integrations/pixel/executePixelBlock'
import { IntegrationBlock, SessionState } from '@quickbot.io/schemas'
import { ExecuteIntegrationResponse } from './types'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { executeForgedBlock } from './forge/executeForgedBlock'
import { isNotDefined } from '@quickbot.io/lib'
import { env } from '@quickbot.io/env'

export const executeIntegration =
  (state: SessionState) =>
    async (block: IntegrationBlock): Promise<ExecuteIntegrationResponse> => {
      switch (block.type) {
        case IntegrationBlockType.GOOGLE_SHEETS:
          return {
            ...(await executeGoogleSheetBlock(state, block)),
            startTimeShouldBeUpdated: true,
          }
        case IntegrationBlockType.CHATWOOT:
          return executeChatwootBlock(state, block)
        case IntegrationBlockType.GOOGLE_ANALYTICS:
          return executeGoogleAnalyticsBlock(state, block)
        case IntegrationBlockType.EMAIL:
          return executeSendEmailBlock(state, block)
        case IntegrationBlockType.ZAPIER:
        case IntegrationBlockType.MAKE_COM:
        case IntegrationBlockType.PABBLY_CONNECT:
          return {
            ...(await executeWebhookBlock(state, block, {
              disableRequestTimeout: true,
            })),
            startTimeShouldBeUpdated: true,
          }
        case IntegrationBlockType.WEBHOOK:
          return {
            ...(await executeWebhookBlock(state, block, {
              disableRequestTimeout: isNotDefined(env.CHAT_API_TIMEOUT),
            })),
          }
        case IntegrationBlockType.PIXEL:
          return executePixelBlock(state, block)
        default:
          return {
            ...(await executeForgedBlock(state, block)),
            startTimeShouldBeUpdated: true,
          }
      }
    }
