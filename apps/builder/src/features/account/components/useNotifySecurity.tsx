import { useToast } from "@urbiport/ui"
import { useSecurityNotifications } from "@/features/account/store/useSecurityNotifications"

export const useNotifySecurity = () => {
  const { showToast } = useToast()

  const {
    emailNotifications,
    loginAlerts,
    isUpdating,
    setEmailNotifications,
    setLoginAlerts,
    setIsUpdating,
  } = useSecurityNotifications()

  const handleEmailNotificationsToggle = async (enabled: boolean) => {
    try {
      setIsUpdating(true)
      setEmailNotifications(enabled)

      // TODO: Update user preferences in the backend
      // await updateUserPreferences({ emailNotifications: enabled })

      showToast({
        status: 'success',
        description: enabled
          ? 'Security email notifications enabled'
          : 'Security email notifications disabled',
      })
    } catch (error) {
      console.error('Error updating email notifications:', error)
      showToast({
        status: 'error',
        description: 'Failed to update email notifications',
      })
      // Revert the change on error
      setEmailNotifications(!enabled)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLoginAlertsToggle = async (enabled: boolean) => {
    try {
      setIsUpdating(true)
      setLoginAlerts(enabled)

      // TODO: Update user preferences in the backend
      // await updateUserPreferences({ loginAlerts: enabled })

      showToast({
        status: 'success',
        description: enabled
          ? 'Login alerts enabled'
          : 'Login alerts disabled',
      })
    } catch (error) {
      console.error('Error updating login alerts:', error)
      showToast({
        status: 'error',
        description: 'Failed to update login alerts',
      })
      // Revert the change on error
      setLoginAlerts(!enabled)
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    handleEmailNotificationsToggle,
    handleLoginAlertsToggle,
    emailNotifications,
    loginAlerts,
    isUpdating,
  }
}