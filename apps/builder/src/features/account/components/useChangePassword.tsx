import { useToast } from "@urbiport/ui"
import { useDisclosure } from "@chakra-ui/react"
import { useSecurity } from "@/features/account/store/useSecurity"

export const useChangePassword = () => {
  const { showToast } = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const isChangePasswordLoading = useSecurity((state) => state.isChangePasswordLoading)
  const setIsChangePasswordLoading = useSecurity((state) => state.setIsChangePasswordLoading)

  const newPassword = useSecurity((state) => state.newPassword)
  const confirmPassword = useSecurity((state) => state.confirmPassword)
  const setNewPassword = useSecurity((state) => state.setNewPassword)
  const setConfirmPassword = useSecurity((state) => state.setConfirmPassword)

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showToast({
        status: 'error',
        description: 'Passwords do not match',
      })
      return
    }

    if (newPassword.length < 6) {
      showToast({
        status: 'error',
        description: 'Password must be at least 6 characters long',
      })
      return
    }

    try {
      setIsChangePasswordLoading(true)
      const response = await fetch('/api/auth/credentials/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          confirmPassword: confirmPassword,
        }),
      })

      if (response.ok) {
        showToast({
          status: 'success',
          description: 'Password changed successfully',
        })
        setNewPassword('')
        setConfirmPassword('')
        onClose()
      } else {
        const data = await response.json()
        showToast({
          status: 'error',
          description: data.message || 'Failed to change password',
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      showToast({
        status: 'error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsChangePasswordLoading(false)
    }
  }

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value)
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
  }

  return {
    isOpen,
    onOpen,
    onClose,
    newPassword,
    confirmPassword,
    isChangePasswordLoading,
    changePassword,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
  }
}