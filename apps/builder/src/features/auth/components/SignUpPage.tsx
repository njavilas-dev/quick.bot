import { Text, Spinner, Box, Stack } from '@chakra-ui/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { TextLink } from '@/components/TextLink'
import { useTranslate } from '@tolgee/react'
import { ClientSafeProvider, getProviders, LiteralUnion, useSession } from 'next-auth/react'
import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { BuiltInProviderType } from 'next-auth/providers'
import { sanitizeUrl } from '@braintree/sanitize-url'
import { useToast, CenteredTextWithOutline } from '@urbiport/ui'

export const SignUpPage = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const { status } = useSession()
  const { showToast } = useToast()

  const [title] = useState(t('auth.register.heading'))

  const [isLoading, setIsLoading] = useState(true)

  const [providers, setProviders] =
    useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>>()

  const hasNoAuthProvider = !isLoading && Object.keys(providers ?? {}).length === 0

  useEffect(() => {
    if (status === 'authenticated') {
      const redirectPath = router.query.redirectPath?.toString()
      router.replace(redirectPath ? sanitizeUrl(redirectPath) : '/bots')
      return
    }
    ; (async () => {
      const providers = await getProviders()
      setProviders(providers ?? undefined)
      setIsLoading(false)
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
  }, [router.isReady, router.query.error, showToast, t])

  return (
    <SignInPageLayout title={title}>
      {isLoading && (
        <Stack spacing="4" alignItems="center">
          <Spinner />
        </Stack>
      )}
      {!isLoading && (
        <>
          {hasNoAuthProvider && (
            <Box>
              <Text>
                <span>{t('auth.noProvider.preLink')} </span>
                <TextLink href="https://docs.quick.bot/support/contact" isExternal>
                  {t('auth.noProvider.link')}
                </TextLink>
              </Text>
            </Box>
          )}
          {!hasNoAuthProvider && providers?.credentials && <SignUpForm />}
        </>
      )}

      <CenteredTextWithOutline fontSize="xs" textAlign="center" color="text.light">
        <Box>
          <Text>
            <span>{t('auth.register.alreadyHaveAccountLabel.preLink')} </span>
            <TextLink href="/signin" as={'span'}>
              {t('auth.register.alreadyHaveAccountLabel.link')}
            </TextLink>
          </Text>
        </Box>
      </CenteredTextWithOutline>
    </SignInPageLayout>
  )
}
