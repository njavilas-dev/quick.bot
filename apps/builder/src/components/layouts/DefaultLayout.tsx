import { ReactNode } from 'react'
import PageHead from '@/components/PageHead'
import PostHogProvider from '@/features/editor/providers/PosthogProvider'
import { SentryInit } from '@/components/SentryInit'
import { useRouter } from 'next/router'
import ReduxProvider from '@/store/redux-provider'
import { NewVersionPopup } from '@/components/NewVersionPopup'
import { BotProvider } from '@/features/editor/providers/BotProvider'
import { UiProvider } from '@urbiport/ui'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import { tolgee } from '@/lib/tolgee'
import { SessionProvider } from 'next-auth/react'

type DefaultLayoutProps = {
  children: ReactNode
}

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const router = useRouter()

  const ssrTolgee = useTolgeeSSR(tolgee, router.locale)
  const botId = router.query.botId?.toString()

  return (
    <TolgeeProvider tolgee={ssrTolgee}>
      <ReduxProvider>
        <UiProvider>
          <SessionProvider>
            <BotProvider botId={botId}>
              <PostHogProvider>
                <PageHead />
                <SentryInit />
                {children}
                <NewVersionPopup />
              </PostHogProvider>
            </BotProvider>
          </SessionProvider>
        </UiProvider>
      </ReduxProvider>
    </TolgeeProvider>
  )
}
