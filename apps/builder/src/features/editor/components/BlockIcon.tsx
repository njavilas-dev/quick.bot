import React from 'react'
import { IconProps } from '@chakra-ui/react'
import {
  FlagIcon,
  ThunderIcon,
  SendEmailIcon,
  VariableIcon,
  AudioBubbleIcon,
  JumpIcon,
  ScriptIcon,
  WaitIcon,
  LayoutIcon,
  ImageIcon,
  ShuffleIcon,
  BoxIcon,
  ExternalLinkIcon,
  FilterIcon,
  UploadIcon,
  StarIcon,
  CheckSquareIcon,
  PhoneIcon,
  CalendarIcon,
  GlobeIcon,
  EmailIcon,
  NumberIcon,
  TextIcon,
  FilmIcon,
  ChatIcon,
} from '@urbiport/icons'
import { Block } from '@quickbot.io/schemas'
import { ChatwootLogo } from '@/features/blocks/integrations/chatwoot/components/ChatwootLogo'
import { GoogleAnalyticsLogo } from '@/features/blocks/integrations/googleAnalytics/components/GoogleAnalyticsLogo'
import { GoogleSheetsLogo } from '@/features/blocks/integrations/googleSheets/components/GoogleSheetsLogo'
import { MakeComLogo } from '@/features/blocks/integrations/makeCom/components/MakeComLogo'
import { PabblyConnectLogo } from '@/features/blocks/integrations/pabbly/components/PabblyConnectLogo'
import { ZapierLogo } from '@/features/blocks/integrations/zapier/components/ZapierLogo'
import { PixelLogo } from '@/features/blocks/integrations/pixel/components/PixelLogo'
import { StripeLogo } from '@/features/blocks/integrations/payment/components/StripeLogo'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { ForgedBlockIcon } from '@/features/forge/ForgedBlockIcon'

type BlockIconProps = { type: Block['type'] } & IconProps

export const BlockIcon = ({ type, ...props }: BlockIconProps): JSX.Element => {
  const agent = 'brand.primary'
  const user = 'brand.blue'
  const logic = 'brand.purple'

  switch (type) {
    case BubbleBlockType.TEXT:
      return <ChatIcon color={agent} {...props} />
    case BubbleBlockType.IMAGE:
      return <ImageIcon color={agent} {...props} />
    case BubbleBlockType.VIDEO:
      return <FilmIcon color={agent} {...props} />
    case BubbleBlockType.EMBED:
      return <LayoutIcon color={agent} {...props} />
    case BubbleBlockType.AUDIO:
      return <AudioBubbleIcon color={agent} {...props} />
    case InputBlockType.TEXT:
      return <TextIcon color={user} {...props} />
    case InputBlockType.NUMBER:
      return <NumberIcon color={user} {...props} />
    case InputBlockType.EMAIL:
      return <EmailIcon color={user} {...props} />
    case InputBlockType.URL:
      return <GlobeIcon color={user} {...props} />
    case InputBlockType.DATE:
      return <CalendarIcon color={user} {...props} />
    case InputBlockType.PHONE:
      return <PhoneIcon color={user} {...props} />
    case InputBlockType.CHOICE:
      return <CheckSquareIcon color={user} {...props} />
    case InputBlockType.PAYMENT:
      return <StripeLogo {...props} />
    case InputBlockType.RATING:
      return <StarIcon color={user} {...props} />
    case InputBlockType.FILE:
      return <UploadIcon color={user} {...props} />
    case LogicBlockType.SET_VARIABLE:
      return <VariableIcon color={logic} {...props} />
    case LogicBlockType.CONDITION:
      return <FilterIcon color={logic} {...props} />
    case LogicBlockType.REDIRECT:
      return <ExternalLinkIcon color={logic} {...props} />
    case LogicBlockType.SCRIPT:
      return <ScriptIcon color={logic} {...props} />
    case LogicBlockType.WAIT:
      return <WaitIcon color={logic} {...props} />
    case LogicBlockType.JUMP:
      return <JumpIcon color={logic} {...props} />
    case LogicBlockType.BOT_LINK:
      return <BoxIcon color={logic} {...props} />
    case LogicBlockType.AB_TEST:
      return <ShuffleIcon color={logic} {...props} />
    case IntegrationBlockType.GOOGLE_SHEETS:
      return <GoogleSheetsLogo {...props} />
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return <GoogleAnalyticsLogo {...props} />
    case IntegrationBlockType.WEBHOOK:
      return <ThunderIcon {...props} />
    case IntegrationBlockType.ZAPIER:
      return <ZapierLogo {...props} />
    case IntegrationBlockType.MAKE_COM:
      return <MakeComLogo {...props} />
    case IntegrationBlockType.PABBLY_CONNECT:
      return <PabblyConnectLogo {...props} />
    case IntegrationBlockType.EMAIL:
      return <SendEmailIcon {...props} />
    case IntegrationBlockType.CHATWOOT:
      return <ChatwootLogo {...props} />
    case IntegrationBlockType.PIXEL:
      return <PixelLogo {...props} />
    case 'start':
      return <FlagIcon {...props} />
    default:
      return <ForgedBlockIcon type={type} {...props} />
  }
}
