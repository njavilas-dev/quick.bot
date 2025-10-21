import React from 'react'
import {
  PopoverFooter as ChakraPopoverFooter,
  PopoverFooterProps as ChakraPopoverFooterProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverFooter = (props: ChakraPopoverFooterProps): IReactElement => {
  return <ChakraPopoverFooter {...props} />
}

PopoverFooter.displayName = 'PopoverFooter'
