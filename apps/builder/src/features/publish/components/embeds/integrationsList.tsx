import {
  WordpressLogo,
  ShopifyLogo,
  WixLogo,
  GtmLogo,
  JavascriptLogo,
  ReactLogo,
  NotionLogo,
  WebflowLogo,
  IframeLogo,
  FlutterFlowLogo,
  NextjsLogo,
  FramerLogo,
  WhatsAppLogo,
  WhatsAppBrandColor,
  CodeIcon
} from '@urbiport/icons'

import {
  IframeModalContent,
  JavascriptModalContent,
  ReactModalContent,
  WordpressModalContent,
  ShopifyModalContent,
  WixModalContent,
  WebflowModalContent,
  GtmModalContent,
  FramerModalContent,
  NextjsModalContent,
  ScriptModalContent,
  ApiModalContent,
  NotionModalContent,
  FlutterFlowModalContent,
  WhatsAppModalContent,
} from './modals'
import { env } from '@quickbot.io/env'

export const integrationsList = [
  {
    logo: <CodeIcon height={100} width="24px" />,
    label: 'API',
    modal: ApiModalContent,
    hidden: false,
  },
  {
    logo: <IframeLogo height={100} width="24px" />,
    label: 'Iframe',
    modal: IframeModalContent,
    hidden: false,
  },
  {
    logo: <JavascriptLogo height={100} width="24px" />,
    label: 'Javascript',
    modal: JavascriptModalContent,
    hidden: false,
  },
  {
    logo: <ReactLogo height={100} width="24px" />,
    label: 'React',
    modal: ReactModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <NextjsLogo height={100} width="24px" />,
    label: 'Nextjs',
    modal: NextjsModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <WordpressLogo height={100} width="24px" />,
    label: 'Wordpress',
    modal: WordpressModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <ShopifyLogo height={100} width="24px" />,
    label: 'Shopify',
    modal: ShopifyModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <WixLogo height={100} width="24px" />,
    label: 'Wix',
    modal: WixModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <WebflowLogo height={100} width="24px" />,
    label: 'Webflow',
    modal: WebflowModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <FramerLogo height={100} width="24px" />,
    label: 'Framer',
    modal: FramerModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <CodeIcon height={100} width="24px" />,
    label: 'Script',
    modal: ScriptModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <GtmLogo height={100} width="24px" />,
    label: 'Google Tag Manager',
    modal: GtmModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <NotionLogo height={100} width="24px" />,
    label: 'Notion',
    modal: NotionModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <FlutterFlowLogo height={100} width="24px" />,
    label: 'FlutterFlow',
    modal: FlutterFlowModalContent,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
  {
    logo: <WhatsAppLogo height={100} width="24px" color={WhatsAppBrandColor} />,
    label: 'WhatsApp',
    modal: WhatsAppModalContent,
    hidden: false,
  },
]
