import { create } from 'zustand'

type SecurityNotificationsState = {
  emailNotifications: boolean
  loginAlerts: boolean
  isUpdating: boolean
  setEmailNotifications: (value: boolean) => void
  setLoginAlerts: (value: boolean) => void
  setIsUpdating: (value: boolean) => void
  toggleEmailNotifications: () => void
  toggleLoginAlerts: () => void
  resetState: () => void
}

export const useSecurityNotifications = create<SecurityNotificationsState>((set, get) => ({
  emailNotifications: false,
  loginAlerts: false,
  isUpdating: false,
  setEmailNotifications: (value: boolean) => set({ emailNotifications: value }),
  setLoginAlerts: (value: boolean) => set({ loginAlerts: value }),
  setIsUpdating: (value: boolean) => set({ isUpdating: value }),
  toggleEmailNotifications: () => {
    const current = get().emailNotifications
    set({ emailNotifications: !current })
  },
  toggleLoginAlerts: () => {
    const current = get().loginAlerts
    set({ loginAlerts: !current })
  },
  resetState: () => set({
    emailNotifications: false,
    loginAlerts: false,
    isUpdating: false,
  }),
}))
