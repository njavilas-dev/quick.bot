import { create } from 'zustand'

export interface PendingEmailRequest {
  id: string
  newEmail: string
  createdAt: string
  expiresAt: string
  status: string
}

type EmailChangeState = {
  // Loading state
  isChangeEmailLoading: boolean
  setIsChangeEmailLoading: (value: boolean) => void

  // Pending request
  pendingEmailRequest: PendingEmailRequest | null
  setPendingEmailRequest: (value: PendingEmailRequest | null) => void

  // Form state
  newEmail: string
  setNewEmail: (value: string) => void

  // Modal state
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void

  // Actions
  clearForm: () => void
  resetState: () => void
}

export const useEmailChange = create<EmailChangeState>((set) => ({
  // Loading state
  isChangeEmailLoading: false,
  setIsChangeEmailLoading: (value: boolean) => set({ isChangeEmailLoading: value }),

  // Pending request
  pendingEmailRequest: null,
  setPendingEmailRequest: (value: PendingEmailRequest | null) => set({ pendingEmailRequest: value }),

  // Form state
  newEmail: '',
  setNewEmail: (value: string) => set({ newEmail: value }),

  // Modal state
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  // Actions
  clearForm: () => set({ newEmail: '' }),
  resetState: () => set({
    isChangeEmailLoading: false,
    pendingEmailRequest: null,
    newEmail: '',
    isModalOpen: false,
  }),
}))
