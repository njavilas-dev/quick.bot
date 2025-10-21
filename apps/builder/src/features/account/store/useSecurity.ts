import { create } from 'zustand'

export interface PendingEmailRequest {
  id: string
  newEmail: string
  createdAt: string
  expiresAt: string
  status: string
}

export interface PendingPasswordChangeRequest {
  id: string
  createdAt: string
  expiresAt: string
  status: string
}

type SecurityState = {
  // Loading states
  isResetPasswordLoading: boolean
  isChangePasswordLoading: boolean
  isChangeEmailLoading: boolean

  // Loading state setters
  setIsResetPasswordLoading: (value: boolean) => void
  setIsChangePasswordLoading: (value: boolean) => void
  setIsChangeEmailLoading: (value: boolean) => void

  // Pending requests
  pendingEmailRequest: PendingEmailRequest | null
  pendingPasswordChangeRequest: PendingPasswordChangeRequest | null

  // Pending request setters
  setPendingEmailRequest: (value: PendingEmailRequest | null) => void
  setPendingPasswordChangeRequest: (value: PendingPasswordChangeRequest | null) => void

  // Password form state
  newPassword: string
  confirmPassword: string

  // Password form setters
  setNewPassword: (value: string) => void
  setConfirmPassword: (value: string) => void

  // Notification preferences
  emailNotifications: boolean
  loginAlerts: boolean

  // Notification preference setters
  setEmailNotifications: (value: boolean) => void
  setLoginAlerts: (value: boolean) => void
}

export const useSecurity = create<SecurityState>((set) => ({
  // Loading states
  isResetPasswordLoading: false,
  isChangePasswordLoading: false,
  isChangeEmailLoading: false,

  // Loading state setters
  setIsResetPasswordLoading: (value: boolean) => set({ isResetPasswordLoading: value }),
  setIsChangePasswordLoading: (value: boolean) => set({ isChangePasswordLoading: value }),
  setIsChangeEmailLoading: (value: boolean) => set({ isChangeEmailLoading: value }),

  // Pending requests
  pendingEmailRequest: null,
  pendingPasswordChangeRequest: null,

  // Pending request setters
  setPendingEmailRequest: (value: PendingEmailRequest | null) => set({ pendingEmailRequest: value }),
  setPendingPasswordChangeRequest: (value: PendingPasswordChangeRequest | null) => set({ pendingPasswordChangeRequest: value }),

  // Password form state
  newPassword: '',
  confirmPassword: '',

  // Password form setters
  setNewPassword: (value: string) => set({ newPassword: value }),
  setConfirmPassword: (value: string) => set({ confirmPassword: value }),

  // Notification preferences
  emailNotifications: false,
  loginAlerts: false,

  // Notification preference setters
  setEmailNotifications: (value: boolean) => set({ emailNotifications: value }),
  setLoginAlerts: (value: boolean) => set({ loginAlerts: value }),
}))