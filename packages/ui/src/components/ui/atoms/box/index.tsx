import { Box as ChakraBox, BoxProps as ChakraBoxProps } from '@chakra-ui/react'
import React, { forwardRef } from 'react'

export const Box = forwardRef<HTMLDivElement, ChakraBoxProps>(({ children, ...props }, ref) => {
  return (
    <ChakraBox ref={ref} {...props}>
      {children}
    </ChakraBox>
  )
})

Box.displayName = 'Box'
