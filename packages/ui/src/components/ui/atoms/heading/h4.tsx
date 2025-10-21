import React from 'react'
import { chakra, HTMLChakraProps } from '@chakra-ui/react'

type HeadingProps = HTMLChakraProps<'h4'>

export const H4: React.FC<HeadingProps> = ({ children, ...props }) => (
  <chakra.h4 fontSize="sm" fontWeight="600" color="text.normal" {...props}>
    {children}
  </chakra.h4>
)

H4.displayName = 'H4'
