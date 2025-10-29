import React, { createContext, useContext } from 'react'
import type { BubbleVariant } from '../../types/message.types'

interface BubbleContextValue {
  variant: BubbleVariant
}

const BubbleContext = createContext<BubbleContextValue | undefined>(undefined)

export const useBubbleVariant = (): BubbleVariant => {
  const context = useContext(BubbleContext)
  return context?.variant ?? 'host'
}

interface BubbleProviderProps {
  variant: BubbleVariant
  children: React.ReactNode
}

export const BubbleProvider: React.FC<BubbleProviderProps> = ({ variant, children }) => {
  return (
    <BubbleContext.Provider value={{ variant }}>
      {children}
    </BubbleContext.Provider>
  )
}
