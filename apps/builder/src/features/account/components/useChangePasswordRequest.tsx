import { useEffect, useCallback } from 'react'
import { useToast } from '@urbiport/ui'
import { usePasswordChange } from '@/features/account/store/usePasswordChange'

export const useChangePasswordRequest = () => {
  const { showToast } = useToast()

  const {
    isModalOpen: isOpen,
    openModal: onOpen,
    closeModal: onClose,
    isChangePasswordLoading,
    setIsChangePasswordLoading,
    pendingPasswordChangeRequest,
    setPendingPasswordChangeRequest,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    clearForm,
  } = usePasswordChange()

  const checkPendingRequest = useCallback(async () => {
    try {
      const response = await fetch('/api/account/pending-password-change', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hasPendingRequest) {
          setPendingPasswordChangeRequest(data.pendingRequest)
        } else {
          setPendingPasswordChangeRequest(null)
        }
      }
    } catch (error) {
      console.error('Error checking pending password change request:', error)
    }
  }, [setPendingPasswordChangeRequest])

  const requestPasswordChange = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

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
      const response = await fetch('/api/account/request-password-change', {
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
          description:
            'Password change request sent. Please check your email to confirm the change.',
        })
        clearForm()
        onClose()
        await checkPendingRequest()
      } else {
        const data = await response.json()
        showToast({
          status: 'error',
          description: data.message || 'Failed to request password change',
        })
      }
    } catch (error) {
      console.error('Error requesting password change:', error)
      showToast({
        status: 'error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsChangePasswordLoading(false)
    }
  }

  const cancelPasswordChangeRequest = async () => {
    if (!pendingPasswordChangeRequest) return

    try {
      const response = await fetch('/api/account/cancel-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: pendingPasswordChangeRequest.token, // Usar el token real
        }),
      })

      if (response.ok) {
        showToast({
          status: 'success',
          description: 'Password change request cancelled successfully',
        })
        setPendingPasswordChangeRequest(null)
      } else {
        const data = await response.json()
        showToast({
          status: 'error',
          description: data.message || 'Failed to cancel password change request',
        })
      }
    } catch (error) {
      console.error('Error cancelling password change request:', error)
      showToast({
        status: 'error',
        description: 'An unexpected error occurred',
      })
    }
  }

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value)
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
  }

  useEffect(() => {
    checkPendingRequest()
  }, [checkPendingRequest])

  return {
    isOpen,
    onOpen,
    onClose,
    newPassword,
    confirmPassword,
    isChangePasswordLoading,
    requestPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    pendingPasswordChangeRequest,
    checkPendingRequest,
    cancelPasswordChangeRequest,
  }
}
