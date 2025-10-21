import React from 'react'
import { chakra, HTMLChakraProps } from '@chakra-ui/react'

type HeadingProps = HTMLChakraProps<'h3'>

export const H3: React.FC<HeadingProps> = ({ children, ...props }) => (
  <chakra.h3 fontSize="xl" fontWeight="medium" color="text.normal" {...props}>
    {children}
  </chakra.h3>
)

H3.displayName = 'H3'
