import React from 'react'
import { chakra, HTMLChakraProps } from '@chakra-ui/react'

type HeadingProps = HTMLChakraProps<'h2'>

export const H2: React.FC<HeadingProps> = ({ children, ...props }) => (
  <chakra.h2 fontSize="2xl" fontWeight="medium" color="text.normal" {...props}>
    {children}
  </chakra.h2>
)

H2.displayName = 'H2'
