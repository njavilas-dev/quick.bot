import '@/assets/styles/routerProgressBar.css'
import '@/assets/styles/plate.css'
import '@/assets/styles/resultsTable.css'
import '@/assets/styles/custom.css'
import '@/assets/styles/md.css'
import { useEffect } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import { UiProvider } from '@urbiport/ui'
import { useRouterProgressBar } from '@/lib/routerProgressBar'
import { trpc } from '@/lib/trpc'
import { NewVersionPopup } from '@/components/NewVersionPopup'
import { BotProvider } from '@/features/editor/providers/BotProvider'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import { tolgee } from '@/lib/tolgee'
import ReduxProvider from '@/store/redux-provider'
import PageHead from '@/components/PageHead'
import { register } from '../../sentry.server.config'
import { SentryInit } from '../components/SentryInit'
import PostHogProvider from '@/features/editor/providers/PosthogProvider'

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

register()

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const router = useRouter()
  const ssrTolgee = useTolgeeSSR(tolgee, router.locale)

  useRouterProgressBar()

  useEffect(() => {
    if (router.pathname.endsWith('/flow') || router.pathname.endsWith('/analytics')) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('disable-scroll-x-behavior')
    } else {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('disable-scroll-x-behavior')
    }
  }, [router.pathname])

  const botId = router.query.botId?.toString()

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <TolgeeProvider tolgee={ssrTolgee}>
      <ReduxProvider>
        <UiProvider>
          <SessionProvider session={pageProps.session}>
            <BotProvider botId={botId}>
              <PostHogProvider>
                <PageHead />
                <SentryInit />
                {getLayout(<Component {...pageProps} />)}
                <NewVersionPopup />
              </PostHogProvider>
            </BotProvider>
          </SessionProvider>
        </UiProvider>
      </ReduxProvider>
    </TolgeeProvider>
  )
}

export default trpc.withTRPC(App)
