import React from 'react'
import {
  PopoverArrow as ChakraPopoverArrow,
  PopoverArrowProps as ChakraPopoverArrowProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverArrow = (props: ChakraPopoverArrowProps): IReactElement => {
  return <ChakraPopoverArrow {...props} />
}

PopoverArrow.displayName = 'PopoverArrow'
