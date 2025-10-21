import { BlockV6 } from '../schema'
import { InputBlockType } from '../inputs/constants'
import { LogicBlockType } from '../logic/constants'
import { IntegrationBlockType } from '../integrations/constants'

// Input blocks defaults
import { defaultTextInputOptions } from '../inputs/text/constants'
import { defaultNumberInputOptions } from '../inputs/number/constants'
import { defaultEmailInputOptions } from '../inputs/email/constants'
import { defaultPhoneInputOptions } from '../inputs/phone/constants'
import { defaultUrlInputOptions } from '../inputs/url/constants'
import { defaultChoiceInputOptions } from '../inputs/choice/constants'
import { defaultRatingInputOptions } from '../inputs/rating/constants'
import { defaultFileInputOptions } from '../inputs/file/constants'
import { defaultPaymentInputOptions } from '../inputs/payment/constants'
import { defaultDateInputOptions } from '../inputs/date/constants'

// Logic blocks defaults
import { defaultSetVariableOptions } from '../logic/setVariable/constants'
import { defaultRedirectOptions } from '../logic/redirect/constants'
import { defaultAbTestOptions } from '../logic/abTest/constants'
import { defaultBotLinkOptions } from '../logic/botLink/constants'
import { defaultWaitOptions } from '../logic/wait/constants'
import { defaultScriptOptions } from '../logic/script/constants'

// Integration blocks defaults
import { defaultWebhookBlockOptions } from '../integrations/webhook/constants'
import { defaultSendEmailOptions } from '../integrations/sendEmail/constants'
import { defaultPixelOptions } from '../integrations/pixel/constants'

// Get default options for a specific block type
export const getDefaultOptionsForBlockType = (type: BlockV6['type']): unknown => {
  switch (type) {
    // Input blocks
    case InputBlockType.TEXT:
      return defaultTextInputOptions
    case InputBlockType.NUMBER:
      return defaultNumberInputOptions
    case InputBlockType.EMAIL:
      return defaultEmailInputOptions
    case InputBlockType.PHONE:
      return defaultPhoneInputOptions
    case InputBlockType.URL:
      return defaultUrlInputOptions
    case InputBlockType.CHOICE:
      return defaultChoiceInputOptions
    case InputBlockType.RATING:
      return defaultRatingInputOptions
    case InputBlockType.FILE:
      return defaultFileInputOptions
    case InputBlockType.PAYMENT:
      return defaultPaymentInputOptions
    case InputBlockType.DATE:
      return defaultDateInputOptions

    // Logic blocks
    case LogicBlockType.SET_VARIABLE:
      return defaultSetVariableOptions
    case LogicBlockType.REDIRECT:
      return defaultRedirectOptions
    case LogicBlockType.AB_TEST:
      return defaultAbTestOptions
    case LogicBlockType.BOT_LINK:
      return defaultBotLinkOptions
    case LogicBlockType.WAIT:
      return defaultWaitOptions
    case LogicBlockType.SCRIPT:
      return defaultScriptOptions
    case LogicBlockType.CONDITION:
      return undefined

    // Integration blocks
    case IntegrationBlockType.WEBHOOK:
      return defaultWebhookBlockOptions
    case IntegrationBlockType.EMAIL:
      return defaultSendEmailOptions
    case IntegrationBlockType.PIXEL:
      return defaultPixelOptions

    default:
      return undefined
  }
}
