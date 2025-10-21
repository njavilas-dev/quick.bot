'use client'

import { UiProvider } from '@urbiport/ui'
import { localStorageManager } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

const colorModeManager = {
  ...localStorageManager,
  get: () => 'light',
  set: () => {},
}

export function Providers({ children }: ProvidersProps) {
  return <UiProvider colorModeManager={colorModeManager}>{children}</UiProvider>
}