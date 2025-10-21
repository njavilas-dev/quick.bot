import { IncomingMessage } from 'http'
import { ErrorPage } from '@/components/ErrorPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { isNotDefined } from '@quickbot.io/lib'
import { ViewerBotPage, ViewerBotPageProps } from '@/components/ViewerBotPage'
import { env } from '@quickbot.io/env'
import prisma from '@quickbot.io/lib/prisma'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import {
  defaultBackgroundColor,
  defaultBackgroundType,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { PublicBot, Bot } from '@quickbot.io/schemas'

export type PublishedBot = Omit<PublicBot, 'createdAt' | 'updatedAt'> & {
  bot: Pick<Bot, 'name' | 'isClosed' | 'isArchived' | 'publicId'>
}

// Browsers that doesn't support ES modules and/or web components
const incompatibleBrowsers = [
  {
    name: 'UC Browser',
    regex: /ucbrowser/i,
  },
  {
    name: 'Internet Explorer',
    regex: /msie|trident/i,
  },
  {
    name: 'Opera Mini',
    regex: /opera mini/i,
  },
]

const log = (message: string) => {
  if (!env.DEBUG) return
  console.log(`[DEBUG] ${message}`)
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const incompatibleBrowser =
    incompatibleBrowsers.find((browser) =>
      browser.regex.test(context.req.headers['user-agent'] ?? ''),
    )?.name ?? null
  const pathname = context.resolvedUrl.split('?')[0]
  const { host, forwardedHost } = getHost(context.req)
  log(`host: ${host}`)
  log(`forwardedHost: ${forwardedHost}`)
  const protocol =
    context.req.headers['x-forwarded-proto'] === 'https' ||
    (context.req.socket as unknown as { encrypted: boolean }).encrypted
      ? 'https'
      : 'http'

  log(`Request protocol: ${protocol}`)
  try {
    if (!host) return { props: {} }
    const viewerUrls = env.NEXT_PUBLIC_VIEWER_URL
    log(`viewerUrls: ${viewerUrls}`)
    const isMatchingViewerUrl = viewerUrls.some(
      (url) =>
        host.split(':')[0].includes(url.split('//')[1].split(':')[0]) ||
        (forwardedHost && forwardedHost.split(':')[0].includes(url.split('//')[1].split(':')[0])),
    )
    log(`isMatchingViewerUrl: ${isMatchingViewerUrl}`)
    const customDomain = `${forwardedHost ?? host}${pathname === '/' ? '' : pathname}`
    const publishedBot = isMatchingViewerUrl
      ? await getBotFromPublicId(context.query.publicId?.toString())
      : await getBotFromCustomDomain(customDomain)

    return {
      props: {
        publishedBot,
        incompatibleBrowser,
        isMatchingViewerUrl,
        url: `${protocol}://${forwardedHost ?? host}${pathname}`,
      },
    }
  } catch (err) {
    console.error(err)
  }
  return {
    props: {
      incompatibleBrowser,
      url: `${protocol}://${forwardedHost ?? host}${pathname}`,
    },
  }
}

const getBotFromPublicId = async (publicId?: string) => {
  const publishedBot = (await prisma.botPublic.findFirst({
    where: { bot: { publicId: publicId ?? '' } },
    select: {
      variables: true,
      settings: true,
      theme: true,
      version: true,
      groups: true,
      edges: true,
      botId: true,
      id: true,
      bot: {
        select: {
          name: true,
          isClosed: true,
          isArchived: true,
          publicId: true,
        },
      },
    },
  })) as PublishedBot | null

  if (isNotDefined(publishedBot)) return null
  return {
    name: publishedBot.bot.name,
    publicId: publishedBot.bot.publicId ?? null,
    background: publishedBot.theme.general?.background ?? {
      type: defaultBackgroundType,
      content: defaultBackgroundColor,
    },
    isHideQueryParamsEnabled:
      publishedBot.settings.general?.isHideQueryParamsEnabled ??
      defaultSettings.general.isHideQueryParamsEnabled,
    metadata: publishedBot.settings.metadata ?? {},
    font: publishedBot.theme.general?.font ?? null,
  } satisfies Pick<
    ViewerBotPageProps,
    'name' | 'publicId' | 'background' | 'isHideQueryParamsEnabled' | 'metadata' | 'font'
  >
}

const getBotFromCustomDomain = async (customDomain: string) => {
  const publishedBot = (await prisma.botPublic.findFirst({
    where: { bot: { customDomain } },
    select: {
      variables: true,
      settings: true,
      theme: true,
      version: true,
      groups: true,
      edges: true,
      botId: true,
      id: true,
      bot: {
        select: {
          name: true,
          isClosed: true,
          isArchived: true,
          publicId: true,
        },
      },
    },
  })) as PublishedBot | null
  if (isNotDefined(publishedBot)) return null
  return {
    name: publishedBot.bot.name,
    publicId: publishedBot.bot.publicId ?? null,
    background: publishedBot.theme.general?.background ?? {
      type: defaultBackgroundType,
      content: defaultBackgroundColor,
    },
    isHideQueryParamsEnabled:
      publishedBot.settings.general?.isHideQueryParamsEnabled ??
      defaultSettings.general.isHideQueryParamsEnabled,
    metadata: publishedBot.settings.metadata ?? {},
    font: publishedBot.theme.general?.font ?? null,
  } satisfies Pick<
    ViewerBotPageProps,
    'name' | 'publicId' | 'background' | 'isHideQueryParamsEnabled' | 'metadata' | 'font'
  >
}

const getHost = (req?: IncomingMessage): { host?: string; forwardedHost?: string } => ({
  host: req?.headers ? req.headers.host : window.location.host,
  forwardedHost: req?.headers['x-forwarded-host'] as string | undefined,
})

const App = ({
  publishedBot,
  incompatibleBrowser,
  ...props
}: {
  isIE: boolean
  customHeadCode: string | null
  url: string
  isMatchingViewerUrl?: boolean
  publishedBot: Pick<
    ViewerBotPageProps,
    'name' | 'publicId' | 'background' | 'isHideQueryParamsEnabled' | 'metadata' | 'font'
  >
  incompatibleBrowser: string | null
}) => {
  if (incompatibleBrowser)
    return (
      <ErrorPage error={new Error(`Your web browser: ${incompatibleBrowser}, is not supported.`)} />
    )
  if (!publishedBot) return <NotFoundPage />

  return (
    <ViewerBotPage
      url={props.url}
      isMatchingViewerUrl={props.isMatchingViewerUrl}
      name={publishedBot.name}
      publicId={publishedBot.publicId}
      isHideQueryParamsEnabled={
        publishedBot.isHideQueryParamsEnabled ?? defaultSettings.general.isHideQueryParamsEnabled
      }
      background={
        publishedBot.background ?? {
          type: defaultBackgroundType,
          content: defaultBackgroundColor,
        }
      }
      metadata={publishedBot.metadata ?? {}}
      font={publishedBot.font}
    />
  )
}

export default App
