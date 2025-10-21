import { useTranslate } from '@tolgee/react'
import { Alert } from '@chakra-ui/react'

type Props = {
  error: string
}

export const SignInError = ({ error }: Props) => {
  const { t } = useTranslate()
  const errors: Record<string, string> = {
    Signin: t('auth.error.default'),
    OAuthSignin: t('auth.error.default'),
    OAuthCallback: t('auth.error.default'),
    OAuthCreateAccount: t('auth.error.email'),
    EmailCreateAccount: t('auth.error.default'),
    Callback: t('auth.error.default'),
    OAuthAccountNotLinked: t('auth.error.oauthNotLinked'),
    EmailSendError: t('auth.error.emailSendFailed'),
    default: t('auth.error.unknown'),
  }

  const message = !errors[error] ? error : errors[error]
  return <Alert status="error">{message}</Alert>
}
