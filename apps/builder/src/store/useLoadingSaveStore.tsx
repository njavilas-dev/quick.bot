import { create } from 'zustand'

interface LoadingSaveState {
  isVisible: boolean
  message: string
  setIsVisible: (isVisible: boolean) => void
  setMessage: (message: string) => void
}

const useLoadingSaveStore = create<LoadingSaveState>((set) => ({
  isVisible: false,
  setIsVisible: (isVisible: boolean) => set({ isVisible }),
  message: '',
  setMessage: (message: string) => set({ message }),
}))

export default useLoadingSaveStore