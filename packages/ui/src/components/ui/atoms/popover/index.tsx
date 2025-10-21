import React from 'react'
import { Popover as ChakraPopover, PopoverProps as ChakraPopoverProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const Popover = (props: ChakraPopoverProps): IReactElement => {
  return <ChakraPopover {...props} />
}

Popover.displayName = 'Popover'