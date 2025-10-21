import { Text, Spinner, Stack } from '@chakra-ui/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useToast, CenteredTextWithOutline } from '@urbiport/ui'
import { TextLink } from '@/components/TextLink'
import { useTranslate } from '@tolgee/react'
import { ClientSafeProvider, getProviders, LiteralUnion, useSession } from 'next-auth/react'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { BuiltInProviderType } from 'next-auth/providers'
import { sanitizeUrl } from '@braintree/sanitize-url'
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons'

export const SignInPage = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const { status } = useSession()
  const { showToast } = useToast()

  const [isLoadingProviders, setIsLoadingProviders] = useState(true)

  const [providers, setProviders] =
    useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>>()

  const hasNoAuthProvider = !isLoadingProviders && Object.keys(providers ?? {}).length === 0

  useEffect(() => {
    if (status === 'authenticated') {
      const redirectPath = router.query.redirectPath?.toString()
      router.replace(redirectPath ? sanitizeUrl(redirectPath) : '/bots')
      return
    }
    ; (async () => {
      const providers = await getProviders()
      setProviders(providers ?? undefined)
      setIsLoadingProviders(false)
    })()
  }, [status, router])

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.error === 'ip-banned') {
      showToast({
        status: 'info',
        description: t('auth.error.ipBanned'),
      })
    }
  }, [router.isReady, router.query.error, showToast, t]) // Incluye t aquí para evitar la advertencia

  return (
    <SignInPageLayout title={t('auth.signin.heading')}>
      {isLoadingProviders && (
        <Stack spacing="4" alignItems="center">
          <Spinner />
        </Stack>
      )}
      {!isLoadingProviders && (
        <>
          {hasNoAuthProvider && (
            <Text>
              {t('auth.noProvider.preLink')}{' '}
              <TextLink href="https://docs.quick.bot/support/contact" isExternal>
                {t('auth.noProvider.link')}
              </TextLink>
            </Text>
          )}
          {!hasNoAuthProvider && (
            <>
              {providers?.credentials && <SignInForm />}
              <SocialLoginButtons providers={providers} />
              <CenteredTextWithOutline fontSize="xs" textAlign="center" color="text.light">
                <Text>
                  {t('auth.signin.noAccountLabel.preLink')}{' '}
                  <TextLink href="/signup" as={'span'}>
                    {t('auth.signin.noAccountLabel.link')}
                  </TextLink>
                </Text>
              </CenteredTextWithOutline>
            </>
          )}
        </>
      )}
    </SignInPageLayout>
  )
}
