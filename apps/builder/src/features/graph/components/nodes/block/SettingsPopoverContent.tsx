import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useEventListener,
  Portal,
} from '@chakra-ui/react'
import { Block, BlockOptions, BlockWithOptions, BlockIndices } from '@quickbot.io/schemas'
import { useRef, useState } from 'react'
import { WaitSettings } from '@/features/blocks/logic/wait/components/WaitSettings'
import { ScriptSettings } from '@/features/blocks/logic/script/components/ScriptSettings'
import { JumpSettings } from '@/features/blocks/logic/jump/components/JumpSettings'
import { MakeComSettings } from '@/features/blocks/integrations/makeCom/components/MakeComSettings'
import { PabblyConnectSettings } from '@/features/blocks/integrations/pabbly/components/PabblyConnectSettings'
import { ButtonsBubbleForm } from '@/features/blocks/inputs/buttons/components/ButtonsBubbleForm'
import { FileInputBubbleForm } from '@/features/blocks/inputs/fileUpload/components/FileInputBubbleForm'
import { PaymentBubbleForm } from '@/features/blocks/integrations/payment/components/PaymentBubbleForm'
import { RatingInputBubbleForm } from '@/features/blocks/inputs/rating/components/RatingInputBubbleForm'
import { TextInputBubbleForm } from '@/features/blocks/inputs/textInput/components/TextInputBubbleForm'
import { GoogleAnalyticsSettings } from '@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsSettings'
import { SendEmailSettings } from '@/features/blocks/integrations/sendEmail/components/SendEmailSettings'
import { HttpRequestSettings } from '@/features/blocks/integrations/webhook/components/HttpRequestSettings'
import { ZapierSettings } from '@/features/blocks/integrations/zapier/components/ZapierSettings'
import { RedirectSettings } from '@/features/blocks/logic/redirect/components/RedirectSettings'
import { SetVariableSettings } from '@/features/blocks/logic/setVariable/components/SetVariableSettings'
import { BotLinkForm } from '@/features/blocks/logic/botLink/components/BotLinkForm'
import { NumberInputBubbleForm } from '@/features/blocks/inputs/number/components/NumberInputBubbleForm'
import { EmailInputBubbleForm } from '@/features/blocks/inputs/emailInput/components/EmailInputBubbleForm'
import { UrlInputBubbleForm } from '@/features/blocks/inputs/url/components/UrlInputBubbleForm'
import { DateInputBubbleForm } from '@/features/blocks/inputs/date/components/DateInputBubbleForm'
import { PhoneInputBubbleForm } from '@/features/blocks/inputs/phone/components/PhoneInputBubbleForm'
import { GoogleSheetsSettings } from '@/features/blocks/integrations/googleSheets/components/GoogleSheetsSettings'
import { ChatwootSettings } from '@/features/blocks/integrations/chatwoot/components/ChatwootSettings'
import { AbTestSettings } from '@/features/blocks/logic/abTest/components/AbTestSettings'
import { BlockSettingsActionBar } from './BlockSettingsActionBar'
import { PixelSettings } from '@/features/blocks/integrations/pixel/components/PixelSettings'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { ForgedBlockSettings } from '@/features/forge/components/ForgedBlockSettings'
import { useForgedBlock } from '@/features/forge/hooks/useForgedBlock'
import { VideoOnboardingPopover } from '@/features/onboarding/components/VideoOnboardingPopover'
import { hasOnboardingVideo } from '@/features/onboarding/helpers/hasOnboardingVideo'

type Props = {
  block: BlockWithOptions
  groupId: string | undefined
  onExpandClick: () => void
  onBlockChange: (updates: Partial<Block>) => void
  indices: BlockIndices
}

export const SettingsPopoverContent = ({ onExpandClick, ...props }: Props) => {
  const [isHovering, setIsHovering] = useState(false)
  const { blockDef } = useForgedBlock(props.block.type)
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener(ref.current, 'wheel', handleMouseWheel)

  return (
    <Portal>
      <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
        <PopoverArrow bgColor="bg.dark" />
        <VideoOnboardingPopover.Root type={props.block.type} blockDef={blockDef}>
          {({ onToggle }) => (
            <PopoverBody
              py="3"
              overflowY="auto"
              maxH="35vh"
              ref={ref}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <BlockSettingsActionBar
                onExpandClick={onExpandClick}
                onVideoOnboardingClick={onToggle}
                blockType={props.block.type}
                blockDef={blockDef}
                isVideoOnboardingItemDisplayed={hasOnboardingVideo({
                  blockType: props.block.type,
                  blockDef,
                })}
                block={props.block}
                indices={props.indices}
                groupId={props.groupId || ''}
                isHovering={isHovering}
              />
              <BlockSettings {...props} />
            </PopoverBody>
          )}
        </VideoOnboardingPopover.Root>
      </PopoverContent>
    </Portal>
  )
}

export const BlockSettings = ({
  block,
  groupId,
  onBlockChange,
}: {
  block: BlockWithOptions
  groupId: string | undefined
  onBlockChange: (block: Partial<Block>) => void
}): JSX.Element | null => {
  const updateOptions = (options: BlockOptions) => {
    onBlockChange({ options } as Partial<Block>)
  }

  const settingsContent = (() => {
    switch (block.type) {
      case InputBlockType.TEXT: {
        return <TextInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.NUMBER: {
        return <NumberInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.EMAIL: {
        return <EmailInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.URL: {
        return <UrlInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.DATE: {
        return <DateInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.PHONE: {
        return <PhoneInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.CHOICE: {
        return <ButtonsBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.RATING: {
        return <RatingInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.FILE: {
        return <FileInputBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.SET_VARIABLE: {
        return <SetVariableSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.REDIRECT: {
        return <RedirectSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.SCRIPT: {
        return <ScriptSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.BOT_LINK: {
        return <BotLinkForm options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.WAIT: {
        return <WaitSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.JUMP: {
        return groupId ? (
          <JumpSettings groupId={groupId} options={block.options} onOptionsChange={updateOptions} />
        ) : (
          <></>
        )
      }
      case LogicBlockType.AB_TEST: {
        return <AbTestSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.GOOGLE_SHEETS: {
        return (
          <GoogleSheetsSettings
            options={block.options}
            onOptionsChange={updateOptions}
            blockId={block.id}
          />
        )
      }
      case IntegrationBlockType.GOOGLE_ANALYTICS: {
        return <GoogleAnalyticsSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.ZAPIER: {
        return <ZapierSettings block={block} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.MAKE_COM: {
        return <MakeComSettings block={block} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.PABBLY_CONNECT: {
        return <PabblyConnectSettings block={block} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.WEBHOOK: {
        return <HttpRequestSettings block={block} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.EMAIL: {
        return <SendEmailSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.CHATWOOT: {
        return <ChatwootSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case IntegrationBlockType.PIXEL: {
        return <PixelSettings options={block.options} onOptionsChange={updateOptions} />
      }
      case InputBlockType.PAYMENT: {
        return <PaymentBubbleForm options={block.options} onOptionsChange={updateOptions} />
      }
      case LogicBlockType.CONDITION:
        return null
      default: {
        return <ForgedBlockSettings block={block} onOptionsChange={updateOptions} />
      }
    }
  })()

  return settingsContent
}
