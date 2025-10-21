import { create } from 'zustand'

export interface PendingPasswordChangeRequest {
  id: string
  token: string
  createdAt: string
  expiresAt: string
  status: string
}

type PasswordChangeState = {
  // Loading state
  isChangePasswordLoading: boolean
  setIsChangePasswordLoading: (value: boolean) => void

  // Pending request
  pendingPasswordChangeRequest: PendingPasswordChangeRequest | null
  setPendingPasswordChangeRequest: (value: PendingPasswordChangeRequest | null) => void

  // Form state
  newPassword: string
  confirmPassword: string
  setNewPassword: (value: string) => void
  setConfirmPassword: (value: string) => void

  // Modal state
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void

  // Actions
  clearForm: () => void
  resetState: () => void
}

export const usePasswordChange = create<PasswordChangeState>((set) => ({
  // Loading state
  isChangePasswordLoading: false,
  setIsChangePasswordLoading: (value: boolean) => set({ isChangePasswordLoading: value }),

  // Pending request
  pendingPasswordChangeRequest: null,
  setPendingPasswordChangeRequest: (value: PendingPasswordChangeRequest | null) => set({ pendingPasswordChangeRequest: value }),

  // Form state
  newPassword: '',
  confirmPassword: '',
  setNewPassword: (value: string) => set({ newPassword: value }),
  setConfirmPassword: (value: string) => set({ confirmPassword: value }),

  // Modal state
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  // Actions
  clearForm: () => set({ newPassword: '', confirmPassword: '' }),
  resetState: () => set({
    isChangePasswordLoading: false,
    pendingPasswordChangeRequest: null,
    newPassword: '',
    confirmPassword: '',
    isModalOpen: false,
  }),
}))
