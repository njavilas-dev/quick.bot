import { ReactNode } from 'react'
import PageHead from '@/components/PageHead'
import { SentryInit } from '@/components/SentryInit'
import { PosthogProviderOptional } from '@/features/editor/providers/PosthogProvider'
import { useRouter } from 'next/router'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import { tolgee } from '@/lib/tolgee'
import ReduxProvider from '@/store/redux-provider'
import { SessionProvider } from 'next-auth/react'
import { NewVersionPopup } from '@/components/NewVersionPopup'
import { UiProvider } from '@urbiport/ui'

type AuthLayoutProps = {
  children: ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const router = useRouter()
  const ssrTolgee = useTolgeeSSR(tolgee, router.locale)

  return (
    <TolgeeProvider tolgee={ssrTolgee}>
      <ReduxProvider>
        <UiProvider>
          <SessionProvider>
            <PosthogProviderOptional>
              <PageHead />
              <SentryInit />
              {children}
              <NewVersionPopup />
            </PosthogProviderOptional>
          </SessionProvider>
        </UiProvider>
      </ReduxProvider>
    </TolgeeProvider>
  )
}
