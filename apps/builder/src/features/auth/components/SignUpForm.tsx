import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslate } from '@tolgee/react'
import {
  Button,
  Stack,
  Spinner,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from '@chakra-ui/react'
import { FormControl, InputText, useToast, InputPassword } from '@urbiport/ui'
import { ChevronLeftIcon, EmailIcon, UserIcon } from '@urbiport/icons'
import { SignInError } from './SignInError'

export const SignUpForm = () => {
  const { t } = useTranslate()
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    const formData = new FormData(event.currentTarget)
    const { name, lastname, email, password } = Object.fromEntries(formData.entries())

    const res = await fetch('/api/auth/credentials/auth-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, lastname, email, password }),
    })

    const data = await res.json()
    setIsLoading(false)

    if (res.status === 201) {
      setIsRegistrationComplete(true)
      setRegisteredEmail(email as string)

      showToast({
        status: 'success',
        description: t('auth.register.emailVerificationSent'),
      })
      return
    }

    if (res.status === 200 && data.resendAttempted) {
      setIsRegistrationComplete(true)
      setRegisteredEmail(email as string)

      showToast({
        status: 'info',
        description: t('auth.register.emailVerificationResent', {
          defaultValue: 'A new verification email has been sent to your address.',
        }),
      })
      return
    }

    setErrorMessage(data.message)
    showToast({
      status: 'error',
      description: data.message,
    })
  }

  return (
    <>
      {isLoading && (
        <Stack spacing="4" alignItems="center">
          <Spinner />
        </Stack>
      )}

      {isRegistrationComplete && !isLoading && (
        <VStack w="full" spacing={6} py={4}>
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="md"
            p={6}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {t('auth.register.verificationNeeded')}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              <Text mb={4}>
                {t('auth.register.emailVerificationText', { email: registeredEmail })}
              </Text>
              <Box>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push('/signin')}
                  size="md"
                  mt={2}
                  leftIcon={<ChevronLeftIcon />}
                >
                  {t('auth.signin.heading')}
                </Button>
              </Box>
            </AlertDescription>
          </Alert>
        </VStack>
      )}

      {!isLoading && !isRegistrationComplete && (
        <form onSubmit={handleSubmit}>
          <VStack w="full" spacing={8}>
            <VStack w="full" spacing={6}>
              <Stack direction="row" spacing={6} width="100%">
                <FormControl>
                  <InputText
                    name="name"
                    placeholder={t('auth.firstname.input')}
                    size="lg"
                    leftIcon={<UserIcon color="text.light" />}
                    isRequired
                  />
                </FormControl>
                <FormControl>
                  <InputText
                    name="lastname"
                    placeholder={t('auth.lastname.input')}
                    size="lg"
                    leftIcon={<UserIcon color="text.light" />}
                    isRequired
                  />
                </FormControl>
              </Stack>
              <FormControl>
                <InputText
                  type="email"
                  name="email"
                  placeholder={t('auth.email.input')}
                  size="lg"
                  leftIcon={<EmailIcon color="text.light" />}
                  isRequired
                />
              </FormControl>
              <FormControl>
                <InputPassword
                  isRequired
                  size="lg"
                  name="password"
                  placeholder={t('auth.password.input')}
                  title={t('auth.password.invalid')}
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
              {t('auth.register.button').toUpperCase()}
            </Button>
          </VStack>
        </form>
      )}
    </>
  )
}
