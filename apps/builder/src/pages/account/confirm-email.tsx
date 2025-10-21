import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Text, Button, VStack, Alert, AlertIcon, Spinner } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { useSession } from 'next-auth/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'

export default function ConfirmEmailPage() {
  const { t } = useTranslate()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { token } = router.query
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'expired' | 'invalid' | 'unavailable'
  >('loading')
  const [message, setMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (sessionStatus === 'loading') return

    if (sessionStatus === 'authenticated' && session) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [sessionStatus, session, router])

  useEffect(() => {
    if (!token) return

    const confirmEmailChange = async () => {
      try {
        const response = await fetch('/api/account/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(
            data.message ||
              t('auth.confirmEmailChange.message.success', 'Email changed successfully'),
          )
          // Redirigir después de 3 segundos para que el usuario vea el mensaje
          setTimeout(() => {
            router.replace(isAuthenticated ? '/account/profile' : '/')
          }, 3000)
        } else {
          // Distinguir entre diferentes tipos de error
          if (data.errorType === 'EXPIRED_TOKEN') {
            setStatus('expired')
            setMessage(
              data.message || t('auth.confirmEmailChange.message.expired', 'Token has expired'),
            )
          } else if (data.errorType === 'INVALID_TOKEN') {
            setStatus('invalid')
            setMessage(
              data.message || t('auth.confirmEmailChange.message.invalid', 'Invalid token'),
            )
          } else if (data.errorType === 'EMAIL_UNAVAILABLE') {
            setStatus('unavailable')
            setMessage(
              data.message ||
                t('auth.confirmEmailChange.message.unavailable', 'Email is no longer available'),
            )
          } else {
            setStatus('error')
            setMessage(
              data.message ||
                t('auth.confirmEmailChange.message.error', 'Failed to confirm email change'),
            )
          }
        }
      } catch (error: unknown) {
        console.error(error)
        setStatus('error')
        setMessage(t('auth.confirmEmailChange.message.error', 'An unexpected error occurred'))
      }
    }

    confirmEmailChange()
  }, [token, router, isAuthenticated, t])

  const handleGoToProfile = () => {
    router.push('/account/profile')
  }

  const handleRequestNewChange = () => {
    router.push('/account/profile')
  }

  const getTitle = () => {
    if (status === 'loading') {
      return t('auth.confirmEmailChange.loading', 'Verificando Cambio')
    }
    if (status === 'success') {
      return t('auth.confirmEmailChange.title.success', 'Email Actualizado')
    }
    if (status === 'expired') {
      return t('auth.confirmEmailChange.title.expired', 'Token Expirado')
    }
    if (status === 'invalid') {
      return t('auth.confirmEmailChange.title.invalid', 'Token Inválido')
    }
    if (status === 'unavailable') {
      return t('auth.confirmEmailChange.title.unavailable', 'Email No Disponible')
    }
    return t('auth.confirmEmailChange.title.error', 'Error en el Proceso')
  }

  const getSecondaryTitle = () => {
    if (status === 'loading') {
      return t('auth.confirmEmailChange.processing', 'Procesando tu solicitud...')
    }
    if (status === 'success') {
      return t(
        'auth.confirmEmailChange.subtitle.success',
        'Tu email ha sido actualizado correctamente',
      )
    }
    if (status === 'expired') {
      return t(
        'auth.confirmEmailChange.subtitle.expired',
        'El enlace ha expirado, solicita uno nuevo',
      )
    }
    if (status === 'invalid') {
      return t('auth.confirmEmailChange.subtitle.invalid', 'El enlace no es válido')
    }
    if (status === 'unavailable') {
      return t('auth.confirmEmailChange.subtitle.unavailable', 'El email ya no está disponible')
    }
    return t('auth.confirmEmailChange.subtitle.error', 'No se pudo completar el cambio')
  }

  return (
    <SignInPageLayout title={getTitle()} secondaryTitle={getSecondaryTitle()} omitRedirect>
      <VStack direction="column" spacing={8}>
        {status === 'loading' ? (
          <VStack spacing={4}>
            <Spinner size="lg" />
            <Text>
              {t('auth.confirmEmailChange.subtitle.loading', 'Confirming email change...')}
            </Text>
          </VStack>
        ) : (
          <VStack spacing={6}>
            {status === 'success' ? (
              <Alert status="success">
                <AlertIcon />
                <Text>{message}</Text>
              </Alert>
            ) : status === 'expired' ? (
              <Alert status="warning">
                <AlertIcon />
                <Text>{message}</Text>
              </Alert>
            ) : status === 'invalid' ? (
              <Alert status="error">
                <AlertIcon />
                <Text>{message}</Text>
              </Alert>
            ) : status === 'unavailable' ? (
              <Alert status="error">
                <AlertIcon />
                <Text>{message}</Text>
              </Alert>
            ) : (
              <Alert status="error">
                <AlertIcon />
                <Text>{message}</Text>
              </Alert>
            )}

            <Button
              onClick={
                status === 'success'
                  ? isAuthenticated
                    ? handleGoToProfile
                    : handleGoToProfile
                  : status === 'expired'
                  ? handleRequestNewChange
                  : status === 'invalid'
                  ? handleGoToProfile
                  : status === 'unavailable'
                  ? handleGoToProfile
                  : isAuthenticated
                  ? handleGoToProfile
                  : handleGoToProfile
              }
              colorScheme={
                status === 'success' ? 'green' : status === 'expired' ? 'orange' : 'blue'
              }
              size="lg"
              width="full"
            >
              {status === 'success'
                ? t('auth.confirmEmailChange.goToProfile', 'Go to Profile')
                : status === 'expired'
                ? t('auth.confirmEmailChange.requestNew', 'Request New Email Change')
                : status === 'invalid'
                ? t('auth.confirmEmailChange.goToProfile', 'Go to Profile')
                : status === 'unavailable'
                ? t('auth.confirmEmailChange.goToProfile', 'Go to Profile')
                : isAuthenticated
                ? t('auth.confirmEmailChange.goToProfile', 'Go to Profile')
                : t('auth.confirmEmailChange.goToProfile', 'Go to Profile')}
            </Button>

            {status === 'success' && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                {t(
                  'auth.confirmEmailChange.redirecting',
                  'Redirecting automatically in a few seconds...',
                )}
              </Text>
            )}
          </VStack>
        )}
      </VStack>
    </SignInPageLayout>
  )
}
