import { BlockIndices, BlockV6 } from '@quickbot.io/schemas'
import { WaitNodeContent } from '@/features/blocks/logic/wait/components/WaitNodeContent'
import { ScriptNodeContent } from '@/features/blocks/logic/script/components/ScriptNodeContent'
import { ButtonsBubbleNode } from '@/features/blocks/inputs/buttons/components/ButtonsBubbleNode'
import { JumpNodeBody } from '@/features/blocks/logic/jump/components/JumpNodeBody'
import { AudioBubbleNode } from '@/features/blocks/bubbles/audio/components/AudioBubbleNode'
import { EmbedBubbleNode } from '@/features/blocks/bubbles/embed/components/EmbedBubbleNode'
import { ImageBubbleNode } from '@/features/blocks/bubbles/image/components/ImageBubbleNode'
import { TextBubbleNode } from '@/features/blocks/bubbles/textBubble/components/TextBubbleNode'
import { VideoBubbleNode } from '@/features/blocks/bubbles/video/components/VideoBubbleNode'
import { DateInputBubbleNode } from '@/features/blocks/inputs/date/components/DateInputBubbleNode'
import { EmailInputBubbleNode } from '@/features/blocks/inputs/emailInput/components/EmailInputBubbleNode'
import { FileInputBubbleNode } from '@/features/blocks/inputs/fileUpload/components/FileInputBubbleNode'
import { NumberInputBubbleNode } from '@/features/blocks/inputs/number/components/NumberInputBubbleNode'
import { PaymentBubbleNode } from '@/features/blocks/integrations/payment/components/PaymentBubbleNode'
import { PhoneInputBubbleNode } from '@/features/blocks/inputs/phone/components/PhoneInputBubbleNode'
import { RatingInputBubbleNode } from '@/features/blocks/inputs/rating/components/RatingInputBubbleNode'
import { TextInputBubbleNode } from '@/features/blocks/inputs/textInput/components/TextInputBubbleNode'
import { UrlInputBubbleNode } from '@/features/blocks/inputs/url/components/UrlInputBubbleNode'
import { GoogleSheetsNodeContent } from '@/features/blocks/integrations/googleSheets/components/GoogleSheetsNodeContent'
import { MakeComContent } from '@/features/blocks/integrations/makeCom/components/MakeComContent'
import { PabblyConnectContent } from '@/features/blocks/integrations/pabbly/components/PabblyConnectContent'
import { SendEmailContent } from '@/features/blocks/integrations/sendEmail/components/SendEmailContent'
import { WebhookContent } from '@/features/blocks/integrations/webhook/components/HttpRequestContent'
import { ZapierContent } from '@/features/blocks/integrations/zapier/components/ZapierContent'
import { RedirectNodeContent } from '@/features/blocks/logic/redirect/components/RedirectNodeContent'
import { SetVariableContent } from '@/features/blocks/logic/setVariable/components/SetVariableContent'
import { BotLinkNode } from '@/features/blocks/logic/botLink/components/BotLinkNode'
import { ItemNodesList } from '../item/ItemNodesList'
import { GoogleAnalyticsNodeBody } from '@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsNodeBody'
import { ChatwootNodeBody } from '@/features/blocks/integrations/chatwoot/components/ChatwootNodeBody'
import { AbTestNodeBody } from '@/features/blocks/logic/abTest/components/AbTestNodeBody'
import { PixelNodeBody } from '@/features/blocks/integrations/pixel/components/PixelNodeBody'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { ForgedBlockNodeContent } from '@/features/forge/components/ForgedBlockNodeContent'

type Props = {
  block: BlockV6
  groupId: string
  indices: BlockIndices
}
export const BlockNodeContent = ({ block, indices, groupId }: Props): JSX.Element => {
  switch (block.type) {
    case BubbleBlockType.TEXT: {
      return <TextBubbleNode block={block} />
    }
    case BubbleBlockType.IMAGE: {
      return <ImageBubbleNode block={block} />
    }
    case BubbleBlockType.VIDEO: {
      return <VideoBubbleNode block={block} />
    }
    case BubbleBlockType.EMBED: {
      return <EmbedBubbleNode block={block} />
    }
    case BubbleBlockType.AUDIO: {
      return <AudioBubbleNode url={block.content?.url} />
    }
    case InputBlockType.TEXT: {
      return <TextInputBubbleNode options={block.options} />
    }
    case InputBlockType.NUMBER: {
      return <NumberInputBubbleNode options={block.options} />
    }
    case InputBlockType.EMAIL: {
      return <EmailInputBubbleNode options={block.options} />
    }
    case InputBlockType.URL: {
      return <UrlInputBubbleNode options={block.options} />
    }
    case InputBlockType.CHOICE: {
      return <ButtonsBubbleNode block={block} indices={indices} />
    }
    case InputBlockType.PHONE: {
      return <PhoneInputBubbleNode options={block.options} />
    }
    case InputBlockType.DATE: {
      return <DateInputBubbleNode variableId={block.options?.variableId} />
    }
    case InputBlockType.RATING: {
      return <RatingInputBubbleNode block={block} />
    }
    case InputBlockType.FILE: {
      return <FileInputBubbleNode options={block.options} />
    }
    case LogicBlockType.SET_VARIABLE: {
      return <SetVariableContent block={block} />
    }
    case LogicBlockType.REDIRECT: {
      return <RedirectNodeContent url={block.options?.url} />
    }
    case LogicBlockType.SCRIPT: {
      return <ScriptNodeContent options={block.options} />
    }
    case LogicBlockType.WAIT: {
      return <WaitNodeContent options={block.options} />
    }
    case LogicBlockType.JUMP: {
      return <JumpNodeBody options={block.options} />
    }
    case LogicBlockType.AB_TEST: {
      return <AbTestNodeBody block={block} groupId={groupId} />
    }
    case LogicBlockType.BOT_LINK:
      return <BotLinkNode block={block} />
    case LogicBlockType.CONDITION:
      return <ItemNodesList block={block} indices={indices} />
    case IntegrationBlockType.GOOGLE_SHEETS: {
      return <GoogleSheetsNodeContent options={block.options} />
    }
    case IntegrationBlockType.GOOGLE_ANALYTICS: {
      return <GoogleAnalyticsNodeBody block={block} />
    }
    case IntegrationBlockType.WEBHOOK: {
      return <WebhookContent block={block} />
    }
    case IntegrationBlockType.ZAPIER: {
      return <ZapierContent block={block} />
    }
    case IntegrationBlockType.PABBLY_CONNECT: {
      return <PabblyConnectContent block={block} />
    }
    case IntegrationBlockType.MAKE_COM: {
      return <MakeComContent block={block} />
    }
    case IntegrationBlockType.EMAIL: {
      return <SendEmailContent block={block} />
    }
    case IntegrationBlockType.CHATWOOT: {
      return <ChatwootNodeBody block={block} />
    }
    case IntegrationBlockType.PIXEL: {
      return <PixelNodeBody options={block.options} />
    }
    case InputBlockType.PAYMENT: {
      return <PaymentBubbleNode block={block} />
    }
    default: {
      return <ForgedBlockNodeContent block={block} indices={indices} />
    }
  }
}
