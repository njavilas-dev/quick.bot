import React from 'react'
import { PopoverTrigger as ChakraPopoverTrigger } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverTrigger = (props: { children: React.ReactNode }): IReactElement => {
  return <ChakraPopoverTrigger {...props} />
}

PopoverTrigger.displayName = 'PopoverTrigger'
