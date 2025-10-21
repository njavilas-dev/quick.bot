import { Standard } from '@urbiport/nextjs'
import { useRouter } from 'next/router'
import { SEO } from './Seo'
import { Bot } from '@quickbot.io/schemas/features/bot/bot'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { Font } from '@quickbot.io/schemas'
import { useMemo } from 'react'
import { themeClasses, getBotBackgroundStyle } from '../theme'
import ResetHeader from './ResetHeader'

export type ViewerBotPageProps = {
  url: string
  isMatchingViewerUrl?: boolean
  name: string
  publicId: string | null
  font: Font | null
  isHideQueryParamsEnabled: boolean | null
  background: NonNullable<Bot['theme']['general']>['background']
  metadata: Bot['settings']['metadata']
}

export const ViewerBotPage = ({
  font,
  isMatchingViewerUrl,
  publicId,
  name,
  url,
  isHideQueryParamsEnabled,
  metadata,
  background,
}: ViewerBotPageProps) => {
  const { asPath, push } = useRouter()

  const clearQueryParamsIfNecessary = () => {
    const hasQueryParams = asPath.includes('?')
    if (
      !hasQueryParams ||
      !(isHideQueryParamsEnabled ?? defaultSettings.general.isHideQueryParamsEnabled)
    )
      return
    push(asPath.split('?')[0], undefined, { shallow: true })
  }

  const apiOrigin = useMemo(() => {
    if (isMatchingViewerUrl) return
    return new URL(url).origin
  }, [isMatchingViewerUrl, url])

  return (
    <div
      className={themeClasses.viewer.container}
      style={getBotBackgroundStyle(background?.type || 'Color', background?.content)}
    >
      <SEO url={url} botName={name} metadata={metadata} />
      <ResetHeader publicId={publicId} onReset={clearQueryParamsIfNecessary} />
      <Standard
        bot={publicId}
        onInit={clearQueryParamsIfNecessary}
        font={font ?? undefined}
        apiHost={apiOrigin}
      />
    </div>
  )
}
