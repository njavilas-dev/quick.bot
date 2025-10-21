import { useUser } from "@/hooks/useUser"
import { useToast } from "@urbiport/ui"
import { useTranslate } from "@tolgee/react"
import { useSecurity } from "@/features/account/store/useSecurity"
import { useDisclosure } from "@chakra-ui/react"

export const useResetPassword = () => {

  const { user } = useUser()
  const { showToast } = useToast()
  const { t } = useTranslate()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const setIsResetPasswordLoading = useSecurity((state) => state.setIsResetPasswordLoading)

  const resetPassword = async () => {
    if (!user?.email || !user?.id) return

    try {
      setIsResetPasswordLoading(true)
      const res = await fetch('/api/auth/credentials/reset-password-with-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      if (res.status === 201) {
        const data = await res.json()

        if (data.token) {
          showToast({
            status: 'success',
            title: t('account.myAccount.passwordResetSuccess.title'),
            description: t('account.myAccount.passwordResetSuccess.description'),
          })

          window.location.href = `/account/profile?resetToken=${data.token}`
        } else {
          showToast({
            status: 'success',
            title: t('account.myAccount.passwordResetSuccess.title'),
            description: t('account.myAccount.passwordResetSuccess.description'),
          })
        }
      } else {
        const data = await res.json()
        showToast({
          status: 'error',
          title: t('account.myAccount.passwordResetError.title'),
          description: data.message || t('account.myAccount.passwordResetError.description'),
        })
      }
    } catch (error) {
      console.error(error)
      showToast({
        status: 'error',
        title: t('account.myAccount.passwordResetError.title'),
        description: t('account.myAccount.passwordResetError.unexpectedDescription'),
      })
    } finally {
      setIsResetPasswordLoading(false)
      onClose()
    }
  }

  return {
    isOpen,
    onOpen,
    onClose,
    resetPassword,
  }
}

export default useResetPassword