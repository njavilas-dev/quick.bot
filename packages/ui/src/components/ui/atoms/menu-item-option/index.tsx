import React, { ForwardedRef } from 'react'
import {
  MenuItemOption as ChakraMenuItemOption,
  MenuItemOptionProps as ChakraMenuItemOptionProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const MenuItemOption = React.forwardRef(
  (props: ChakraMenuItemOptionProps, ref: ForwardedRef<HTMLButtonElement>): IReactElement => {
    return <ChakraMenuItemOption ref={ref} {...props} />
  },
)
MenuItemOption.displayName = 'MenuItemOption'
