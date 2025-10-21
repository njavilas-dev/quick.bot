import React from 'react'
import { chakra, HTMLChakraProps } from '@chakra-ui/react'

type HeadingProps = HTMLChakraProps<'h1'>

export const H1: React.FC<HeadingProps> = ({ children, ...props }) => (
  <chakra.h1 fontSize="3xl" fontWeight="medium" color="text.normal" {...props}>
    {children}
  </chakra.h1>
)

H1.displayName = 'H1'
