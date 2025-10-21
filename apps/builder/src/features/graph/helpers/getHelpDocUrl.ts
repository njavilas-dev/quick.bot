import { ForgedBlockDefinition } from '@quickbot.io/forge-repository/types'
import { BlockWithOptions } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'

export const getHelpDocUrl = (
  blockType: BlockWithOptions['type'],
  blockDef?: ForgedBlockDefinition,
): string | undefined => {
  switch (blockType) {
    case LogicBlockType.BOT_LINK:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/bot-link'
    case LogicBlockType.SET_VARIABLE:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/set-variable'
    case LogicBlockType.REDIRECT:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/redirect'
    case LogicBlockType.SCRIPT:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/script'
    case LogicBlockType.WAIT:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/wait'
    case InputBlockType.TEXT:
      return 'https://docs.quick.bot/builder/editor/blocks/user/text'
    case InputBlockType.NUMBER:
      return 'https://docs.quick.bot/builder/editor/blocks/user/number'
    case InputBlockType.EMAIL:
      return 'https://docs.quick.bot/builder/editor/blocks/user/email'
    case InputBlockType.URL:
      return 'https://docs.quick.bot/builder/editor/blocks/user/website'
    case InputBlockType.DATE:
      return 'https://docs.quick.bot/builder/editor/blocks/user/date'
    case InputBlockType.PHONE:
      return 'https://docs.quick.bot/builder/editor/blocks/user/phone-number'
    case InputBlockType.CHOICE:
      return 'https://docs.quick.bot/builder/editor/blocks/user/buttons'
    case InputBlockType.PAYMENT:
      return 'https://docs.quick.bot/builder/editor/blocks/user/payment'
    case InputBlockType.RATING:
      return 'https://docs.quick.bot/builder/editor/blocks/user/rating'
    case InputBlockType.FILE:
      return 'https://docs.quick.bot/builder/editor/blocks/user/file-upload'
    case IntegrationBlockType.EMAIL:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/send-email'
    case IntegrationBlockType.CHATWOOT:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/chatwoot'
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/google-analytics'
    case IntegrationBlockType.GOOGLE_SHEETS:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/google-sheets'
    case IntegrationBlockType.ZAPIER:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/zapier'
    case IntegrationBlockType.PABBLY_CONNECT:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/pabbly-connect'
    case IntegrationBlockType.WEBHOOK:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/webhook'
    case IntegrationBlockType.MAKE_COM:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/make-com'
    case LogicBlockType.AB_TEST:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/ab-test'
    case LogicBlockType.JUMP:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/jump'
    case IntegrationBlockType.PIXEL:
      return 'https://docs.quick.bot/builder/editor/blocks/integrations/meta-pixel'
    case LogicBlockType.CONDITION:
      return 'https://docs.quick.bot/builder/editor/blocks/logic/condition'
    default:
      return blockDef?.docsUrl
  }
}
