import { Stack, Button, Text, Spinner, VStack } from '@chakra-ui/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'
import { SignInError } from '@/features/auth/components/SignInError'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { EmailIcon } from '@urbiport/icons'
import { TextLink } from '@/components/TextLink'
import { useTranslate } from '@tolgee/react'
import { useToast, CenteredTextWithOutline, InputText } from '@urbiport/ui'
import { FormControl } from '@urbiport/ui'

export const ForgotPasswordPage = () => {
  const { t } = useTranslate()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(t('auth.forgetPassword.forgetPasswordTitle.label'))
  const [secondaryTitle, setSecondaryTitle] = useState(
    t('auth.forgetPassword.forgetPasswordSecondaryTitle.label'),
  )
  const router = useRouter()
  const { showToast } = useToast()
  const [errorMessage, setErrorMessage] = useState('')
  const [successful, setSuccessful] = useState(false)

  const handleBackToLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push('/signin')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const { email } = Object.fromEntries(formData.entries())

    const res = await fetch('/api/auth/credentials/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.status === 201) {
      setTitle(t('auth.forgetPassword.successTitle.label'))
      setSecondaryTitle('')
      setSuccessful(true)
      setLoading(false)
      return
    } else {
      setSuccessful(false)
      const data = await res.json()

      showToast({
        status: 'error',
        description: data.message,
      })

      setErrorMessage(data.message)
    }
    setLoading(false)
  }

  return (
    <SignInPageLayout title={title} secondaryTitle={secondaryTitle}>
      {loading && (
        <Stack spacing="4" alignItems="center">
          <Spinner />
        </Stack>
      )}
      {!loading && (
        <>
          {!successful ? (
            <form onSubmit={handleSubmit}>
              <VStack w="full" spacing={8}>
                <VStack w="full" spacing={6}>
                  <FormControl>
                    <InputText
                      type="email"
                      placeholder={t('auth.email.input')}
                      name="email"
                      size="lg"
                      leftIcon={<EmailIcon color="text.light" />}
                    />
                  </FormControl>
                </VStack>
                {errorMessage && errorMessage !== '' && <SignInError error={errorMessage} />}
                <Button
                  colorScheme="green"
                  type="submit"
                  size="lg"
                  width="100%"
                  color="white"
                  height="42px"
                >
                  {t('auth.signin.continue.button').toUpperCase()}
                </Button>
              </VStack>
            </form>
          ) : (
            <form onSubmit={handleBackToLogin}>
              <VStack w="full" spacing={12}>
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
              </VStack>
            </form>
          )}
          {!successful && (
            <CenteredTextWithOutline fontSize="xs" textAlign="center" color="text.light">
              <Text>
                {t('auth.register.alreadyHaveAccountLabel.preLink')}{' '}
                <TextLink href="/signin" as={'span'}>
                  {t('auth.register.alreadyHaveAccountLabel.link')}
                </TextLink>
              </Text>
            </CenteredTextWithOutline>
          )}
          {successful && (
            <CenteredTextWithOutline fontSize="xs" textAlign="center" color="text.light">
              <Text>
                {t('auth.recoverPassword.rememberPasswordQuestion.label')}{' '}
                <TextLink href="/signin">
                  {t('auth.register.alreadyHaveAccountLabel.link')}
                </TextLink>
              </Text>
            </CenteredTextWithOutline>
          )}
        </>
      )}
    </SignInPageLayout>
  )
}
