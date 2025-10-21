import { useState } from 'react'
import { VStack, Button } from '@chakra-ui/react'
import { SignInError } from '@/features/auth/components/SignInError'
import { FormControl, InputPassword, useToast } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/router'

interface ResetPasswordFormProps {
  token: string | null
  isAuthenticated?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

export const ResetPasswordForm = ({
  token,
  isAuthenticated = true,
  onSuccess,
  onError,
}: ResetPasswordFormProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { showToast } = useToast()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    const { password, confirmPassword } = Object.fromEntries(formData.entries())

    if (password !== confirmPassword) {
      const message = t('auth.passwordMismatch', 'Passwords do not match.')
      setErrorMessage(message)
      if (onError) onError(message)
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isAuthenticated
        ? '/api/auth/credentials/reset-password-authenticated'
        : '/api/auth/credentials/reset-password'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword, token }),
      })

      if (res.status === 200 || res.status === 201) {
        showToast({
          status: 'success',
          title: t('auth.recoverPassword.successTitle.label'),
          description: t(
            'auth.recoverPassword.successDescription.label',
            'Your password has been reset successfully.',
          ),
        })

        if (onSuccess) {
          onSuccess()
        } else if (isAuthenticated) {
          router.replace('/account/profile', undefined, { shallow: true })
        }
      } else {
        const data = await res.json()
        showToast({
          status: 'error',
          description: data.message,
        })
        setErrorMessage(data.message)
        if (onError) onError(data.message)
      }
    } catch (error) {
      console.error(error)
      const message = t('auth.unexpectedError', 'An unexpected error occurred.')
      setErrorMessage(message)
      if (onError) onError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack w="full" spacing={3}>
        <VStack w="full" spacing={3}>
          <FormControl>
            <InputPassword
              isRequired
              size="lg"
              name="password"
              placeholder={t('auth.newPassword.input')}
              title={t('auth.password.invalid')}
            />
          </FormControl>
          <FormControl>
            <InputPassword
              isRequired
              size="lg"
              name="confirmPassword"
              placeholder={t('auth.repeatNewPassword.input')}
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
          isLoading={isLoading}
        >
          {t('auth.signin.continue.button').toUpperCase()}
        </Button>
      </VStack>
    </form>
  )
}
