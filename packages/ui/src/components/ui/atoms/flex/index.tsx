import { Flex as ChakraFlex, FlexProps as ChakraFlexProps } from '@chakra-ui/react'
import React, { forwardRef } from 'react'

export const Flex = forwardRef<HTMLDivElement, ChakraFlexProps>(({ children, ...props }, ref) => {
  return (
    <ChakraFlex ref={ref} {...props}>
      {children}
    </ChakraFlex>
  )
})

Flex.displayName = 'Flex'
