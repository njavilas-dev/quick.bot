import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface SidebarSlideProviderContextProps {
  isExtended: boolean
  setIsExtended: React.Dispatch<React.SetStateAction<boolean>>
  isLocked: boolean
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>
  openSidebar: () => void
  cancelOpenSidebar: () => void
  closeSidebar: () => void
  cancelCloseSidebar: () => void
}

const SidebarSlideProviderContext = createContext<SidebarSlideProviderContextProps>({
  isExtended: false,
  setIsExtended: () => undefined,
  isLocked: false,
  setIsLocked: () => undefined,
  openSidebar: () => undefined,
  cancelOpenSidebar: () => undefined,
  closeSidebar: () => undefined,
  cancelCloseSidebar: () => undefined,
})

interface SidebarSlideProviderProps {
  children: ReactNode
}

export function SidebarSlideProvider({ children }: SidebarSlideProviderProps) {
  const [isExtended, setIsExtended] = useState(true)
  const [isLocked, setIsLocked] = useState(true)

  const debouncedOpenSidebar = useDebouncedCallback(() => {
    setIsExtended(true)
  }, 200)

  const debouncedCloseSidebar = useDebouncedCallback(() => {
    setIsExtended(false)
  }, 100)

  return (
    <SidebarSlideProviderContext.Provider
      value={{
        isExtended,
        setIsExtended,
        isLocked,
        setIsLocked,
        openSidebar: debouncedOpenSidebar,
        cancelOpenSidebar: debouncedOpenSidebar.cancel,
        closeSidebar: debouncedCloseSidebar,
        cancelCloseSidebar: debouncedCloseSidebar.cancel,
      }}
    >
      {children}
    </SidebarSlideProviderContext.Provider>
  )
}

export function useSidebarSlide(): SidebarSlideProviderContextProps {
  const context = useContext(SidebarSlideProviderContext)
  if (context === undefined) {
    throw new Error('useSidebarSlide must be used within a SidebarSlideProvider')
  }
  return context
}

export const SidebarSlideConsumer = SidebarSlideProviderContext.Consumer
