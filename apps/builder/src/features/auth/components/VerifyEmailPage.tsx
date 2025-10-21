import { Box, Stack, Button, Spinner } from '@chakra-ui/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useTranslate } from '@tolgee/react'
import { validateVerifyEmailToken } from '@/features/auth/helpers/validateVerifyEmailToken'

export const VerifyEmailPage = () => {
  const { t } = useTranslate()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [title, setTitle] = useState(t('auth.verifyEmail.validatingTokenTitle.label'))
  const [secondaryTitle, setSecondaryTitle] = useState(
    t('auth.verifyEmail.validatingTokenSecondaryTitle.label'),
  )

  const router = useRouter()

  const setInvalidTokenTitle = useCallback(() => {
    setTitle(t('auth.verifyEmail.invalidTokenTitle.label'))
    setSecondaryTitle(t('auth.verifyEmail.invalidTokenSecondaryTitle.label'))
  }, [t])

  const setSuccessVerifyEmailTitle = useCallback(() => {
    setTitle(t('auth.verifyEmail.successTitle.label'))
    setSecondaryTitle(t('auth.verifyEmail.successSecondaryTitle.label'))
  }, [t])

  useEffect(() => {
    setLoading(true)
    const existingToken = router.query.token?.toString() ?? null
    setToken(existingToken)
    if (existingToken && !token) {
      setLoading(true)
      validateVerifyEmailToken(existingToken)
        .then((result) => {
          if (result) {
            setSuccessVerifyEmailTitle()
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
  }, [token, router, setSuccessVerifyEmailTitle, setInvalidTokenTitle, t])

  const handleBackToLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await router.push('/signin')
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
          <form onSubmit={handleBackToLogin}>
            <Box margin="auto" width="428px">
              <Stack direction="column" spacing={12}>
                <Box>
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
                </Box>
              </Stack>
            </Box>
          </form>
        </Stack>
      )}
      {!loading && !isValidToken && (
        <Stack spacing="4">
          <form onSubmit={handleBackToLogin}>
            <Box margin="auto" width="428px">
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
            </Box>
          </form>
        </Stack>
      )}
    </SignInPageLayout>
  )
}
