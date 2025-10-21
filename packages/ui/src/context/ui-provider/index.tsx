import React from 'react'
import { ChakraProvider, ChakraProviderProps } from '@chakra-ui/react'
import { IReactElement } from '../../shared/interfaces'
import { theme } from '../../theme'

export const UiProvider = (props: Omit<ChakraProviderProps, 'theme'>): IReactElement => {
  return <ChakraProvider theme={theme} {...props} />
}
