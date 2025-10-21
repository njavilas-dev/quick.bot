import React from 'react'
import { PopoverBody, PopoverContent, Portal } from '@chakra-ui/react'

export const ControlPopoverContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Portal>
      <PopoverContent ml="24px" w="300px" p={0}>
        <PopoverBody p={4}>{children}</PopoverBody>
      </PopoverContent>
    </Portal>
  )
}
