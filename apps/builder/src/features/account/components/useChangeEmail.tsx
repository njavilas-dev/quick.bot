import { useEffect } from 'react'
import { useToast } from '@urbiport/ui'
import { useEmailChange } from '@/features/account/store/useEmailChange'

export const useChangeEmail = () => {
  const { showToast } = useToast()

  const {
    isModalOpen: isOpen,
    openModal: onOpen,
    closeModal: onClose,
    isChangeEmailLoading,
    setIsChangeEmailLoading,
    pendingEmailRequest,
    setPendingEmailRequest,
    newEmail,
    setNewEmail,
    clearForm,
  } = useEmailChange()

  const checkPendingRequest = async () => {
    try {
      const response = await fetch('/api/account/pending-email-change', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hasPendingRequest) {
          setPendingEmailRequest(data.pendingRequest)
        } else {
          setPendingEmailRequest(null)
        }
      }
    } catch (error) {
      console.error('Error checking pending email request:', error)
    }
  }

  const requestEmailChange = async () => {
    if (!newEmail || newEmail.trim() === '') {
      showToast({
        status: 'error',
        title: 'Error',
        description: 'Please enter a valid email',
      })
      return
    }

    try {
      setIsChangeEmailLoading(true)
      const response = await fetch('/api/account/request-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          status: 'success',
          title: 'Request sent',
          description: `We have sent a confirmation email to ${newEmail}. Please check your inbox. ${pendingEmailRequest ? 'The previous request was automatically cancelled.' : ''}`,
        })
        clearForm()
        await checkPendingRequest()
      } else {
        showToast({
          status: 'error',
          title: 'Error requesting change',
          description: data.message || 'Could not process the request',
        })
      }
    } catch (error) {
      console.error('Error requesting email change:', error)
      showToast({
        status: 'error',
        title: 'Error',
        description: 'Unexpected error processing the request',
      })
    } finally {
      setIsChangeEmailLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestEmailChange()
    onClose()
  }


  useEffect(() => {
    checkPendingRequest()
  }, [])

  return {
    isOpen,
    onOpen,
    onClose,
    isChangeEmailLoading,
    pendingEmailRequest,
    newEmail,
    setNewEmail,
    handleEmailSubmit,
  }
}