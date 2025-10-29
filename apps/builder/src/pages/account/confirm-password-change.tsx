import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Text, Button, VStack, Alert, AlertIcon, Spinner } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { useSession } from 'next-auth/react'
import { SignInPageLayout } from '@/features/auth/components/SignInLayout'
import { AccountLayout } from '@/components/layouts/AccountLayout'
import type { ReactNode } from 'react'

function ConfirmPasswordChangePage() {
  const { t } = useTranslate()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { token } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'invalid'>(
    'loading',
  )
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

    const confirmPasswordChange = async () => {
      try {
        const response = await fetch('/api/account/confirm-password-change', {
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
              t('auth.confirmPasswordChange.message.success', 'Password changed successfully'),
          )
          router.replace('/')
        } else {
          // Distinguir entre diferentes tipos de error
          if (data.errorType === 'EXPIRED_TOKEN') {
            setStatus('expired')
            setMessage(
              data.message || t('auth.confirmPasswordChange.message.expired', 'Token has expired'),
            )
          } else if (data.errorType === 'INVALID_TOKEN') {
            setStatus('invalid')
            setMessage(
              data.message || t('auth.confirmPasswordChange.message.invalid', 'Invalid token'),
            )
          } else {
            setStatus('error')
            setMessage(
              data.message ||
                t('auth.confirmPasswordChange.message.error', 'Failed to confirm password change'),
            )
          }
        }
      } catch (error: unknown) {
        console.log(error)
        setStatus('error')
        setMessage(t('auth.confirmPasswordChange.message.error', 'An unexpected error occurred'))
      }
    }

    confirmPasswordChange()
  }, [token, router, t])

  const handleGoToSecurity = () => {
    router.push('/account/security')
  }

  const handleGoToProfile = () => {
    router.push('/account/profile')
  }

  const getTitle = () => {
    if (status === 'loading') {
      return t('auth.confirmPasswordChange.loading', 'Verificando Cambio')
    }
    if (status === 'success') {
      return t('auth.confirmPasswordChange.title.success', 'Contraseña Actualizada')
    }
    if (status === 'expired') {
      return t('auth.confirmPasswordChange.title.expired', 'Token Expirado')
    }
    if (status === 'invalid') {
      return t('auth.confirmPasswordChange.title.invalid', 'Token Inválido')
    }
    return t('auth.confirmPasswordChange.title.error', 'Error en el Proceso')
  }

  const getSecondaryTitle = () => {
    if (status === 'loading') {
      return t('auth.confirmPasswordChange.processing', 'Procesando tu solicitud...')
    }
    if (status === 'success') {
      return t('auth.confirmPasswordChange.subtitle.success', 'Tu cuenta está ahora más segura')
    }
    if (status === 'expired') {
      return t(
        'auth.confirmPasswordChange.subtitle.expired',
        'El enlace ha expirado, solicita uno nuevo',
      )
    }
    if (status === 'invalid') {
      return t('auth.confirmPasswordChange.subtitle.invalid', 'El enlace no es válido')
    }
    return t('auth.confirmPasswordChange.subtitle.error', 'No se pudo completar el cambio')
  }

  return (
    <SignInPageLayout title={getTitle()} secondaryTitle={getSecondaryTitle()} omitRedirect>
      <VStack direction="column" spacing={8}>
        {status === 'loading' ? (
          <VStack spacing={4}>
            <Spinner size="lg" />
            <Text>
              {t('auth.confirmPasswordChange.subtitle.loading', 'Confirming password change...')}
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
            ) : (
              <Alert status="error">
                <AlertIcon />
                <Text>{message}</Text>
              </Alert>
            )}

            <Button
              onClick={isAuthenticated ? handleGoToSecurity : handleGoToProfile}
              colorScheme={
                status === 'success' ? 'green' : status === 'expired' ? 'orange' : 'blue'
              }
              size="lg"
              width="full"
            >
              {status === 'success'
                ? isAuthenticated
                  ? t('auth.confirmPasswordChange.goToSecurity', 'Go to Security Settings')
                  : t('auth.confirmPasswordChange.goToProfile', 'Go to Profile')
                : status === 'expired'
                ? t('auth.confirmPasswordChange.requestNew', 'Request New Password Change')
                : status === 'invalid'
                ? t('auth.confirmPasswordChange.goToProfile', 'Go to Profile')
                : isAuthenticated
                ? t('auth.confirmPasswordChange.goToSecurity', 'Go to Security Settings')
                : t('auth.confirmPasswordChange.goToProfile', 'Go to Profile')}
            </Button>
          </VStack>
        )}
      </VStack>
    </SignInPageLayout>
  )
}

ConfirmPasswordChangePage.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default ConfirmPasswordChangePage
