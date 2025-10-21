import { Box, Stack, Button, Text, Spinner } from '@chakra-ui/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { TextLink } from '@/components/TextLink'
import { useTranslate } from '@tolgee/react'
import { validateResetPasswordToken } from '@/features/auth/helpers/validateResetPasswordToken'
import { CenteredTextWithOutline } from '@urbiport/ui'
import { useSession } from 'next-auth/react'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export const ResetPasswordPage = () => {
  const { t } = useTranslate()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [title, setTitle] = useState(t('auth.recoverPassword.resetPasswordTokenTitle.label'))
  const [secondaryTitle, setSecondaryTitle] = useState(
    t('auth.recoverPassword.resetPasswordTokenSecondaryTitle.label'),
  )

  const router = useRouter()
  const { data: session } = useSession()

  const setInvalidTokenTitle = useCallback(() => {
    setTitle(t('auth.recoverPassword.invalidTokenTitle.label'))
    setSecondaryTitle(t('auth.recoverPassword.invalidTokenSecondaryTitle.label'))
  }, [t])

  const setValidateTokenTitle = useCallback(() => {
    setTitle(t('auth.recoverPassword.validatingTokenTitle.label'))
    setSecondaryTitle(t('auth.recoverPassword.validatingTokenSecondaryTitle.label'))
  }, [t])

  const setDefaultTitle = useCallback(() => {
    setTitle(t('auth.recoverPassword.resetPasswordTokenTitle.label'))
    setSecondaryTitle(t('auth.recoverPassword.resetPasswordTokenSecondaryTitle.label'))
  }, [t])

  useEffect(() => {
    setLoading(true)
    setValidateTokenTitle()
    const existingToken = router.query.token?.toString() ?? null

    if (session?.user && existingToken) {
      router.replace(`/account/profile?resetToken=${existingToken}`)
      return
    }

    setToken(existingToken)
    if (existingToken && !token) {
      setLoading(true)
      validateResetPasswordToken(existingToken)
        .then((result) => {
          if (result) {
            setDefaultTitle()
          } else {
            setInvalidTokenTitle()
          }
          setIsValidToken(result)
        })
        .finally(() => setLoading(false))
    } else {
      setInvalidTokenTitle()
      setLoading(false)
    }
  }, [token, router, session, setDefaultTitle, setInvalidTokenTitle, setValidateTokenTitle])

  const [successful, setSuccessful] = useState(false)

  const handleBackToLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await router.push('/signin')
  }

  const handlePasswordResetSuccess = () => {
    setTitle(t('auth.recoverPassword.successTitle.label'))
    setSecondaryTitle(t('auth.recoverPassword.successSecondaryTitle.label'))
    setSuccessful(true)
    setLoading(false)
  }

  const handlePasswordResetError = () => {
    setSuccessful(false)
    setLoading(false)
  }

  return (
    <SignInPageLayout title={title} secondaryTitle={secondaryTitle}>
      {loading && (
        <Stack spacing="4" alignItems="center">
          <Spinner />
        </Stack>
      )}
      {!loading && isValidToken && (
        <Stack spacing="4">
          {!successful ? (
            <>
              <ResetPasswordForm
                token={token}
                isAuthenticated={false}
                onSuccess={handlePasswordResetSuccess}
                onError={handlePasswordResetError}
              />
              <CenteredTextWithOutline fontSize="xs" textAlign="center" color="text.light">
                <Text>
                  {t('auth.recoverPassword.rememberPasswordQuestion.label')}{' '}
                  <TextLink href="/signin">
                    {t('auth.register.alreadyHaveAccountLabel.link')}
                  </TextLink>
                </Text>
              </CenteredTextWithOutline>
            </>
          ) : (
            <form onSubmit={handleBackToLogin}>
              <Button
                colorScheme="green"
                type="submit"
                size="lg"
                width="100%"
                color="white"
                height="42px"
              >
                {t('auth.signin.backToLogin.button').toUpperCase()}
              </Button>
            </form>
          )}
        </Stack>
      )}
      {!loading && !isValidToken && (
        <Stack spacing="4">
          <form onSubmit={handleBackToLogin}>
            <Box margin="auto" width="428px">
              <Button colorScheme="green" type="submit" size="lg" width="100%" color="white">
                {t('auth.signin.backToLogin.button').toUpperCase()}
              </Button>
            </Box>
          </form>
        </Stack>
      )}
    </SignInPageLayout>
  )
}
