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
import { useRouterProgressBar } from '@/lib/routerProgressBar'
import { trpc } from '@/lib/trpc'
import { register } from '../../sentry.server.config'

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

register()

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const router = useRouter()

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

  const getLayout = Component.getLayout ?? ((page) => page)

  return <>{getLayout(<Component {...pageProps} />)}</>
}

export default trpc.withTRPC(App)
